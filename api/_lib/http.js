/**
 * Small helpers shared by the serverless functions.
 *
 * Error responses are deliberately generic: the visitor gets a usable message,
 * while the specifics (and anything about our infrastructure) stay in the logs.
 */
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
export const serverError = (res) => json(res, 500, { ok: false, error: 'Something went wrong. Please try again.' })

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
