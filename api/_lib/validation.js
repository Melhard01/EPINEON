/**
 * Pure validation + normalisation for the public contact endpoint.
 *
 * Kept free of I/O and of any Supabase import so it can be unit-tested directly
 * (see tests/validation.test.js) and so the rules live in one place rather than
 * being spread through the handler.
 */

import { resolveFormId, formNameFor } from './forms.js'

export const LIMITS = {
  name: 120,
  company: 160,
  email: 254, // RFC 5321 maximum
  subject: 200,
  message: 5000,
  messageMin: 10,
  bodyBytes: 16 * 1024,
}

/** Minimum time a genuine visitor needs to fill the form, and the staleness cut-off. */
export const TIMING = { minMs: 2000, maxMs: 24 * 60 * 60 * 1000 }

// Deliberately conservative: one @, no whitespace, a dot in the domain.
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@.]+(\.[^\s@.]+)+$/

/** Strip C0/C1 control characters (keeping \n and \t) and normalise line endings. */
export function stripControlChars(value) {
  return String(value)
    .replace(/\r\n?/g, '\n')
    // eslint-disable-next-line no-control-regex -- stripping control chars is the point
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
}

/** Collapse runs of whitespace onto one line — for short single-line fields. */
export function normaliseLine(value) {
  return stripControlChars(value).replace(/\s+/g, ' ').trim()
}

/** Keep paragraph breaks, drop trailing space and runs of blank lines. */
export function normaliseText(value) {
  return stripControlChars(value)
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function isValidEmail(value) {
  const email = normaliseLine(value).toLowerCase()
  return email.length <= LIMITS.email && EMAIL_RE.test(email)
}

/**
 * Validate and normalise a submission.
 * @returns {{ok: true, value: object} | {ok: false, error: string, field?: string}}
 */
export function validateSubmission(input) {
  if (input == null || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, error: 'Invalid request body.' }
  }

  // Honeypot: a real visitor never sees this field, so anything in it is a bot.
  if (normaliseLine(input.companyWebsite ?? '') !== '') {
    return { ok: false, error: 'Rejected.', field: 'honeypot' }
  }

  const startedAt = Number(input.formStartedAt)
  if (Number.isFinite(startedAt) && startedAt > 0) {
    const elapsed = Date.now() - startedAt
    if (elapsed < TIMING.minMs) return { ok: false, error: 'Rejected.', field: 'timing' }
    if (elapsed > TIMING.maxMs) return { ok: false, error: 'This form expired. Please reload and try again.', field: 'timing' }
  }

  const name = normaliseLine(input.name ?? '')
  if (!name) return { ok: false, error: 'Please enter your name.', field: 'name' }
  if (name.length > LIMITS.name) return { ok: false, error: 'That name is too long.', field: 'name' }

  const email = normaliseLine(input.email ?? '').toLowerCase()
  if (!email) return { ok: false, error: 'Please enter your email address.', field: 'email' }
  if (!isValidEmail(email)) return { ok: false, error: 'Please enter a valid email address.', field: 'email' }

  const subject = normaliseLine(input.subject ?? '')
  if (subject.length > LIMITS.subject) return { ok: false, error: 'That subject is too long.', field: 'subject' }

  const message = normaliseText(input.message ?? '')
  if (!message) return { ok: false, error: 'Please enter a message.', field: 'message' }
  if (message.length < LIMITS.messageMin) return { ok: false, error: 'Please add a little more detail.', field: 'message' }
  if (message.length > LIMITS.message) return { ok: false, error: 'That message is too long.', field: 'message' }

  // Optional on every form, and named "Organization" on the partnerships tab.
  const company = normaliseLine(input.company ?? '')
  if (company.length > LIMITS.company) {
    return { ok: false, error: 'That company name is too long.', field: 'company' }
  }

  const sourcePath = normaliseLine(input.sourcePath ?? '')

  // Which form this came from is decided HERE, not by the caller. The id is
  // matched against the registry (an unknown one falls back to the legacy
  // bucket rather than erroring, so a stale bundle can still reach us) and the
  // display name is then looked up from that id. A `formName` in the body is
  // never read, so a visitor cannot file their message under a label of their
  // own choosing or inject markup into one.
  const formId = resolveFormId(input.formId)

  return {
    ok: true,
    value: {
      name,
      email,
      subject,
      message,
      company: company || null,
      form_id: formId,
      form_name: formNameFor(formId),
      source_path: sourcePath.startsWith('/') ? sourcePath.slice(0, 200) : null,
    },
  }
}

export const MESSAGE_STATUSES = ['unread', 'read', 'replied', 'archived']
export const isValidStatus = (value) => MESSAGE_STATUSES.includes(value)
