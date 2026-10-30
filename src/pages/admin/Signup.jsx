import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { getSupabase, isSupabaseConfigured } from '../../admin/supabaseClient.js'
import { useAdminAuth } from '../../admin/useAdminAuth.js'
import { AdminShell } from '../../admin/AdminShell.jsx'

/**
 * Redeem an invitation link and set a password.
 *
 * This is not a public sign-up form, and cannot be made into one from the
 * browser: without a token the page offers no form at all, and every check
 * below is repeated by /api/admin/signup, which is what actually decides. The
 * client-side validation here exists to give fast, specific feedback — not to
 * protect anything.
 */

const PASSWORD_MIN = 12

/** Mirrors validateSignupInput() in api/_lib/invitations.js. */
function passwordProblem(password, email) {
  if (!password) return 'Please choose a password.'
  if (password.length < PASSWORD_MIN) return `Use at least ${PASSWORD_MIN} characters.`
  if (!/[A-Za-z]/.test(password) || !/[^A-Za-z]/.test(password)) {
    return 'Mix letters with at least one number or symbol.'
  }
  const localPart = (email || '').split('@')[0]
  if (localPart.length >= 4 && password.toLowerCase().includes(localPart.toLowerCase())) {
    return 'Please choose a password that does not contain your email address.'
  }
  return null
}

export default function AdminSignup() {
  const { status } = useAdminAuth()
  const [params] = useSearchParams()
  const token = params.get('token') || ''

  const [check, setCheck] = useState(token ? { state: 'checking' } : { state: 'no-token' })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  // Server-side verification, before anyone types a password. The response also
  // tells us which address the link was issued for.
  const verify = useCallback(async () => {
    setCheck({ state: 'checking' })
    try {
      const res = await fetch(`/api/admin/signup?token=${encodeURIComponent(token)}`)
      const payload = await res.json().catch(() => null)
      if (res.ok && payload?.ok) {
        setEmail(payload.email || '')
        setCheck({ state: 'valid', email: payload.email, expiresAt: payload.expiresAt })
      } else {
        setCheck({ state: 'invalid', message: payload?.error || 'That invitation link is not valid.' })
      }
    } catch {
      setCheck({ state: 'error', message: 'Could not reach the server. Please try again.' })
    }
  }, [token])

  useEffect(() => {
    if (token) verify()
  }, [token, verify])

  const localProblem = useMemo(() => {
    if (!email.trim()) return null
    return passwordProblem(password, email)
  }, [password, email])

  if (status === 'authorised') return <Navigate to="/admin" replace />

  const onSubmit = async (event) => {
    event.preventDefault()
    if (busy) return

    const problem = passwordProblem(password, email)
    if (problem) {
      setError(problem)
      return
    }
    if (password !== confirm) {
      setError('Those passwords do not match.')
      return
    }

    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email: email.trim().toLowerCase(), password, confirmPassword: confirm }),
      })
      const payload = await res.json().catch(() => null)

      if (!res.ok || !payload?.ok) {
        setError(payload?.error || 'Could not create your account. Please try again.')
        // A consumed or withdrawn invitation will never work again, so stop
        // offering the form.
        if (['used', 'expired', 'revoked', 'unknown'].includes(payload?.reason)) {
          setCheck({ state: 'invalid', message: payload.error })
        }
        return
      }

      // Account created. Sign in with the same credentials so they land inside
      // rather than being sent back to a login form.
      if (isSupabaseConfigured) {
        const { error: signInError } = await getSupabase().auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        })
        if (signInError) setDone(true) // created, but they must sign in by hand
      } else {
        setDone(true)
      }
    } catch {
      setError('Could not reach the server. Please try again.')
    } finally {
      setBusy(false)
      setPassword('')
      setConfirm('')
    }
  }

  // ----------------------------------------------------------------- states

  if (check.state === 'no-token') {
    return (
      <AdminShell title="Create account" heading="Create your account">
        <div className="admin-card admin-login">
          <p className="admin-hint">
            Epineon&rsquo;s dashboard is invitation-only — there is no public sign-up. Open the
            invitation link an administrator sent you, and this page will set up your account.
          </p>
          <p className="admin-login__note">
            Already have an account? <Link className="admin-inline-link" to="/admin/login">Sign in</Link>
          </p>
        </div>
      </AdminShell>
    )
  }

  if (check.state === 'checking') {
    return (
      <AdminShell title="Create account" heading="Create your account">
        <div className="admin-card admin-login">
          <p className="admin-empty" role="status">Checking your invitation…</p>
        </div>
      </AdminShell>
    )
  }

  if (check.state === 'invalid' || check.state === 'error') {
    return (
      <AdminShell title="Create account" heading="Create your account">
        <div className="admin-card admin-login">
          <p className="admin-alert admin-alert--error" role="alert">{check.message}</p>
          {check.state === 'error' ? (
            <button type="button" className="admin-btn admin-btn--quiet" onClick={verify}>
              Try again
            </button>
          ) : null}
          <p className="admin-login__note">
            <Link className="admin-inline-link" to="/admin/login">Back to sign in</Link>
          </p>
        </div>
      </AdminShell>
    )
  }

  if (done) {
    return (
      <AdminShell title="Create account" heading="Account created">
        <div className="admin-card admin-login">
          <p className="admin-alert admin-alert--ok" role="status">
            Your account is ready. Sign in with the password you just chose.
          </p>
          <Link className="admin-btn admin-btn--primary" to="/admin/login">Go to sign in</Link>
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell title="Create account" heading="Create your account">
      <form className="admin-card admin-login" onSubmit={onSubmit}>
        <p className="admin-hint">
          You were invited as an Epineon administrator. Choose a password to finish setting up
          <strong> {check.email}</strong>.
        </p>

        {error ? <p className="admin-alert admin-alert--error" role="alert">{error}</p> : null}

        <label className="admin-field">
          <span className="admin-label">Work email</span>
          <input
            className="admin-input"
            type="email"
            name="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            aria-describedby="signup-email-hint"
          />
          <span className="admin-hint admin-hint--field" id="signup-email-hint">
            This must be the address the invitation was issued for.
          </span>
        </label>

        <label className="admin-field">
          <span className="admin-label">Password</span>
          <input
            className="admin-input"
            type="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={PASSWORD_MIN}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
            aria-invalid={Boolean(password) && Boolean(localProblem)}
            aria-describedby="signup-password-hint"
          />
          <span
            className={`admin-hint admin-hint--field${password && localProblem ? ' admin-hint--warn' : ''}`}
            id="signup-password-hint"
            role={password && localProblem ? 'alert' : undefined}
          >
            {password && localProblem
              ? localProblem
              : `At least ${PASSWORD_MIN} characters, mixing letters with a number or symbol.`}
          </span>
        </label>

        <label className="admin-field">
          <span className="admin-label">Confirm password</span>
          <input
            className="admin-input"
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={busy}
            aria-invalid={Boolean(confirm) && confirm !== password}
          />
          {confirm && confirm !== password ? (
            <span className="admin-hint admin-hint--field admin-hint--warn" role="alert">
              Those passwords do not match.
            </span>
          ) : null}
        </label>

        <button type="submit" className="admin-btn admin-btn--primary" disabled={busy}>
          {busy ? 'Creating your account…' : 'Create account'}
        </button>

        <p className="admin-login__note">
          Already have an account? <Link className="admin-inline-link" to="/admin/login">Sign in</Link>
        </p>
      </form>
    </AdminShell>
  )
}
