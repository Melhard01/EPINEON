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
  inferFormId,
  formLabelForRow,
  parseSubmissionBody,
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
  // Was 'Unknown form'. An administrator should never be shown that: with
  // nothing to go on the row belongs to the legacy bucket, which has a name.
  assert.equal(displayFormName('', ''), 'Contact')
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

// ------------------------------------------------- inference over real rows

test('inferFormId: a correct form_id is believed', () => {
  assert.equal(inferFormId({ form_id: 'demo' }), 'demo')
  assert.equal(inferFormId({ form_id: 'sales' }), 'sales')
  assert.equal(inferFormId({ form_id: 'partnerships' }), 'partnerships')
})

test('inferFormId: other spellings of the same form are aliased, not lost', () => {
  for (const [stored, expected] of [
    ['demo_request', 'demo'],
    ['demo-request', 'demo'],
    ['book_a_demo', 'demo'],
    ['sales_inquiry', 'sales'],
    ['sales_enterprise', 'sales'],
    ['enterprise', 'sales'],
    ['partnership_inquiry', 'partnerships'],
    ['partnership', 'partnerships'],
    ['ventures', 'partnerships'],
    ['  DEMO_REQUEST  ', 'demo'],
  ]) {
    assert.equal(inferFormId({ form_id: stored }), expected, `${stored} should map to ${expected}`)
  }
})

/**
 * The case behind the form tabs all reading 0: rows written before form_id
 * existed, or whose backfill did not match, sit on the 'contact' default. The
 * old client always put the tab label in `subject` and opened the body with
 * "[Label]", so the form is still recoverable.
 */
test('inferFormId: falls back to the subject when form_id is the backfill default', () => {
  assert.equal(inferFormId({ form_id: 'contact', subject: 'Demo request' }), 'demo')
  assert.equal(inferFormId({ form_id: 'contact', subject: 'Sales & Enterprise' }), 'sales')
  assert.equal(inferFormId({ form_id: null, subject: 'Partnerships & Ventures' }), 'partnerships')
  assert.equal(inferFormId({ subject: 'partnerships & ventures' }), 'partnerships')
})

test('inferFormId: falls back to the [Label] prefix in the message body', () => {
  assert.equal(
    inferFormId({ form_id: null, subject: '', message: '[Sales & Enterprise]\nCompany: Acme' }),
    'sales',
  )
  assert.equal(inferFormId({ message: '[Demo request]\nCompany or organisation: Acme' }), 'demo')
})

test('inferFormId: a genuinely unidentifiable row lands in the legacy bucket', () => {
  assert.equal(inferFormId({ form_id: null, subject: 'General enquiry' }), LEGACY_FORM_ID)
  assert.equal(inferFormId({}), LEGACY_FORM_ID)
  assert.equal(inferFormId(null), LEGACY_FORM_ID)
  assert.equal(inferFormId('not an object'), LEGACY_FORM_ID)
})

test('formLabelForRow never says "Unknown form"', () => {
  const rows = [
    {}, null, undefined, { form_id: '' }, { form_id: null, form_name: null },
    { form_id: 'contact' }, { form_id: 'mystery' }, { form_id: 'mystery', form_name: 'Some Old Form' },
    { form_id: null, subject: 'Demo request' }, { form_id: 'demo_request' },
  ]
  for (const row of rows) {
    const label = formLabelForRow(row)
    assert.ok(label && label.trim(), `empty label for ${JSON.stringify(row)}`)
    assert.notEqual(label, 'Unknown form', `"Unknown form" for ${JSON.stringify(row)}`)
  }
  assert.equal(formLabelForRow({ form_id: 'demo_request' }), 'Demo request')
  assert.equal(formLabelForRow({ form_id: 'mystery', form_name: 'Some Old Form' }), 'Some Old Form')
  assert.equal(formLabelForRow({}), 'Contact')
})

test('displayFormName keeps working and also never says "Unknown form"', () => {
  assert.equal(displayFormName('demo', 'ignored'), 'Demo request')
  assert.equal(displayFormName('mystery', 'Stored'), 'Stored')
  assert.equal(displayFormName(undefined, undefined), 'Contact')
})

test('resolveFormId accepts an alias, so a renamed client still files correctly', () => {
  assert.equal(resolveFormId('demo_request'), 'demo')
  assert.equal(resolveFormId('sales_inquiry'), 'sales')
  assert.equal(resolveFormId('partnership_inquiry'), 'partnerships')
})

// --------------------------------------------- taking a stored body apart

const demoBody = [
  '[Demo request]',
  'Company or organisation: test',
  'Role: —',
  'Product of interest: EPIWELL',
  'What would you like to see?: textvATVXUBAsxb',
].join('\n')

test('parse: the message box gets only what the visitor wrote', () => {
  const { message } = parseSubmissionBody({ form_id: 'demo', message: demoBody })
  assert.equal(message, 'textvATVXUBAsxb')
})

test('parse: the other answers come back as fields, blanks dropped', () => {
  const { fields } = parseSubmissionBody({ form_id: 'demo', message: demoBody })
  assert.deepEqual(fields, [
    { label: 'Company or organisation', value: 'test' },
    { label: 'Product of interest', value: 'EPIWELL' },
  ])
  assert.ok(!fields.some((f) => f.label === 'Role'), 'a blank answer should not take up a row')
})

test('parse: each form names its own message field', () => {
  assert.equal(parseSubmissionBody({ form_id: 'demo', message: demoBody }).messageLabel, 'What would you like to see?')
  assert.equal(parseSubmissionBody({ form_id: 'sales', message: '[Sales & Enterprise]\nMessage: hi' }).messageLabel, 'Message')
  assert.equal(
    parseSubmissionBody({ form_id: 'partnerships', message: '[Partnerships & Ventures]\nNature of partnership: joint research' }).messageLabel,
    'Nature of partnership',
  )
  // Unknown shape still gets a sensible heading.
  assert.equal(parseSubmissionBody({ form_id: 'contact', message: 'anything' }).messageLabel, 'Message')
})

test('parse: a colon inside the free text does not start a phantom field', () => {
  const body = '[Sales & Enterprise]\nCompany: Acme\nMessage: Budget: unknown\nTimeline: Q1'
  const { fields, message } = parseSubmissionBody({ form_id: 'sales', message: body })
  assert.deepEqual(fields, [{ label: 'Company', value: 'Acme' }])
  assert.equal(message, 'Budget: unknown\nTimeline: Q1', 'a multi-line answer keeps its line breaks')
})

test('parse: a body it cannot read is handed back whole, never swallowed', () => {
  for (const row of [
    { form_id: 'contact', message: 'A message that predates form_id.' },
    { form_id: 'demo', message: 'written by hand, no labels at all' },
    { form_id: 'demo', message: '[Demo request]\nfree text with no labels' },
  ]) {
    const { message } = parseSubmissionBody(row)
    assert.ok(message.length > 0, `lost the body of ${JSON.stringify(row.message)}`)
  }
})

test('parse: an empty message reports empty rather than an em dash', () => {
  const body = '[Demo request]\nCompany or organisation: X\nWhat would you like to see?: —'
  const parsed = parseSubmissionBody(body ? { form_id: 'demo', message: body } : null)
  assert.equal(parsed.message, '')
  assert.deepEqual(parsed.fields, [{ label: 'Company or organisation', value: 'X' }])
})

test('parse: survives a missing or malformed row', () => {
  for (const row of [null, undefined, {}, { message: null }, 'nope']) {
    const parsed = parseSubmissionBody(row)
    assert.ok(Array.isArray(parsed.fields))
    assert.equal(typeof parsed.message, 'string')
    assert.ok(parsed.messageLabel)
  }
})

/**
 * Drift guard. The parser splits on the registry's field labels, so a label
 * renamed on the form without being renamed here would silently stop matching
 * and dump the whole body back into the message box.
 */
test('registry field labels match the Contact page, in order', () => {
  const source = readFileSync(new URL('../src/pages/Contact.jsx', import.meta.url), 'utf8')
  const stop = source.indexOf('const inputClass')
  assert.ok(stop > 0, 'could not find the end of the form definitions')

  for (const form of FORMS.filter((f) => !f.legacy)) {
    const from = source.indexOf(`id: '${form.id}'`)
    assert.ok(from > 0, `no tab with id '${form.id}' in Contact.jsx`)
    // Up to the next tab's id, or the end of the definitions.
    const nextIds = FORMS.filter((f) => !f.legacy)
      .map((f) => source.indexOf(`id: '${f.id}'`))
      .filter((i) => i > from)
    const to = Math.min(stop, ...(nextIds.length ? nextIds : [stop]))

    const labels = [...source.slice(from, to).matchAll(/name:\s*'([^']+)',\s*label:\s*'([^']+)'/g)]
      .filter(([, name]) => !['name', 'email'].includes(name))
      .map(([, , label]) => label)

    assert.deepEqual(labels, form.fields, `field labels for "${form.id}" have drifted`)
    assert.ok(
      form.fields.includes(form.messageField),
      `messageField "${form.messageField}" is not one of ${form.id}'s fields`,
    )
  }
})
