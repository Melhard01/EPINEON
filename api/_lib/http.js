/**
 * Small helpers shared by the serverless functions.
 *
 * Error responses are deliberately generic: the visitor gets a usable message,
 * while the specifics (and anything about our infrastructure) stay in the logs.
 */
import { randomUUID } from 'node:crypto'
import { LIMITS } from './validation.js'

export function json(res, status, payload) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.status(status).send(JSON.stringify(payload))
}

export const ok = (res, payload = {}) => json(res, 200, { ok: true, ...payload })
export const badRequest = (res, error, field) => json(res, 400, { ok: false, error, field })
export const unauthorized = (res) => json(res, 401, { ok: false, error: 'Not authorised.' })
export const forbidden = (res) => json(res, 403, { ok: false, error: 'Not authorised.' })
export const tooMany = (res) => json(res, 429, { ok: false, error: 'Too many requests. Please try again shortly.' })
/**
 * Short id printed beside the log line and handed back to the caller, so a
 * reported "something went wrong" can be matched to the exact failure.
 */
export const errorRef = () => randomUUID().slice(0, 8)

export const serverError = (res, ref) =>
  json(res, 500, {
    ok: false,
    error: ref
      ? `Something went wrong. Please try again. (ref ${ref})`
      : 'Something went wrong. Please try again.',
    ...(ref ? { ref } : {}),
  })

/**
 * For /api/admin/* only. Those callers are authenticated operators, so a
 * configuration fault is worth naming: "Something went wrong" sends someone
 * hunting through logs for a problem the server already knows the shape of.
 */
export const setupError = (res, error, ref) => json(res, 500, { ok: false, error, ref })

/**
 * Log everything a Supabase/PostgREST failure carries.
 *
 * `error.message` alone hides the two fields that actually identify the
 * problem: `code` ('42P01' is a missing table) and `hint`. That is why a
 * missing admin_invitations table only ever showed up as a generic 500.
 */
export function logError(scope, error, ref) {
  const head = `[${scope}]${ref ? ` ref=${ref}` : ''}`
  if (error && typeof error === 'object') {
    const bits = [
      `code=${error.code ?? '-'}`,
      `message=${error.message ?? String(error)}`,
      error.details ? `details=${error.details}` : '',
      error.hint ? `hint=${error.hint}` : '',
      error.status ? `status=${error.status}` : '',
    ].filter(Boolean)
    console.error(head, bits.join(' | '))
    if (error.stack) console.error(error.stack)
  } else {
    console.error(head, String(error))
  }
}

/**
 * Does this failure mean the database is not shaped the way the code expects?
 * Almost always an unapplied migration.
 *   42P01     relation does not exist
 *   42703     column does not exist
 *   PGRST204  column not found in the schema cache
 *   PGRST205  table not found in the schema cache
 */
const SCHEMA_CODES = new Set(['42P01', '42703', 'PGRST204', 'PGRST205'])

export function isSchemaError(error) {
  if (!error) return false
  if (SCHEMA_CODES.has(error.code)) return true
  return /does not exist|could not find the .*(table|column)|schema cache/i.test(String(error.message ?? ''))
}

export function methodNotAllowed(res, allowed) {
  res.setHeader('Allow', allowed.join(', '))
  return json(res, 405, { ok: false, error: 'Method not allowed.' })
}

/**
 * Read and parse a JSON body, refusing anything oversized.
 * Vercel may pre-parse the body; both shapes are handled.
 */
export async function readJsonBody(req, maxBytes = LIMITS.bodyBytes) {
  const declared = Number(req.headers['content-length'])
  if (Number.isFinite(declared) && declared > maxBytes) {
    const err = new Error('Payload too large')
    err.statusCode = 413
    throw err
  }

  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string' && req.body.length) return JSON.parse(req.body)

  const chunks = []
  let total = 0
  for await (const chunk of req) {
    total += chunk.length
    if (total > maxBytes) {
      const err = new Error('Payload too large')
      err.statusCode = 413
      throw err
    }
    chunks.push(chunk)
  }
  if (!total) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

/**
 * Best-effort client address. x-forwarded-for is attacker-controllable in
 * general, but on Vercel the platform rewrites it, so the left-most entry is
 * the real peer. Only ever used hashed, never stored or logged raw.
 */
export function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length) return forwarded.split(',')[0].trim()
  return req.socket?.remoteAddress || 'unknown'
}
