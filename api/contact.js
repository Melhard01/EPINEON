/**
 * POST /api/contact — public contact-form intake.
 *
 * This is the ONLY path by which a row reaches contact_messages: the table has
 * no insert policy, and `anon` holds no privileges on it, so a visitor cannot
 * write to the database directly even with the anon key in hand.
 */
import { validateSubmission, LIMITS } from './_lib/validation.js'
import { withinRateLimit, hashIdentifier } from './_lib/rateLimit.js'
import { getSupabaseAdmin } from './_lib/supabaseAdmin.js'
import { ok, badRequest, tooMany, serverError, methodNotAllowed, readJsonBody, clientIp, json } from './_lib/http.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  let body
  try {
    body = await readJsonBody(req, LIMITS.bodyBytes)
  } catch (err) {
    if (err.statusCode === 413) return json(res, 413, { ok: false, error: 'That message is too large.' })
    return badRequest(res, 'Invalid request body.')
  }

  const result = validateSubmission(body)
  if (!result.ok) {
    // Honeypot and timing rejections get the same shape as a real validation
    // error so a bot cannot tell which trap it hit.
    if (result.field === 'honeypot' || result.field === 'timing') {
      console.warn('[contact] rejected by %s check', result.field)
      return badRequest(res, 'Your message could not be sent. Please try again.')
    }
    return badRequest(res, result.error, result.field)
  }

  const ip = clientIp(req)

  // Two windows: a burst limit, then a slower ceiling for the whole day.
  const burstOk = await withinRateLimit({ bucket: 'contact:burst', identifier: ip, windowSeconds: 600, limit: 3 })
  if (!burstOk) return tooMany(res)
  const dailyOk = await withinRateLimit({ bucket: 'contact:daily', identifier: ip, windowSeconds: 86400, limit: 20 })
  if (!dailyOk) return tooMany(res)

  try {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('contact_messages').insert({
      ...result.value,
      ip_hash: hashIdentifier(ip),
      user_agent: String(req.headers['user-agent'] || '').slice(0, 300),
    })

    if (error) {
      // Log the failure, never the submitter's details.
      console.error('[contact] insert failed:', error.message)
      return serverError(res)
    }
  } catch (err) {
    console.error('[contact] unavailable:', err.message)
    return serverError(res)
  }

  return ok(res)
}
