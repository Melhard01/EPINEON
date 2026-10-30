/**
 * /api/admin/signup — redeem an invitation and create that account.
 *
 *   GET  ?token=…   verify a link and report whose it is (creates nothing)
 *   POST            { token, email, password, confirmPassword } → account
 *
 * This is the only unauthenticated endpoint in /api/admin, so it is written
 * assuming hostile input throughout:
 *
 *   * A valid, unexpired, unclaimed, unrevoked invitation is required. There
 *     is no path through this file without one.
 *   * The submitted address must equal the invited address. A token is not a
 *     licence to create any account.
 *   * The address must ALSO hold an active row in admin_users — the allowlist
 *     an existing administrator wrote. Two independent facts must agree.
 *   * Nothing in the request body can affect authorisation. No role, status or
 *     admin field is read; see validateSignupInput().
 *   * Claiming is an UPDATE guarded by `accepted_at is null`, so a token is
 *     single-use even under concurrent redemption.
 *   * An address that already has an auth account is refused, so an invitation
 *     can never be used to overwrite someone's existing password.
 */
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { withinRateLimit } from '../_lib/rateLimit.js'
import {
  hashInvitationToken,
  isWellFormedToken,
  invitationState,
  validateSignupInput,
  INVITATION_MESSAGES,
} from '../_lib/invitations.js'
import {
  ok,
  badRequest,
  forbidden,
  tooMany,
  serverError,
  methodNotAllowed,
  readJsonBody,
  clientIp,
  json,
} from '../_lib/http.js'

const ALLOWED = ['GET', 'POST']

export default async function handler(req, res) {
  if (!ALLOWED.includes(req.method)) return methodNotAllowed(res, ALLOWED)

  // Token guessing is the attack this endpoint invites, and it is IP-bound.
  const allowed = await withinRateLimit({
    bucket: req.method === 'GET' ? 'admin:signup-verify' : 'admin:signup',
    identifier: clientIp(req),
    windowSeconds: 600,
    limit: req.method === 'GET' ? 30 : 10,
  })
  if (!allowed) return tooMany(res)

  try {
    return req.method === 'GET' ? await verify(req, res) : await register(req, res)
  } catch (err) {
    console.error('[signup] unhandled:', err.message)
    return serverError(res)
  }
}

/** Read-only: tells the page whether a link is live, and for which address. */
async function verify(req, res) {
  const token = tokenFromRequest(req)
  if (!isWellFormedToken(token)) {
    return badRequest(res, INVITATION_MESSAGES.unknown, 'token')
  }

  const supabase = getSupabaseAdmin()
  const { data: invitation, error } = await supabase
    .from('admin_invitations')
    .select('id, email, expires_at, accepted_at, revoked_at')
    .eq('token_hash', hashInvitationToken(token))
    .maybeSingle()

  if (error) {
    console.error('[signup] invitation lookup failed:', error.message)
    return serverError(res)
  }

  const state = invitationState(invitation)
  if (state !== 'valid') {
    return json(res, 400, { ok: false, error: INVITATION_MESSAGES[state], reason: state })
  }

  // An invitation whose allowlist row was revoked meanwhile is dead too. Say so
  // now rather than after they have chosen a password.
  const admin = await activeAllowlistRow(supabase, invitation.email)
  if (admin === undefined) return serverError(res)
  if (!admin) {
    return json(res, 403, { ok: false, error: INVITATION_MESSAGES.revoked, reason: 'revoked' })
  }

  // Returning the address is safe: holding the token already implies it, since
  // the link was issued for that address and nothing else.
  return ok(res, { email: invitation.email, expiresAt: invitation.expires_at })
}

async function register(req, res) {
  let body
  try {
    body = await readJsonBody(req, 8 * 1024)
  } catch (err) {
    if (err.statusCode === 413) return json(res, 413, { ok: false, error: 'Payload too large.' })
    return badRequest(res, 'Invalid request body.')
  }

  const parsed = validateSignupInput(body)
  if (!parsed.ok) return badRequest(res, parsed.error, parsed.field)
  const { token, email, password } = parsed.value

  const supabase = getSupabaseAdmin()
  const { data: invitation, error: lookupError } = await supabase
    .from('admin_invitations')
    .select('id, email, expires_at, accepted_at, revoked_at')
    .eq('token_hash', hashInvitationToken(token))
    .maybeSingle()

  if (lookupError) {
    console.error('[signup] invitation lookup failed:', lookupError.message)
    return serverError(res)
  }

  const state = invitationState(invitation)
  if (state !== 'valid') {
    return json(res, 400, { ok: false, error: INVITATION_MESSAGES[state], reason: state })
  }

  // The token authorises ONE address. Typing a different one does not move it.
  if (String(invitation.email).toLowerCase() !== email) {
    return badRequest(res, 'This invitation was issued for a different email address.', 'email')
  }

  // Authorisation proper: it comes from here, and only from here.
  const admin = await activeAllowlistRow(supabase, email)
  if (admin === undefined) return serverError(res)
  if (!admin) return forbidden(res)

  // Single-use claim. If a concurrent request got there first this updates no
  // rows, and we stop — so the same link cannot create two accounts.
  const { data: claimed, error: claimError } = await supabase
    .from('admin_invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invitation.id)
    .is('accepted_at', null)
    .is('revoked_at', null)
    .select('id')

  if (claimError) {
    console.error('[signup] claim failed:', claimError.message)
    return serverError(res)
  }
  if (!claimed?.length) {
    return json(res, 409, { ok: false, error: INVITATION_MESSAGES.used, reason: 'used' })
  }

  const release = async () => {
    const { error } = await supabase
      .from('admin_invitations')
      .update({ accepted_at: null })
      .eq('id', invitation.id)
    if (error) console.error('[signup] could not release claim:', error.message)
  }

  // email_confirm: true because we must not depend on SMTP being configured —
  // the invitation link is itself the proof of address ownership.
  let created
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (error) {
      await release()
      if (/already.*(registered|exists)|been registered/i.test(error.message || '')) {
        return json(res, 409, {
          ok: false,
          error: 'An account already exists for that address. Sign in instead, or use “Forgot password?”.',
          reason: 'account-exists',
        })
      }
      console.error('[signup] createUser failed:', error.message)
      return serverError(res)
    }
    created = data?.user ?? null
  } catch (err) {
    await release()
    console.error('[signup] createUser threw:', err.message)
    return serverError(res)
  }

  if (!created?.id) {
    await release()
    console.error('[signup] createUser returned no user')
    return serverError(res)
  }

  // Bind the allowlist row to the new auth user so requireAdmin() can match on
  // user_id from here on, and record who consumed the invitation.
  const { error: linkError } = await supabase
    .from('admin_users')
    .update({ user_id: created.id, status: 'active', revoked_at: null })
    .eq('id', admin.id)
  if (linkError) {
    // The account exists and the allowlist row is already active, so access
    // works; only the id binding is missing and requireAdmin() repairs that on
    // first use. Log, do not fail the sign-up.
    console.error('[signup] could not link allowlist row:', linkError.message)
  }

  const { error: stampError } = await supabase
    .from('admin_invitations')
    .update({ accepted_user_id: created.id })
    .eq('id', invitation.id)
  if (stampError) console.error('[signup] could not stamp invitation:', stampError.message)

  return ok(res, { email })
}

/**
 * @returns the active allowlist row, null when there is none, or undefined on a
 *          lookup failure — so callers can tell "no access" from "broken".
 */
async function activeAllowlistRow(supabase, email) {
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, email, status, user_id')
    .eq('email', String(email).toLowerCase())
    .maybeSingle()

  if (error) {
    console.error('[signup] allowlist lookup failed:', error.message)
    return undefined
  }
  if (!data || data.status !== 'active') return null
  return data
}

function tokenFromRequest(req) {
  if (req.query && typeof req.query.token === 'string') return req.query.token.trim()
  if (typeof req.url === 'string') {
    try {
      return (new URL(req.url, 'http://localhost').searchParams.get('token') || '').trim()
    } catch {
      return ''
    }
  }
  return ''
}
