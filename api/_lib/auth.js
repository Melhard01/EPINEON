import { getSupabaseAdmin, getSupabaseAnon } from './supabaseAdmin.js'

/**
 * Resolve the caller from their bearer token and confirm they are an approved
 * administrator.
 *
 * Both halves are enforced here, server-side: a valid Supabase session proves
 * identity only. Authorisation comes from an ACTIVE row in admin_users, which
 * no authenticated user can write to themselves (the table has no insert or
 * update policy — only the service role can change it).
 *
 * @returns {{ok: true, user: object, admin: object} | {ok: false, status: number}}
 */
export async function requireAdmin(req) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token) return { ok: false, status: 401 }

  let user
  try {
    const { data, error } = await getSupabaseAnon().auth.getUser(token)
    if (error || !data?.user) return { ok: false, status: 401 }
    user = data.user
  } catch (err) {
    console.error('[auth] token verification failed:', err.message)
    return { ok: false, status: 401 }
  }

  const email = (user.email || '').toLowerCase()
  const supabase = getSupabaseAdmin()
  // Two equality lookups rather than one .or() string: an address containing a
  // comma or parenthesis would otherwise alter the PostgREST filter it is
  // interpolated into.
  const byId = await supabase
    .from('admin_users')
    .select('id, email, status, user_id')
    .eq('user_id', user.id)
    .limit(1)

  let rows = byId.data
  let error = byId.error

  if (!error && !rows?.length && email) {
    const byEmail = await supabase
      .from('admin_users')
      .select('id, email, status, user_id')
      .eq('email', email)
      .limit(1)
    rows = byEmail.data
    error = byEmail.error
  }

  if (error) {
    console.error('[auth] allowlist lookup failed:', error.message)
    return { ok: false, status: 500 }
  }

  const admin = rows?.[0]
  // Authenticated but not on the allowlist, or revoked → forbidden, not 401:
  // the session is valid, the permission is not.
  if (!admin || admin.status !== 'active') return { ok: false, status: 403 }

  // Bind the row to the auth user the first time they appear, and record the
  // visit so the UI can show who has actually accepted their invitation.
  const patch = {}
  if (!admin.user_id) patch.user_id = user.id
  patch.last_seen_at = new Date().toISOString()
  await supabase.from('admin_users').update(patch).eq('id', admin.id)

  return { ok: true, user, admin }
}
