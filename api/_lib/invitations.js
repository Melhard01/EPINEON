/**
 * Invitation tokens and sign-up input rules.
 *
 * Kept free of I/O and of any Supabase import so the rules can be unit-tested
 * directly (see tests/invitations.test.js) rather than only through a handler.
 */
import { createHash, randomBytes } from 'node:crypto'
import { isValidEmail, normaliseLine, LIMITS } from './validation.js'

export const PASSWORD = {
  min: 12, // above Supabase's default of 6: these are administrator accounts
  max: 200,
}

/** How long a fresh invitation stays usable. */
export const DEFAULT_TTL_HOURS = 168 // 7 days

/** Tokens are 32 random bytes, base64url — 256 bits, so unguessable. */
export function generateInvitationToken() {
  return randomBytes(32).toString('base64url')
}

/**
 * Only the digest is stored, and lookups are BY digest — an indexed equality
 * match, so there is no secret-dependent comparison to time.
 */
export function hashInvitationToken(raw) {
  return createHash('sha256').update(String(raw)).digest('hex')
}

/** Shape check before the token ever reaches a query. */
export function isWellFormedToken(value) {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{20,200}$/.test(value)
}

export function invitationTtlHours(env = process.env) {
  const raw = Number(env.ADMIN_INVITE_TTL_HOURS)
  if (!Number.isFinite(raw) || raw <= 0 || raw > 24 * 90) return DEFAULT_TTL_HOURS
  return raw
}

export function invitationExpiry(now = Date.now(), env = process.env) {
  return new Date(now + invitationTtlHours(env) * 3600 * 1000).toISOString()
}

/** Absolute URL an invitee opens. The token travels in the query string. */
export function buildSignupUrl(origin, token) {
  return `${String(origin).replace(/\/+$/, '')}/admin/signup?token=${encodeURIComponent(token)}`
}

/**
 * Classify an invitation row. Order matters: revoked beats expired beats used,
 * so the most decisive reason is reported.
 *
 * @returns {'valid'|'unknown'|'revoked'|'expired'|'used'}
 */
export function invitationState(row, now = Date.now()) {
  if (!row) return 'unknown'
  if (row.revoked_at) return 'revoked'
  if (row.accepted_at) return 'used'
  const expires = Date.parse(row.expires_at ?? '')
  if (!Number.isFinite(expires) || expires <= now) return 'expired'
  return 'valid'
}

/** Visitor-facing wording for each outcome. Never says whether a token exists. */
export const INVITATION_MESSAGES = {
  unknown: 'That invitation link is not valid. Ask an administrator for a new one.',
  revoked: 'That invitation has been withdrawn. Ask an administrator for a new one.',
  expired: 'That invitation link has expired. Ask an administrator for a new one.',
  used: 'That invitation has already been used. Sign in instead, or reset your password.',
}

/**
 * Validate the sign-up form.
 *
 * Note what is absent: no role, status, `isAdmin` or `admin_users` field is
 * read, here or in the handler. Administrator rights come from the allowlist
 * row an existing administrator created, never from this payload — so there is
 * nothing a caller can add to escalate.
 *
 * @returns {{ok: true, value: {token: string, email: string, password: string}}
 *          |{ok: false, error: string, field?: string}}
 */
export function validateSignupInput(input) {
  if (input == null || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, error: 'Invalid request body.' }
  }

  const token = typeof input.token === 'string' ? input.token.trim() : ''
  if (!token) return { ok: false, error: 'An invitation link is required to create an account.', field: 'token' }
  if (!isWellFormedToken(token)) return { ok: false, error: INVITATION_MESSAGES.unknown, field: 'token' }

  const email = normaliseLine(input.email ?? '').toLowerCase()
  if (!email) return { ok: false, error: 'Please enter your work email address.', field: 'email' }
  if (email.length > LIMITS.email || !isValidEmail(email)) {
    return { ok: false, error: 'Please enter a valid email address.', field: 'email' }
  }

  const password = typeof input.password === 'string' ? input.password : ''
  const confirm = typeof input.confirmPassword === 'string' ? input.confirmPassword : ''

  if (!password) return { ok: false, error: 'Please choose a password.', field: 'password' }
  if (password.length < PASSWORD.min) {
    return { ok: false, error: `Use at least ${PASSWORD.min} characters.`, field: 'password' }
  }
  if (password.length > PASSWORD.max) {
    return { ok: false, error: 'That password is too long.', field: 'password' }
  }
  // Cheap guard against the two weakest passwords people actually pick here.
  if (!/[A-Za-z]/.test(password) || !/[^A-Za-z]/.test(password)) {
    return { ok: false, error: 'Mix letters with at least one number or symbol.', field: 'password' }
  }
  const localPart = email.split('@')[0]
  if (localPart.length >= 4 && password.toLowerCase().includes(localPart)) {
    return { ok: false, error: 'Please choose a password that does not contain your email address.', field: 'password' }
  }

  // Checked in the browser too, but re-checked here: the browser is not trusted.
  if (confirm !== password) {
    return { ok: false, error: 'Those passwords do not match.', field: 'confirmPassword' }
  }

  return { ok: true, value: { token, email, password } }
}
