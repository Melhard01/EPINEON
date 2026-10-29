import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getSupabase, isSupabaseConfigured } from '../../admin/supabaseClient.js'
import { useAdminAuth } from '../../admin/useAdminAuth.js'
import { AdminShell } from '../../admin/AdminShell.jsx'

/**
 * Sign-in only — there is no registration path anywhere in this app. Accounts
 * exist because an existing administrator invited them through Supabase Auth.
 */
export default function AdminLogin() {
  const { status } = useAdminAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  // Supabase puts an `error_description` in the hash when an invite link expires.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const description = hash.get('error_description')
    if (description) setError(description)
  }, [])

  if (status === 'authorised') {
    return <Navigate to={location.state?.from || '/admin'} replace />
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    if (busy || !isSupabaseConfigured) return
    setBusy(true)
    setError(null)
    setNotice(null)

    const { error: signInError } = await getSupabase().auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    setBusy(false)
    // One generic message for both "no such user" and "wrong password", so the
    // form cannot be used to discover which addresses have accounts.
    if (signInError) setError('Those details did not match an Epineon administrator account.')
  }

  const onReset = async () => {
    if (!email.trim() || !isSupabaseConfigured) {
      setError('Enter your email address first.')
      return
    }
    setBusy(true)
    setError(null)
    await getSupabase().auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/admin/login`,
    })
    setBusy(false)
    // Always the same reply, whether or not that address exists.
    setNotice('If that address belongs to an administrator, a reset link is on its way.')
  }

  return (
    <AdminShell title="Sign in" heading="Administrator sign-in">
      <form className="admin-card admin-login" onSubmit={onSubmit} noValidate={false}>
        {error ? <p className="admin-alert admin-alert--error" role="alert">{error}</p> : null}
        {notice ? <p className="admin-alert admin-alert--ok" role="status">{notice}</p> : null}

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
          />
        </label>

        <label className="admin-field">
          <span className="admin-label">Password</span>
          <input
            className="admin-input"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
          />
        </label>

        <button type="submit" className="admin-btn admin-btn--primary" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        <button type="button" className="admin-btn admin-btn--link" onClick={onReset} disabled={busy}>
          Forgot password?
        </button>

        <p className="admin-login__note">
          Access is by invitation only. There is no public sign-up.
        </p>
      </form>
    </AdminShell>
  )
}
