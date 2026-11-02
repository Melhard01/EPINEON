/**
 * /api/admin/team — the administrator allowlist.
 *
 *   GET    list members and outstanding invitations
 *   POST   invite one by email   { email }  → returns a one-time sign-up link
 *   PATCH  revoke or restore     { id, status }
 *
 * Every method re-checks the caller through requireAdmin(); nothing here trusts
 * the client. Because admin_users has no write policy for `authenticated`, this
 * endpoint (service role) is the only way the allowlist can change — which is
 * what stops an authenticated user authorising themselves.
 *
 * Inviting deliberately does NOT create a Supabase auth user and does not send
 * mail: SMTP cannot be assumed to be configured. It writes the allowlist row
 * and mints a one-time invitation token, returning the link ONCE so the
 * inviting administrator can pass it on however they choose. The invitee sets
 * their own password at /admin/signup; no password is ever handled here.
 */
import { requireAdmin } from '../_lib/auth.js'
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { isValidEmail, normaliseLine } from '../_lib/validation.js'
import { withinRateLimit } from '../_lib/rateLimit.js'
import {
  generateInvitationToken,
  hashInvitationToken,
  invitationExpiry,
  buildSignupUrl,
} from '../_lib/invitations.js'
import {
  ok, badRequest, forbidden, unauthorized, tooMany, serverError, setupError,
  methodNotAllowed, readJsonBody, json, errorRef, logError, isSchemaError,
} from '../_lib/http.js'

const ALLOWED = ['GET', 'POST', 'PATCH']

/**
 * One place that decides what an administrator is told when a write fails.
 *
 * A schema fault names itself: these callers are authenticated operators who
 * can act on "apply the migrations", whereas "Something went wrong" sends them
 * hunting through logs. Anything else stays generic but carries a reference
 * that matches the log line.
 */
function fail(res, scope, error, ref) {
  logError(scope, error, ref)
  if (isSchemaError(error)) {
    return setupError(
      res,
      'The database is missing part of its schema, so this could not be saved. '
        + 'Apply the migrations in supabase/migrations, then try again.',
      ref,
    )
  }
  return serverError(res, ref)
}

/**
 * Nothing in here may throw past this point.
 *
 * getSupabaseAdmin() throws outright when SUPABASE_SERVICE_ROLE_KEY or
 * SUPABASE_URL is unset, and before this wrapper that escaped the handler
 * entirely — the platform returned its own 500 and the real reason never
 * reached a log we control.
 */
export default async function handler(req, res) {
  const ref = errorRef()
  try {
    return await handleTeam(req, res, ref)
  } catch (err) {
    logError('team:unhandled', err, ref)
    if (res.headersSent) return undefined
    if (/configuration is missing/i.test(String(err?.message ?? ''))) {
      return setupError(
        res,
        'The server is missing its Supabase configuration. Set SUPABASE_URL and '
          + 'SUPABASE_SERVICE_ROLE_KEY in the deployment environment.',
        ref,
      )
    }
    return serverError(res, ref)
  }
}

async function handleTeam(req, res, ref) {
  if (!ALLOWED.includes(req.method)) return methodNotAllowed(res, ALLOWED)

  const auth = await requireAdmin(req)
  if (!auth.ok) {
    if (auth.status === 401) return unauthorized(res)
    if (auth.status === 403) return forbidden(res)
    return serverError(res, ref)
  }

  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, email, status, invited_at, last_seen_at')
      .order('invited_at', { ascending: false })
    if (error) return fail(res, 'team:list', error, ref)

    // Outstanding invitations, so the page can show who has a live link. Note
    // that token_hash is not selected: nothing can reconstruct a link from the
    // API, and the raw token was only ever shown once at creation.
    const { data: invitations, error: inviteError } = await supabase
      .from('admin_invitations')
      .select('id, email, created_at, expires_at')
      .is('accepted_at', null)
      .is('revoked_at', null)
      .order('created_at', { ascending: false })
    // Deliberately not fatal — the member list is still worth showing. This is
    // exactly the asymmetry that hid a missing admin_invitations table: GET
    // carried on and only POST failed, with no indication why.
    if (inviteError) logError('team:invitation-list', inviteError, ref)

    return ok(res, {
      members: data ?? [],
      invitations: invitations ?? [],
      // Tells the page that inviting will fail before anyone tries it.
      schemaIncomplete: isSchemaError(inviteError) || undefined,
    })
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

    const { data: existing, error: existingError } = await supabase
      .from('admin_users')
      .select('id, status, last_seen_at')
      .eq('email', email)
      .maybeSingle()
    // This error used to be discarded. A failed lookup left `existing`
    // undefined, so the code took the insert branch and tripped the unique
    // email index — reporting a write failure for what was a read failure.
    if (existingError) return fail(res, 'team:lookup-existing', existingError, ref)

    // Someone who has actually used the dashboard already has an account, so a
    // sign-up link would only be refused. Send them to "Forgot password?".
    if (existing?.status === 'active' && existing.last_seen_at) {
      return ok(res, { alreadyActive: true })
    }

    // Re-inviting a revoked member reactivates them; re-inviting an active one
    // who never signed in just re-issues their link. The button is safe to
    // press twice either way.
    let outcome = 'invited'
    if (existing) {
      outcome = existing.status === 'active' ? 'reinvited' : 'reactivated'
      const { error } = await supabase
        .from('admin_users')
        .update({ status: 'active', revoked_at: null, invited_by: auth.user.id, invited_at: new Date().toISOString() })
        .eq('id', existing.id)
      if (error) return fail(res, 'team:reactivate', error, ref)
    } else {
      // user_id stays null until they redeem the invitation; requireAdmin()
      // and /api/admin/signup bind it then.
      const { error } = await supabase.from('admin_users').insert({
        email,
        user_id: null,
        status: 'active',
        invited_by: auth.user.id,
      })
      if (error) return fail(res, 'team:insert', error, ref)
    }

    const minted = await mintInvitation(supabase, { email, invitedBy: auth.user.id, req })
    if (minted.error) return fail(res, 'team:mint-invitation', minted.error, ref)

    return ok(res, { [outcome]: true, signupUrl: minted.url })
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
  if (lookupError) return fail(res, 'team:lookup', lookupError, ref)
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
  if (error) return fail(res, 'team:status-change', error, ref)

  // Revoking access also kills any live sign-up link for that address. Sign-up
  // already re-checks the allowlist, so this is defence in depth rather than
  // the control — but it stops a dead link looking usable on the Team page.
  if (status === 'revoked') {
    const { error: inviteError } = await supabase
      .from('admin_invitations')
      .update({ revoked_at: new Date().toISOString() })
      .eq('email', String(target.email).toLowerCase())
      .is('accepted_at', null)
      .is('revoked_at', null)
    if (inviteError) console.error('[team] invitation revoke failed:', inviteError.message)
  }

  return ok(res, { status })
}

/**
 * Issue a fresh single-use invitation, superseding any live one for the same
 * address so only one link works at a time.
 *
 * @returns {{url: string} | {error: object}} — the absolute sign-up URL, or the
 *          database error that stopped it, so the caller can say which. The raw
 *          token is returned exactly once; only its hash is kept.
 */
async function mintInvitation(supabase, { email, invitedBy, req }) {
  const { error: supersedeError } = await supabase
    .from('admin_invitations')
    .update({ revoked_at: new Date().toISOString() })
    .eq('email', email)
    .is('accepted_at', null)
    .is('revoked_at', null)
  if (supersedeError) return { error: supersedeError }

  const token = generateInvitationToken()
  const { error } = await supabase.from('admin_invitations').insert({
    email,
    token_hash: hashInvitationToken(token),
    expires_at: invitationExpiry(),
    created_by: invitedBy,
  })
  if (error) return { error }

  return { url: buildSignupUrl(siteUrl(req), token) }
}

function siteUrl(req) {
  if (process.env.PUBLIC_SITE_URL) return process.env.PUBLIC_SITE_URL.replace(/\/+$/, '')
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:5173'
  const proto = req.headers['x-forwarded-proto'] || 'https'
  return `${proto}://${host}`
}
