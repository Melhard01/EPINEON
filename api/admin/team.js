/**
 * /api/admin/team — the administrator allowlist.
 *
 *   GET    list members
 *   POST   invite one by email   { email }
 *   PATCH  revoke or restore     { id, status }
 *
 * Every method re-checks the caller through requireAdmin(); nothing here trusts
 * the client. Because admin_users has no write policy for `authenticated`, this
 * endpoint (service role) is the only way the allowlist can change — which is
 * what stops an authenticated user authorising themselves.
 */
import { requireAdmin } from '../_lib/auth.js'
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { isValidEmail, normaliseLine } from '../_lib/validation.js'
import { withinRateLimit } from '../_lib/rateLimit.js'
import { ok, badRequest, forbidden, unauthorized, tooMany, serverError, methodNotAllowed, readJsonBody, json } from '../_lib/http.js'

const ALLOWED = ['GET', 'POST', 'PATCH']

export default async function handler(req, res) {
  if (!ALLOWED.includes(req.method)) return methodNotAllowed(res, ALLOWED)

  const auth = await requireAdmin(req)
  if (!auth.ok) {
    if (auth.status === 401) return unauthorized(res)
    if (auth.status === 403) return forbidden(res)
    return serverError(res)
  }

  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, email, status, invited_at, last_seen_at')
      .order('invited_at', { ascending: false })
    if (error) {
      console.error('[team] list failed:', error.message)
      return serverError(res)
    }
    return ok(res, { members: data ?? [] })
  }

  const limited = !(await withinRateLimit({
    bucket: 'admin:team-write',
    identifier: auth.user.id,
    windowSeconds: 600,
    limit: 20,
  }))
  if (limited) return tooMany(res)

  let body
  try {
    body = await readJsonBody(req, 4 * 1024)
  } catch {
    return badRequest(res, 'Invalid request body.')
  }

  if (req.method === 'POST') {
    const email = normaliseLine(body?.email ?? '').toLowerCase()
    if (!isValidEmail(email)) return badRequest(res, 'Please enter a valid email address.', 'email')

    const { data: existing } = await supabase
      .from('admin_users')
      .select('id, status')
      .eq('email', email)
      .maybeSingle()

    // Re-inviting a revoked member reactivates them; re-inviting an active one
    // is a no-op rather than an error, so the button is safe to press twice.
    if (existing) {
      if (existing.status === 'active') return ok(res, { alreadyActive: true })
      const { error } = await supabase
        .from('admin_users')
        .update({ status: 'active', revoked_at: null, invited_by: auth.user.id, invited_at: new Date().toISOString() })
        .eq('id', existing.id)
      if (error) {
        console.error('[team] reactivate failed:', error.message)
        return serverError(res)
      }
      return ok(res, { reactivated: true })
    }

    // Create the auth user so they receive a real Supabase invitation email.
    // A pre-existing auth account is fine — we only need its id.
    let invitedUserId = null
    try {
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${siteUrl(req)}/admin/login`,
      })
      if (error && !/already.*registered|already been registered/i.test(error.message)) {
        console.error('[team] invite failed:', error.message)
        return serverError(res)
      }
      invitedUserId = data?.user?.id ?? null
    } catch (err) {
      console.error('[team] invite threw:', err.message)
      return serverError(res)
    }

    const { error } = await supabase.from('admin_users').insert({
      email,
      user_id: invitedUserId,
      status: 'active',
      invited_by: auth.user.id,
    })
    if (error) {
      console.error('[team] insert failed:', error.message)
      return serverError(res)
    }
    return ok(res, { invited: true })
  }

  // PATCH — revoke or restore.
  const id = normaliseLine(body?.id ?? '')
  const status = normaliseLine(body?.status ?? '')
  if (!id || !['active', 'revoked'].includes(status)) return badRequest(res, 'Invalid request.')

  const { data: target, error: lookupError } = await supabase
    .from('admin_users')
    .select('id, email, user_id')
    .eq('id', id)
    .maybeSingle()
  if (lookupError) {
    console.error('[team] lookup failed:', lookupError.message)
    return serverError(res)
  }
  if (!target) return badRequest(res, 'That team member no longer exists.')

  // Locking yourself out would leave the dashboard unreachable.
  if (status === 'revoked' && (target.user_id === auth.user.id || target.email === (auth.user.email || '').toLowerCase())) {
    return json(res, 409, { ok: false, error: 'You cannot revoke your own access.' })
  }

  if (status === 'revoked') {
    const { count } = await supabase
      .from('admin_users')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
    if ((count ?? 0) <= 1) {
      return json(res, 409, { ok: false, error: 'At least one administrator must remain.' })
    }
  }

  const { error } = await supabase
    .from('admin_users')
    .update({ status, revoked_at: status === 'revoked' ? new Date().toISOString() : null })
    .eq('id', id)
  if (error) {
    console.error('[team] status change failed:', error.message)
    return serverError(res)
  }
  return ok(res, { status })
}

function siteUrl(req) {
  if (process.env.PUBLIC_SITE_URL) return process.env.PUBLIC_SITE_URL.replace(/\/+$/, '')
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:5173'
  const proto = req.headers['x-forwarded-proto'] || 'https'
  return `${proto}://${host}`
}
