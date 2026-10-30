import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  generateInvitationToken,
  hashInvitationToken,
  isWellFormedToken,
  invitationState,
  invitationTtlHours,
  invitationExpiry,
  buildSignupUrl,
  validateSignupInput,
  PASSWORD,
  DEFAULT_TTL_HOURS,
} from '../api/_lib/invitations.js'

const hourMs = 3600 * 1000
const valid = (over = {}) => ({
  token: 'a'.repeat(43),
  email: 'invitee@epineon.ai',
  password: 'correct-horse-7',
  confirmPassword: 'correct-horse-7',
  ...over,
})

// ------------------------------------------------------------------- tokens

test('tokens are long, url-safe and unique', () => {
  const a = generateInvitationToken()
  const b = generateInvitationToken()
  assert.notEqual(a, b)
  assert.match(a, /^[A-Za-z0-9_-]+$/)
  // 32 random bytes in base64url.
  assert.equal(a.length, 43)
  assert.ok(isWellFormedToken(a))
})

test('hashing is stable, one-way in shape, and distinguishes tokens', () => {
  const token = generateInvitationToken()
  assert.equal(hashInvitationToken(token), hashInvitationToken(token))
  assert.notEqual(hashInvitationToken(token), hashInvitationToken(generateInvitationToken()))
  assert.match(hashInvitationToken(token), /^[0-9a-f]{64}$/)
  // The digest must not contain the token itself.
  assert.ok(!hashInvitationToken(token).includes(token))
})

test('malformed tokens are rejected before they reach a query', () => {
  for (const bad of ['', 'short', 'has spaces in it ok', `${'a'.repeat(43)}'; drop table--`, 'a'.repeat(500), null, 42, {}]) {
    assert.equal(isWellFormedToken(bad), false, `accepted ${JSON.stringify(bad)}`)
  }
})

// -------------------------------------------------------------------- state

test('invitationState classifies every outcome', () => {
  const now = Date.now()
  const live = { expires_at: new Date(now + hourMs).toISOString(), accepted_at: null, revoked_at: null }

  assert.equal(invitationState(live, now), 'valid')
  assert.equal(invitationState(null, now), 'unknown')
  assert.equal(invitationState(undefined, now), 'unknown')
  assert.equal(invitationState({ ...live, revoked_at: new Date().toISOString() }, now), 'revoked')
  assert.equal(invitationState({ ...live, accepted_at: new Date().toISOString() }, now), 'used')
  assert.equal(invitationState({ ...live, expires_at: new Date(now - hourMs).toISOString() }, now), 'expired')
  assert.equal(invitationState({ ...live, expires_at: 'nonsense' }, now), 'expired')
  assert.equal(invitationState({ ...live, expires_at: null }, now), 'expired')
})

test('expiry is treated as exclusive, so the boundary instant is already dead', () => {
  const now = Date.now()
  const row = { expires_at: new Date(now).toISOString(), accepted_at: null, revoked_at: null }
  assert.equal(invitationState(row, now), 'expired')
})

test('revoked beats used beats expired, so the most decisive reason wins', () => {
  const now = Date.now()
  const stamp = new Date(now).toISOString()
  const dead = { expires_at: new Date(now - hourMs).toISOString(), accepted_at: stamp, revoked_at: stamp }
  assert.equal(invitationState(dead, now), 'revoked')
  assert.equal(invitationState({ ...dead, revoked_at: null }, now), 'used')
})

// ------------------------------------------------------------------- expiry

test('TTL falls back to the default for absent or absurd values', () => {
  assert.equal(invitationTtlHours({}), DEFAULT_TTL_HOURS)
  assert.equal(invitationTtlHours({ ADMIN_INVITE_TTL_HOURS: 'soon' }), DEFAULT_TTL_HOURS)
  assert.equal(invitationTtlHours({ ADMIN_INVITE_TTL_HOURS: '0' }), DEFAULT_TTL_HOURS)
  assert.equal(invitationTtlHours({ ADMIN_INVITE_TTL_HOURS: '-5' }), DEFAULT_TTL_HOURS)
  assert.equal(invitationTtlHours({ ADMIN_INVITE_TTL_HOURS: '99999' }), DEFAULT_TTL_HOURS)
  assert.equal(invitationTtlHours({ ADMIN_INVITE_TTL_HOURS: '24' }), 24)
})

test('expiry is in the future and honours the configured TTL', () => {
  const now = Date.UTC(2026, 0, 1)
  assert.equal(invitationExpiry(now, { ADMIN_INVITE_TTL_HOURS: '48' }), new Date(now + 48 * hourMs).toISOString())
  assert.ok(Date.parse(invitationExpiry(now, {})) > now)
})

// ---------------------------------------------------------------------- url

test('sign-up urls carry the token and tolerate a trailing slash', () => {
  assert.equal(
    buildSignupUrl('https://epineon.ai/', 'abc-123'),
    'https://epineon.ai/admin/signup?token=abc-123',
  )
  // A token with base64url characters must survive intact.
  const token = generateInvitationToken()
  assert.equal(new URL(buildSignupUrl('https://epineon.ai', token)).searchParams.get('token'), token)
})

// ------------------------------------------------------- validateSignupInput

test('a well-formed submission is accepted and normalised', () => {
  const result = validateSignupInput(valid({ email: '  Invitee@Epineon.AI ' }))
  assert.equal(result.ok, true)
  assert.equal(result.value.email, 'invitee@epineon.ai')
  assert.equal(result.value.password, 'correct-horse-7')
})

test('a missing or malformed token is refused', () => {
  assert.equal(validateSignupInput(valid({ token: undefined })).field, 'token')
  assert.equal(validateSignupInput(valid({ token: '' })).field, 'token')
  assert.equal(validateSignupInput(valid({ token: 'nope' })).field, 'token')
})

test('non-object bodies are refused outright', () => {
  for (const bad of [null, undefined, 'string', 42, []]) {
    assert.equal(validateSignupInput(bad).ok, false)
  }
})

test('invalid email addresses are refused', () => {
  for (const email of ['', 'nope', 'a@b', 'two@@at.com', `${'x'.repeat(250)}@epineon.ai`]) {
    const result = validateSignupInput(valid({ email }))
    assert.equal(result.ok, false, `accepted ${email}`)
    assert.equal(result.field, 'email')
  }
})

test('weak passwords are refused with a reason', () => {
  const cases = [
    ['', 'password'],
    ['short-1', 'password'],
    ['allletterspassword', 'password'],   // no number or symbol
    ['1234567890123456', 'password'],     // no letters
    ['x'.repeat(PASSWORD.max + 1), 'password'],
  ]
  for (const [password, field] of cases) {
    const result = validateSignupInput(valid({ password, confirmPassword: password }))
    assert.equal(result.ok, false, `accepted ${JSON.stringify(password)}`)
    assert.equal(result.field, field)
  }
})

test('a password containing the email local part is refused', () => {
  const result = validateSignupInput(valid({
    email: 'invitee@epineon.ai',
    password: 'Invitee-12345!',
    confirmPassword: 'Invitee-12345!',
  }))
  assert.equal(result.ok, false)
  assert.equal(result.field, 'password')
})

test('a short local part does not trigger the containment rule', () => {
  // "abc" is under the 4-character threshold, so this must be allowed.
  const result = validateSignupInput(valid({
    email: 'abc@epineon.ai',
    password: 'abc-is-fine-99',
    confirmPassword: 'abc-is-fine-99',
  }))
  assert.equal(result.ok, true)
})

test('the confirmation is re-checked server-side, not just in the browser', () => {
  const result = validateSignupInput(valid({ confirmPassword: 'something-else-9' }))
  assert.equal(result.ok, false)
  assert.equal(result.field, 'confirmPassword')
})

test('a missing confirmation is refused rather than skipped', () => {
  const result = validateSignupInput(valid({ confirmPassword: undefined }))
  assert.equal(result.ok, false)
  assert.equal(result.field, 'confirmPassword')
})

test('no client-supplied privilege field survives validation', () => {
  const result = validateSignupInput(valid({
    status: 'active',
    role: 'admin',
    isAdmin: true,
    is_admin: true,
    admin: true,
    user_id: 'uuid-attacker',
    invited_by: 'uuid-attacker',
    accepted_at: null,
  }))
  assert.equal(result.ok, true)
  // The validated value is a closed set of three fields; nothing else passes.
  assert.deepEqual(Object.keys(result.value).sort(), ['email', 'password', 'token'])
})
