import { createHash } from 'node:crypto'
import { getSupabaseAdmin } from './supabaseAdmin.js'

/**
 * Hash an identifier before it ever reaches the database or a log line, so we
 * can count requests per address without storing one. RATE_LIMIT_SALT keeps the
 * digest from being reversible with a rainbow table of the IPv4 space.
 */
export function hashIdentifier(value) {
  const salt = process.env.RATE_LIMIT_SALT || 'epineon-dev-salt'
  return createHash('sha256').update(`${salt}:${value}`).digest('hex').slice(0, 32)
}

/**
 * Fixed-window counter held in Postgres, incremented atomically by
 * bump_rate_limit(). Fails OPEN on an infrastructure error: a broken limiter
 * should not take the contact form down with it.
 *
 * @returns {Promise<boolean>} true when the request is within budget.
 */
export async function withinRateLimit({ bucket, identifier, windowSeconds, limit }) {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.rpc('bump_rate_limit', {
      p_bucket: bucket,
      p_identifier: hashIdentifier(identifier),
      p_window_seconds: windowSeconds,
      p_limit: limit,
    })
    if (error) {
      console.error('[rate-limit] rpc failed:', error.message)
      return true
    }
    return data === true
  } catch (err) {
    console.error('[rate-limit] unavailable:', err.message)
    return true
  }
}
