import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  validateSubmission,
  normaliseLine,
  normaliseText,
  stripControlChars,
  isValidEmail,
  isValidStatus,
  LIMITS,
  TIMING,
} from '../api/_lib/validation.js'

const valid = (over = {}) => ({
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  subject: 'Demo request',
  message: 'We would like a demo of EPICRYPT for our team.',
  ...over,
})

test('accepts a well-formed submission and normalises it', () => {
  const r = validateSubmission(valid({ name: '  Ada   Lovelace ', email: 'Ada@Example.COM ' }))
  assert.equal(r.ok, true)
  assert.equal(r.value.name, 'Ada Lovelace')
  assert.equal(r.value.email, 'ada@example.com')
})

test('rejects a missing or malformed email', () => {
  for (const email of ['', 'nope', 'a@b', 'a b@c.com', 'a@@b.com', 'x'.repeat(250) + '@b.com']) {
    assert.equal(validateSubmission(valid({ email })).ok, false, `should reject ${email}`)
  }
})

test('rejects empty, too-short and oversized fields', () => {
  assert.equal(validateSubmission(valid({ name: '   ' })).ok, false)
  assert.equal(validateSubmission(valid({ message: 'hi' })).ok, false)
  assert.equal(validateSubmission(valid({ name: 'x'.repeat(LIMITS.name + 1) })).ok, false)
  assert.equal(validateSubmission(valid({ message: 'x'.repeat(LIMITS.message + 1) })).ok, false)
  assert.equal(validateSubmission(valid({ subject: 'x'.repeat(LIMITS.subject + 1) })).ok, false)
})

test('rejects a filled honeypot without revealing why', () => {
  const r = validateSubmission(valid({ companyWebsite: 'http://spam.example' }))
  assert.equal(r.ok, false)
  assert.equal(r.field, 'honeypot')
})

test('rejects a form submitted faster than a human could fill it', () => {
  const r = validateSubmission(valid({ formStartedAt: Date.now() - (TIMING.minMs - 500) }))
  assert.equal(r.ok, false)
  assert.equal(r.field, 'timing')
})

test('accepts a form filled at human speed, rejects a stale one', () => {
  assert.equal(validateSubmission(valid({ formStartedAt: Date.now() - 30_000 })).ok, true)
  assert.equal(validateSubmission(valid({ formStartedAt: Date.now() - TIMING.maxMs - 1000 })).ok, false)
})

test('rejects non-object bodies', () => {
  for (const body of [null, undefined, 'string', 42, []]) {
    assert.equal(validateSubmission(body).ok, false)
  }
})

test('strips control characters and script payloads survive only as text', () => {
  assert.equal(stripControlChars('a\u0000b\u001Fc'), 'abc')
  const r = validateSubmission(valid({ name: 'Ada\u0000 <script>alert(1)</script>' }))
  assert.equal(r.ok, true)
  // Angle brackets are preserved as literal text; they are escaped at render
  // time by React, never interpreted. What matters is that no control
  // characters survive to corrupt the stored row.
  assert.ok(!r.value.name.includes('\u0000'))
  assert.ok(r.value.name.includes('<script>'))
})

test('SQL-ish input is kept verbatim as data, not executed', () => {
  const payload = "Robert'); DROP TABLE contact_messages;--"
  const r = validateSubmission(valid({ message: `${payload} we would like a demo` }))
  assert.equal(r.ok, true)
  assert.ok(r.value.message.includes(payload))
})

test('normalisers collapse whitespace and blank-line runs', () => {
  assert.equal(normaliseLine(' a \n b \t c '), 'a b c')
  assert.equal(normaliseText('a\n\n\n\nb   \n'), 'a\n\nb')
})

test('isValidEmail and isValidStatus behave', () => {
  assert.equal(isValidEmail('a@b.co'), true)
  assert.equal(isValidEmail('a@b'), false)
  assert.equal(isValidStatus('unread'), true)
  assert.equal(isValidStatus('deleted'), false)
})

test('source path is only kept when it is a real path', () => {
  assert.equal(validateSubmission(valid({ sourcePath: '/contact' })).value.source_path, '/contact')
  assert.equal(validateSubmission(valid({ sourcePath: 'https://evil.example' })).value.source_path, null)
})
