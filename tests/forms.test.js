import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { startFakeSupabase, mockReq, mockRes } from './fakeSupabase.mjs'
import {
  FORMS,
  FORM_IDS,
  LEGACY_FORM_ID,
  isKnownFormId,
  resolveFormId,
  formNameFor,
  displayFormName,
} from '../api/_lib/forms.js'
import { validateSubmission, LIMITS } from '../api/_lib/validation.js'

/**
 * The form registry, the server-side resolution rules, and the end-to-end path
 * from a POST to the row that lands in contact_messages.
 */

// Mirrors the CHECK constraint in
// supabase/migrations/20261102000000_submission_forms.sql.
const DB_FORM_ID_SHAPE = /^[a-z0-9][a-z0-9_-]{0,39}$/

// ------------------------------------------------------------- the registry

test('registry: ids are unique, well-shaped and storable', () => {
  assert.equal(new Set(FORM_IDS).size, FORM_IDS.length, 'duplicate form id')
  for (const form of FORMS) {
    assert.match(form.id, DB_FORM_ID_SHAPE, `${form.id} would violate the DB check constraint`)
    assert.ok(form.name && form.name.trim(), `${form.id} has no display name`)
  }
})

test('registry: exactly one legacy bucket, and it is the fallback', () => {
  const legacy = FORMS.filter((f) => f.legacy)
  assert.equal(legacy.length, 1)
  assert.equal(legacy[0].id, LEGACY_FORM_ID)
})

/**
 * Drift guard. The dashboard's sections come from the registry, but the forms
 * themselves are defined in the Contact page. If a tab is added or renamed
 * there without updating the registry, its submissions would silently fall into
 * the legacy bucket — so fail here instead, at build time.
 */
test('registry: matches the tabs the Contact page actually renders', () => {
  const source = readFileSync(new URL('../src/pages/Contact.jsx', import.meta.url), 'utf8')
  const tabs = [...source.matchAll(/id:\s*'([^']+)',\s*\n\s*label:\s*'([^']+)',/g)]
    .map(([, id, label]) => ({ id, label }))

  assert.ok(tabs.length >= 3, 'could not find the form tabs in Contact.jsx')

  for (const tab of tabs) {
    assert.ok(isKnownFormId(tab.id), `form "${tab.id}" is on the site but missing from api/_lib/forms.js`)
    assert.equal(
      formNameFor(tab.id),
      tab.label,
      `form "${tab.id}" is labelled "${tab.label}" on the site but "${formNameFor(tab.id)}" in the registry`,
    )
  }

  // Every non-legacy registry entry must correspond to a real tab.
  for (const form of FORMS.filter((f) => !f.legacy)) {
    assert.ok(
      tabs.some((tab) => tab.id === form.id),
      `registry lists "${form.id}" but no such form exists on the site`,
    )
  }
})

// ------------------------------------------------------------- resolution

test('resolveFormId: accepts known ids, including odd casing and padding', () => {
  assert.equal(resolveFormId('demo'), 'demo')
  assert.equal(resolveFormId('  SALES  '), 'sales')
  assert.equal(resolveFormId('Partnerships'), 'partnerships')
})

test('resolveFormId: anything unrecognised falls back rather than throwing', () => {
  for (const value of [
    undefined, null, '', '   ', 42, {}, [], true,
    'nope', 'admin', '../../etc/passwd', '<script>alert(1)</script>',
    "demo'; drop table contact_messages; --",
    'demo,sales', 'DEMO '.repeat(50),
  ]) {
    assert.equal(resolveFormId(value), LEGACY_FORM_ID, `${JSON.stringify(value)} should fall back`)
  }
})

test('resolveFormId: always returns something the database will accept', () => {
  for (const value of ['demo', 'bogus', null, '<script>']) {
    assert.match(resolveFormId(value), DB_FORM_ID_SHAPE)
  }
})

test('displayFormName: never hides a row with an unregistered id', () => {
  assert.equal(displayFormName('demo', 'Ignored'), 'Demo request') // registry wins
  assert.equal(displayFormName('mystery', 'Stored name'), 'Stored name')
  assert.equal(displayFormName('mystery', ''), 'mystery')
  assert.equal(displayFormName('', ''), 'Unknown form')
})

// ------------------------------------------------------- validateSubmission

const valid = (over = {}) => ({
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  subject: 'Demo request',
  message: 'We would like a demo of EPICRYPT for our analytics team.',
  ...over,
})

test('validate: derives form_id and form_name from the registry', () => {
  const r = validateSubmission(valid({ formId: 'partnerships' }))
  assert.equal(r.ok, true)
  assert.equal(r.value.form_id, 'partnerships')
  assert.equal(r.value.form_name, 'Partnerships & Ventures')
})

test('validate: a client-supplied form name is ignored entirely', () => {
  const r = validateSubmission(
    valid({ formId: 'demo', formName: '<img onerror=alert(1)>', form_name: 'Board of Directors' }),
  )
  assert.equal(r.ok, true)
  assert.equal(r.value.form_name, 'Demo request')
})

test('validate: an unknown form id still stores the message, in the legacy bucket', () => {
  const r = validateSubmission(valid({ formId: 'invented-by-the-client' }))
  assert.equal(r.ok, true, 'a stale bundle must still be able to submit')
  assert.equal(r.value.form_id, LEGACY_FORM_ID)
  assert.equal(r.value.form_name, 'Contact')
})

test('validate: a submission with no form id at all is accepted (pre-registry clients)', () => {
  const r = validateSubmission(valid())
  assert.equal(r.ok, true)
  assert.equal(r.value.form_id, LEGACY_FORM_ID)
})

test('validate: company is optional, normalised and length-capped', () => {
  assert.equal(validateSubmission(valid()).value.company, null)
  assert.equal(validateSubmission(valid({ company: '   ' })).value.company, null)
  assert.equal(validateSubmission(valid({ company: '  Acme   Ltd ' })).value.company, 'Acme Ltd')

  const tooLong = validateSubmission(valid({ company: 'x'.repeat(LIMITS.company + 1) }))
  assert.equal(tooLong.ok, false)
  assert.equal(tooLong.field, 'company')
})

// --------------------------------------------------------------- end to end

let fake
let contactHandler

before(async () => {
  fake = await startFakeSupabase({ users: {}, admins: [] })
  process.env.SUPABASE_URL = fake.url
  process.env.VITE_SUPABASE_URL = fake.url
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
  process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key'
  process.env.RATE_LIMIT_SALT = 'test-salt'
  contactHandler = (await import('../api/contact.js')).default
})

after(async () => {
  await fake.close()
})

/** Submit through the real handler and return the row it stored. */
async function submit(body) {
  fake.state.inserted.length = 0
  const res = mockRes()
  await contactHandler(mockReq({ body: { ...valid(), ...body } }), res)
  assert.equal(res.statusCode, 200, `submission failed: ${JSON.stringify(res.payload)}`)
  assert.equal(fake.state.inserted.length, 1)
  return fake.state.inserted[0]
}

test('end to end: every form on the site files under its own id', async () => {
  for (const form of FORMS.filter((f) => !f.legacy)) {
    const row = await submit({ formId: form.id, subject: form.name, company: 'Acme Ltd' })
    assert.equal(row.form_id, form.id, `${form.name} filed under ${row.form_id}`)
    assert.equal(row.form_name, form.name)
    assert.equal(row.company, 'Acme Ltd')
  }
})

test('end to end: a forged form id cannot choose its own section', async () => {
  const row = await submit({ formId: 'board-only', formName: 'Board only' })
  assert.equal(row.form_id, LEGACY_FORM_ID)
  assert.equal(row.form_name, 'Contact')
})

test('end to end: the stored row carries no client-controlled form_name key', async () => {
  const row = await submit({ formId: 'sales', form_name: 'Spoofed' })
  assert.equal(row.form_name, 'Sales & Enterprise')
})
