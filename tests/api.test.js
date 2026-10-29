import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { startFakeSupabase, mockReq, mockRes } from './fakeSupabase.mjs'

/**
 * Exercises the real serverless handlers against a stand-in Supabase, so the
 * authentication and authorisation paths are actually executed rather than
 * reasoned about.
 */

const ADMIN_TOKEN = 'token-admin'
const PLAIN_TOKEN = 'token-plain'
const REVOKED_TOKEN = 'token-revoked'

let fake
let contactHandler
let teamHandler

before(async () => {
  fake = await startFakeSupabase({
    users: {
      [ADMIN_TOKEN]: { id: 'uuid-admin', email: 'admin@epineon.ai' },
      [PLAIN_TOKEN]: { id: 'uuid-plain', email: 'nobody@example.com' },
      [REVOKED_TOKEN]: { id: 'uuid-revoked', email: 'former@epineon.ai' },
    },
    admins: [],
  })

  process.env.SUPABASE_URL = fake.url
  process.env.VITE_SUPABASE_URL = fake.url
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
  process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key'
  process.env.RATE_LIMIT_SALT = 'test-salt'

  contactHandler = (await import('../api/contact.js')).default
  teamHandler = (await import('../api/admin/team.js')).default
})

after(async () => {
  await fake.close()
})

const goodBody = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  subject: 'Demo request',
  message: 'We would like a demo of EPICRYPT for our analytics team.',
}

// --------------------------------------------------------------- /api/contact

test('contact: rejects non-POST methods', async () => {
  const res = mockRes()
  await contactHandler(mockReq({ method: 'GET' }), res)
  assert.equal(res.statusCode, 405)
})

test('contact: stores a valid submission', async () => {
  fake.state.inserted.length = 0
  const res = mockRes()
  await contactHandler(mockReq({ body: goodBody }), res)
  assert.equal(res.statusCode, 200)
  assert.equal(res.payload.ok, true)
  assert.equal(fake.state.inserted.length, 1)
  assert.equal(fake.state.inserted[0].email, 'ada@example.com')
})

test('contact: never stores a raw IP address', async () => {
  fake.state.inserted.length = 0
  const res = mockRes()
  await contactHandler(mockReq({ body: goodBody, headers: { 'x-forwarded-for': '198.51.100.7' } }), res)
  const row = fake.state.inserted[0]
  assert.ok(row.ip_hash && row.ip_hash.length === 32)
  assert.ok(!JSON.stringify(row).includes('198.51.100.7'))
})

test('contact: rejects invalid input without storing anything', async () => {
  fake.state.inserted.length = 0
  const res = mockRes()
  await contactHandler(mockReq({ body: { ...goodBody, email: 'not-an-email' } }), res)
  assert.equal(res.statusCode, 400)
  assert.equal(fake.state.inserted.length, 0)
})

test('contact: silently rejects honeypot hits with a generic message', async () => {
  fake.state.inserted.length = 0
  const res = mockRes()
  await contactHandler(mockReq({ body: { ...goodBody, companyWebsite: 'spam' } }), res)
  assert.equal(res.statusCode, 400)
  assert.equal(fake.state.inserted.length, 0)
  assert.ok(!/honeypot/i.test(JSON.stringify(res.payload)))
})

test('contact: refuses an oversized body', async () => {
  const res = mockRes()
  await contactHandler(mockReq({ body: goodBody, headers: { 'content-length': String(64 * 1024) } }), res)
  assert.equal(res.statusCode, 413)
})

test('contact: returns 429 when the rate limiter says no', async () => {
  fake.state.rateLimitAllows = false
  const res = mockRes()
  await contactHandler(mockReq({ body: goodBody }), res)
  fake.state.rateLimitAllows = true
  assert.equal(res.statusCode, 429)
})

// ------------------------------------------------------------ /api/admin/team

test('team: denies a request with no token', async () => {
  const res = mockRes()
  await teamHandler(mockReq({ method: 'GET' }), res)
  assert.equal(res.statusCode, 401)
})

test('team: denies a forged or unknown token', async () => {
  const res = mockRes()
  await teamHandler(mockReq({ method: 'GET', headers: { authorization: 'Bearer made-up' } }), res)
  assert.equal(res.statusCode, 401)
})

test('team: denies an authenticated user who is not on the allowlist', async () => {
  fake.state.admins = []
  const res = mockRes()
  await teamHandler(mockReq({ method: 'GET', headers: { authorization: `Bearer ${PLAIN_TOKEN}` } }), res)
  assert.equal(res.statusCode, 403)
})

test('team: denies a revoked administrator', async () => {
  fake.state.admins = [{ id: 'row-1', email: 'former@epineon.ai', status: 'revoked', user_id: 'uuid-revoked' }]
  const res = mockRes()
  await teamHandler(mockReq({ method: 'GET', headers: { authorization: `Bearer ${REVOKED_TOKEN}` } }), res)
  assert.equal(res.statusCode, 403)
})

test('team: allows an active administrator to list members', async () => {
  fake.state.admins = [{ id: 'row-1', email: 'admin@epineon.ai', status: 'active', user_id: 'uuid-admin' }]
  const res = mockRes()
  await teamHandler(mockReq({ method: 'GET', headers: { authorization: `Bearer ${ADMIN_TOKEN}` } }), res)
  assert.equal(res.statusCode, 200)
  assert.equal(res.payload.ok, true)
  assert.ok(Array.isArray(res.payload.members))
})

test('team: a non-admin cannot invite anyone', async () => {
  fake.state.admins = []
  const res = mockRes()
  await teamHandler(
    mockReq({ method: 'POST', headers: { authorization: `Bearer ${PLAIN_TOKEN}` }, body: { email: 'x@y.com' } }),
    res,
  )
  assert.equal(res.statusCode, 403)
})

test('team: an admin cannot revoke their own access', async () => {
  fake.state.admins = [{ id: 'row-1', email: 'admin@epineon.ai', status: 'active', user_id: 'uuid-admin' }]
  const res = mockRes()
  await teamHandler(
    mockReq({ method: 'PATCH', headers: { authorization: `Bearer ${ADMIN_TOKEN}` }, body: { id: 'row-1', status: 'revoked' } }),
    res,
  )
  assert.equal(res.statusCode, 409)
})

test('team: rejects unsupported methods', async () => {
  const res = mockRes()
  await teamHandler(mockReq({ method: 'DELETE', headers: { authorization: `Bearer ${ADMIN_TOKEN}` } }), res)
  assert.equal(res.statusCode, 405)
})

test('error responses never leak internals', async () => {
  const res = mockRes()
  await contactHandler(mockReq({ body: { ...goodBody, email: 'bad' } }), res)
  const text = JSON.stringify(res.payload)
  for (const leak of ['service_role', 'supabase.co', 'postgres', 'SUPABASE', 'stack']) {
    assert.ok(!text.includes(leak), `response leaked ${leak}`)
  }
})
