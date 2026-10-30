import { test, before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { startFakeSupabase, mockReq, mockRes } from './fakeSupabase.mjs'
import { generateInvitationToken, hashInvitationToken } from '../api/_lib/invitations.js'

/**
 * Exercises /api/admin/signup and the invitation half of /api/admin/team
 * against a stand-in Supabase, so the real authorisation path runs rather than
 * being reasoned about.
 */

const ADMIN_TOKEN = 'token-admin'
const PLAIN_TOKEN = 'token-plain'
const hourMs = 3600 * 1000

let fake
let signupHandler
let teamHandler

/** A live invitation plus its raw token. */
function seedInvitation(over = {}) {
  const token = generateInvitationToken()
  const row = {
    id: `inv-${Math.random().toString(36).slice(2, 8)}`,
    email: 'invitee@epineon.ai',
    token_hash: hashInvitationToken(token),
    expires_at: new Date(Date.now() + 48 * hourMs).toISOString(),
    accepted_at: null,
    revoked_at: null,
    accepted_user_id: null,
    created_by: 'uuid-admin',
    ...over,
  }
  fake.state.invitations.push(row)
  return { token, row }
}

const goodPassword = 'correct-horse-7'
const signupBody = (token, over = {}) => ({
  token,
  email: 'invitee@epineon.ai',
  password: goodPassword,
  confirmPassword: goodPassword,
  ...over,
})

const postSignup = async (body) => {
  const res = mockRes()
  await signupHandler(mockReq({ method: 'POST', body }), res)
  return res
}

const verifyToken = async (token) => {
  const res = mockRes()
  await signupHandler(mockReq({ method: 'GET', query: { token } }), res)
  return res
}

before(async () => {
  fake = await startFakeSupabase({
    users: {
      [ADMIN_TOKEN]: { id: 'uuid-admin', email: 'admin@epineon.ai' },
      [PLAIN_TOKEN]: { id: 'uuid-plain', email: 'nobody@example.com' },
    },
  })

  process.env.SUPABASE_URL = fake.url
  process.env.VITE_SUPABASE_URL = fake.url
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
  process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key'
  process.env.RATE_LIMIT_SALT = 'test-salt'
  process.env.PUBLIC_SITE_URL = 'https://epineon.test'

  signupHandler = (await import('../api/admin/signup.js')).default
  teamHandler = (await import('../api/admin/team.js')).default
})

after(async () => {
  await fake.close()
})

beforeEach(() => {
  // A clean allowlist + invitation set per test, so order cannot matter.
  fake.state.invitations.length = 0
  fake.state.authUsers.length = 0
  fake.state.admins.length = 0
  fake.state.admins.push(
    { id: 'row-admin', email: 'admin@epineon.ai', status: 'active', user_id: 'uuid-admin', last_seen_at: new Date().toISOString() },
    { id: 'row-invitee', email: 'invitee@epineon.ai', status: 'active', user_id: null, last_seen_at: null },
  )
  fake.state.rateLimitAllows = true
})

// ---------------------------------------------------------------- the basics

test('signup: rejects unsupported methods', async () => {
  const res = mockRes()
  await signupHandler(mockReq({ method: 'DELETE' }), res)
  assert.equal(res.statusCode, 405)
})

test('signup: returns 429 when the rate limiter says no', async () => {
  const { token } = seedInvitation()
  fake.state.rateLimitAllows = false
  const res = await postSignup(signupBody(token))
  assert.equal(res.statusCode, 429)
  assert.equal(fake.state.authUsers.length, 0)
})

// ------------------------------------------------------- GET: verify a link

test('verify: a live invitation reports the address it was issued for', async () => {
  const { token } = seedInvitation()
  const res = await verifyToken(token)
  assert.equal(res.statusCode, 200)
  assert.equal(res.payload.ok, true)
  assert.equal(res.payload.email, 'invitee@epineon.ai')
})

test('verify: an unknown token is refused', async () => {
  const res = await verifyToken(generateInvitationToken())
  assert.equal(res.statusCode, 400)
  assert.equal(res.payload.reason, 'unknown')
})

test('verify: a malformed token never reaches the database', async () => {
  const before = fake.state.calls.length
  const res = await verifyToken("junk'; drop table admin_users;--")
  assert.equal(res.statusCode, 400)
  // Rate-limit RPC only; no table query was issued.
  const paths = fake.state.calls.slice(before).map((c) => c.path)
  assert.ok(!paths.includes('/rest/v1/admin_invitations'), `queried the table: ${paths.join(', ')}`)
})

test('verify: an expired invitation is refused', async () => {
  const { token } = seedInvitation({ expires_at: new Date(Date.now() - hourMs).toISOString() })
  const res = await verifyToken(token)
  assert.equal(res.statusCode, 400)
  assert.equal(res.payload.reason, 'expired')
})

test('verify: an already-used invitation is refused', async () => {
  const { token } = seedInvitation({ accepted_at: new Date().toISOString() })
  const res = await verifyToken(token)
  assert.equal(res.statusCode, 400)
  assert.equal(res.payload.reason, 'used')
})

test('verify: a withdrawn invitation is refused', async () => {
  const { token } = seedInvitation({ revoked_at: new Date().toISOString() })
  const res = await verifyToken(token)
  assert.equal(res.statusCode, 400)
  assert.equal(res.payload.reason, 'revoked')
})

test('verify: a live invitation whose allowlist row was revoked is refused', async () => {
  const { token } = seedInvitation()
  fake.state.admins.find((r) => r.id === 'row-invitee').status = 'revoked'
  const res = await verifyToken(token)
  assert.equal(res.statusCode, 403)
})

// --------------------------------------------------- POST: refusing bad input

test('signup: refuses a request with no invitation at all', async () => {
  const res = await postSignup({ email: 'invitee@epineon.ai', password: goodPassword, confirmPassword: goodPassword })
  assert.equal(res.statusCode, 400)
  assert.equal(res.payload.field, 'token')
  assert.equal(fake.state.authUsers.length, 0)
})

test('signup: refuses an unknown invitation', async () => {
  const res = await postSignup(signupBody(generateInvitationToken()))
  assert.equal(res.statusCode, 400)
  assert.equal(res.payload.reason, 'unknown')
  assert.equal(fake.state.authUsers.length, 0)
})

test('signup: refuses an expired invitation', async () => {
  const { token } = seedInvitation({ expires_at: new Date(Date.now() - hourMs).toISOString() })
  const res = await postSignup(signupBody(token))
  assert.equal(res.statusCode, 400)
  assert.equal(res.payload.reason, 'expired')
  assert.equal(fake.state.authUsers.length, 0)
})

test('signup: refuses a withdrawn invitation', async () => {
  const { token } = seedInvitation({ revoked_at: new Date().toISOString() })
  const res = await postSignup(signupBody(token))
  assert.equal(res.statusCode, 400)
  assert.equal(res.payload.reason, 'revoked')
  assert.equal(fake.state.authUsers.length, 0)
})

test('signup: refuses an invitation already marked used', async () => {
  const { token } = seedInvitation({ accepted_at: new Date().toISOString() })
  const res = await postSignup(signupBody(token))
  assert.equal(res.statusCode, 400)
  assert.equal(res.payload.reason, 'used')
  assert.equal(fake.state.authUsers.length, 0)
})

test('signup: a token cannot be redirected to another address', async () => {
  const { token } = seedInvitation()
  fake.state.admins.push({ id: 'row-other', email: 'attacker@example.com', status: 'active', user_id: null, last_seen_at: null })
  const res = await postSignup(signupBody(token, { email: 'attacker@example.com' }))
  assert.equal(res.statusCode, 400)
  assert.equal(res.payload.field, 'email')
  assert.equal(fake.state.authUsers.length, 0)
})

test('signup: refuses an invited address that is not on the active allowlist', async () => {
  const { token } = seedInvitation({ email: 'ghost@epineon.ai' })
  const res = await postSignup(signupBody(token, { email: 'ghost@epineon.ai' }))
  assert.equal(res.statusCode, 403)
  assert.equal(fake.state.authUsers.length, 0)
})

test('signup: refuses a weak password without consuming the invitation', async () => {
  const { token, row } = seedInvitation()
  const res = await postSignup(signupBody(token, { password: 'short', confirmPassword: 'short' }))
  assert.equal(res.statusCode, 400)
  assert.equal(res.payload.field, 'password')
  assert.equal(fake.state.authUsers.length, 0)
  assert.equal(fake.state.invitations.find((r) => r.id === row.id).accepted_at, null)
})

test('signup: refuses a mismatched confirmation even though the browser checks it too', async () => {
  const { token } = seedInvitation()
  const res = await postSignup(signupBody(token, { confirmPassword: 'different-pass-9' }))
  assert.equal(res.statusCode, 400)
  assert.equal(res.payload.field, 'confirmPassword')
  assert.equal(fake.state.authUsers.length, 0)
})

// ------------------------------------------------------ POST: the happy path

test('signup: a valid invitation creates a confirmed account and links the allowlist row', async () => {
  const { token, row } = seedInvitation()
  const res = await postSignup(signupBody(token))

  assert.equal(res.statusCode, 200)
  assert.equal(res.payload.ok, true)

  // The auth account exists, is confirmed without any email round-trip, and
  // carries the password the invitee chose — the preconditions for signing in.
  assert.equal(fake.state.authUsers.length, 1)
  const created = fake.state.authUsers[0]
  assert.equal(created.email, 'invitee@epineon.ai')
  assert.ok(created.email_confirmed_at, 'account was not confirmed')
  assert.equal(created.password_set, true)

  // The invitation is spent and records who spent it.
  const invitation = fake.state.invitations.find((r) => r.id === row.id)
  assert.ok(invitation.accepted_at, 'invitation was not claimed')
  assert.equal(invitation.accepted_user_id, created.id)

  // The allowlist row is now bound to the auth user, so requireAdmin() matches
  // on user_id from here on.
  const allowlist = fake.state.admins.find((r) => r.id === 'row-invitee')
  assert.equal(allowlist.user_id, created.id)
  assert.equal(allowlist.status, 'active')
})

test('signup: the same link cannot be used twice', async () => {
  const { token } = seedInvitation()

  const first = await postSignup(signupBody(token))
  assert.equal(first.statusCode, 200)
  assert.equal(fake.state.authUsers.length, 1)

  const second = await postSignup(signupBody(token))
  assert.ok(second.statusCode >= 400, 'a reused link was accepted')
  assert.ok(['used', 'account-exists'].includes(second.payload.reason), `unexpected reason ${second.payload.reason}`)
  // Crucially, no second account.
  assert.equal(fake.state.authUsers.length, 1)
})

test('signup: no client-supplied privilege field can elevate anyone', async () => {
  const { token } = seedInvitation()
  const res = await postSignup(signupBody(token, {
    status: 'active',
    role: 'admin',
    isAdmin: true,
    is_admin: true,
    user_id: 'uuid-attacker',
    invited_by: 'uuid-attacker',
    accepted_at: null,
  }))

  assert.equal(res.statusCode, 200)
  const allowlist = fake.state.admins.find((r) => r.id === 'row-invitee')
  // The row is bound to the real new user, never to the id the caller supplied.
  assert.equal(allowlist.user_id, fake.state.authUsers[0].id)
  assert.notEqual(allowlist.user_id, 'uuid-attacker')
  // And no extra allowlist row appeared from the injected fields.
  assert.equal(fake.state.admins.filter((r) => r.email === 'invitee@epineon.ai').length, 1)
})

test('signup: an address that already has an account is refused, and the invitation survives', async () => {
  const { token, row } = seedInvitation()
  fake.state.authUsers.push({ id: 'uuid-existing', email: 'invitee@epineon.ai' })

  const res = await postSignup(signupBody(token))
  assert.equal(res.statusCode, 409)
  assert.equal(res.payload.reason, 'account-exists')
  // No password was overwritten.
  assert.equal(fake.state.authUsers.length, 1)
  assert.equal(fake.state.authUsers[0].id, 'uuid-existing')
  // The claim was released, so a genuine mix-up is recoverable.
  assert.equal(fake.state.invitations.find((r) => r.id === row.id).accepted_at, null)
})

// -------------------------------------------------- minting, via /admin/team

test('team: an anonymous caller cannot mint an invitation', async () => {
  const res = mockRes()
  await teamHandler(mockReq({ method: 'POST', body: { email: 'outsider@example.com' } }), res)
  assert.equal(res.statusCode, 401)
  assert.equal(fake.state.invitations.length, 0)
})

test('team: a signed-in non-admin cannot mint an invitation', async () => {
  const res = mockRes()
  await teamHandler(
    mockReq({ method: 'POST', headers: { authorization: `Bearer ${PLAIN_TOKEN}` }, body: { email: 'outsider@example.com' } }),
    res,
  )
  assert.equal(res.statusCode, 403)
  assert.equal(fake.state.invitations.length, 0)
})

test('team: an admin mints a link that the sign-up endpoint then accepts', async () => {
  const res = mockRes()
  await teamHandler(
    mockReq({ method: 'POST', headers: { authorization: `Bearer ${ADMIN_TOKEN}` }, body: { email: 'fresh@epineon.ai' } }),
    res,
  )
  assert.equal(res.statusCode, 200)
  assert.equal(res.payload.invited, true)
  assert.ok(res.payload.signupUrl, 'no sign-up link was returned')

  const url = new URL(res.payload.signupUrl)
  assert.equal(url.pathname, '/admin/signup')
  assert.equal(url.origin, 'https://epineon.test')
  const token = url.searchParams.get('token')

  // Only the hash is stored — the response is the one and only sight of it.
  const stored = fake.state.invitations.find((r) => r.email === 'fresh@epineon.ai')
  assert.equal(stored.token_hash, hashInvitationToken(token))
  assert.ok(!JSON.stringify(fake.state.invitations).includes(token))

  // End to end: the minted link works.
  const verified = await verifyToken(token)
  assert.equal(verified.statusCode, 200)
  assert.equal(verified.payload.email, 'fresh@epineon.ai')
})

test('team: re-inviting supersedes the previous link', async () => {
  const first = mockRes()
  await teamHandler(
    mockReq({ method: 'POST', headers: { authorization: `Bearer ${ADMIN_TOKEN}` }, body: { email: 'fresh@epineon.ai' } }),
    first,
  )
  const firstToken = new URL(first.payload.signupUrl).searchParams.get('token')

  const second = mockRes()
  await teamHandler(
    mockReq({ method: 'POST', headers: { authorization: `Bearer ${ADMIN_TOKEN}` }, body: { email: 'fresh@epineon.ai' } }),
    second,
  )
  const secondToken = new URL(second.payload.signupUrl).searchParams.get('token')
  assert.notEqual(firstToken, secondToken)

  assert.equal((await verifyToken(firstToken)).statusCode, 400)
  assert.equal((await verifyToken(secondToken)).statusCode, 200)
})

test('team: revoking access also kills the outstanding link', async () => {
  const minted = mockRes()
  await teamHandler(
    mockReq({ method: 'POST', headers: { authorization: `Bearer ${ADMIN_TOKEN}` }, body: { email: 'fresh@epineon.ai' } }),
    minted,
  )
  const token = new URL(minted.payload.signupUrl).searchParams.get('token')
  const row = fake.state.admins.find((r) => r.email === 'fresh@epineon.ai')

  const revoked = mockRes()
  await teamHandler(
    mockReq({ method: 'PATCH', headers: { authorization: `Bearer ${ADMIN_TOKEN}` }, body: { id: row.id, status: 'revoked' } }),
    revoked,
  )
  assert.equal(revoked.statusCode, 200)

  const after = await verifyToken(token)
  assert.ok(after.statusCode >= 400, 'a revoked member could still use their link')
})

test('team: listing never exposes a token hash', async () => {
  seedInvitation()
  const res = mockRes()
  await teamHandler(mockReq({ method: 'GET', headers: { authorization: `Bearer ${ADMIN_TOKEN}` } }), res)
  assert.equal(res.statusCode, 200)
  assert.ok(Array.isArray(res.payload.invitations))
  assert.ok(!JSON.stringify(res.payload).includes('token_hash'))
})

test('signup errors never leak internals', async () => {
  const res = await postSignup(signupBody(generateInvitationToken()))
  const text = JSON.stringify(res.payload)
  for (const leak of ['service_role', 'supabase.co', 'postgres', 'SUPABASE', 'token_hash', 'stack']) {
    assert.ok(!text.includes(leak), `response leaked ${leak}`)
  }
})
