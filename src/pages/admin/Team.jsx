import { useCallback, useEffect, useState } from 'react'
import { AdminShell } from '../../admin/AdminShell.jsx'
import { adminFetch } from '../../admin/supabaseClient.js'
import { useAdminAuth } from '../../admin/useAdminAuth.js'

/**
 * Team access. Every mutation goes through /api/admin/team, which re-verifies
 * the caller server-side — the buttons below are a convenience, not the
 * control. The allowlist table itself has no write policy for authenticated
 * users, so nobody can promote themselves by calling Supabase directly.
 */
export default function AdminTeam() {
  const { email: myEmail } = useAdminAuth()
  const [members, setMembers] = useState([])
  const [invitations, setInvitations] = useState([])
  const [state, setState] = useState('loading')
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [invite, setInvite] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmId, setConfirmId] = useState(null)
  // The one-time sign-up link, held only until the page is left. The server
  // keeps a hash, so it cannot be shown again after that.
  const [issued, setIssued] = useState(null)
  const [copied, setCopied] = useState(false)

  const load = useCallback(async () => {
    setState('loading')
    setError(null)
    try {
      const data = await adminFetch('/api/admin/team')
      setMembers(data.members ?? [])
      setInvitations(data.invitations ?? [])
      setState('ready')
    } catch (err) {
      setError(err.message)
      setState('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const onInvite = async (event) => {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    setNotice(null)
    setIssued(null)
    setCopied(false)
    try {
      const result = await adminFetch('/api/admin/team', {
        method: 'POST',
        body: JSON.stringify({ email: invite }),
      })
      const invitedEmail = invite.trim().toLowerCase()
      setInvite('')
      if (result.alreadyActive) {
        setNotice('That address already has access and an account. They can use “Forgot password?” if they are locked out.')
      } else {
        if (result.reactivated) setNotice('Access restored.')
        else if (result.reinvited) setNotice('A new sign-up link was issued; the previous one no longer works.')
        else setNotice('Added to the allowlist.')
        if (result.signupUrl) setIssued({ email: invitedEmail, url: result.signupUrl })
      }
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const copyLink = async () => {
    if (!issued) return
    try {
      await navigator.clipboard.writeText(issued.url)
      setCopied(true)
    } catch {
      setCopied(false)
      setError('Could not copy automatically — select the link and copy it by hand.')
    }
  }

  const changeStatus = async (id, status) => {
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      await adminFetch('/api/admin/team', { method: 'PATCH', body: JSON.stringify({ id, status }) })
      setConfirmId(null)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AdminShell title="Team access" heading="Team access">
      <section className="admin-card">
        <h2 className="admin-h2">Invite a team member</h2>
        <p className="admin-hint">
          This issues a single-use sign-up link, valid for 7 days, which you pass to them
          yourself — no email is sent, so nothing depends on mail delivery. They choose their own
          password at that link. There is no public sign-up.
        </p>
        <form className="admin-invite" onSubmit={onInvite}>
          <label className="admin-field admin-field--grow">
            <span className="sr-only">Email address</span>
            <input
              className="admin-input"
              type="email"
              required
              placeholder="name@epineon.ai"
              value={invite}
              onChange={(e) => setInvite(e.target.value)}
              disabled={busy}
            />
          </label>
          <button type="submit" className="admin-btn admin-btn--primary" disabled={busy}>
            {busy ? 'Working…' : 'Send invitation'}
          </button>
        </form>
        {error ? <p className="admin-alert admin-alert--error" role="alert">{error}</p> : null}
        {notice ? <p className="admin-alert admin-alert--ok" role="status">{notice}</p> : null}

        {issued ? (
          <div className="admin-issued" role="group" aria-label="One-time sign-up link">
            <p className="admin-issued__lead">
              Send this to <strong>{issued.email}</strong> over a channel you trust. It works once
              and is shown only now — the server keeps a hash, not the link.
            </p>
            <div className="admin-issued__row">
              <input
                className="admin-input admin-issued__input"
                readOnly
                value={issued.url}
                onFocus={(e) => e.target.select()}
                aria-label="Sign-up link"
              />
              <button type="button" className="admin-btn admin-btn--primary" onClick={copyLink}>
                {copied ? 'Copied' : 'Copy link'}
              </button>
              <button type="button" className="admin-btn admin-btn--quiet" onClick={() => setIssued(null)}>
                Hide
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="admin-card">
        <div className="admin-card__head">
          <h2 className="admin-h2">Authorised administrators</h2>
          <button type="button" className="admin-btn admin-btn--quiet" onClick={load} disabled={state === 'loading'}>
            Refresh
          </button>
        </div>

        {state === 'loading' ? <p className="admin-empty" role="status">Loading team…</p> : null}
        {state === 'error' ? <p className="admin-empty">Could not load the team list.</p> : null}
        {state === 'ready' && members.length === 0 ? <p className="admin-empty">No administrators yet.</p> : null}

        {members.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Email</th>
                <th scope="col">Status</th>
                <th scope="col">Invited</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const isSelf = member.email === (myEmail || '').toLowerCase()
                const pending = member.status === 'active' && !member.last_seen_at
                const liveInvite = invitations.find((row) => row.email === member.email)
                return (
                  <tr key={member.id}>
                    <td>
                      {member.email}
                      {isSelf ? <span className="admin-tag">you</span> : null}
                    </td>
                    <td>
                      <span
                        className={`admin-pill admin-pill--${member.status === 'active' ? (pending ? 'unread' : 'replied') : 'archived'}`}
                        title={
                          pending && liveInvite
                            ? `Sign-up link expires ${new Date(liveInvite.expires_at).toLocaleString()}`
                            : pending
                              ? 'No live sign-up link — invite them again to issue one'
                              : undefined
                        }
                      >
                        {member.status === 'revoked' ? 'Revoked' : pending ? 'Pending' : 'Active'}
                      </span>
                    </td>
                    <td>{new Date(member.invited_at).toLocaleDateString()}</td>
                    <td className="admin-table__actions">
                      {member.status === 'active' ? (
                        confirmId === member.id ? (
                          <span className="admin-confirm-inline">
                            Revoke access?
                            <button type="button" className="admin-btn admin-btn--danger" disabled={busy} onClick={() => changeStatus(member.id, 'revoked')}>
                              Yes
                            </button>
                            <button type="button" className="admin-btn admin-btn--quiet" onClick={() => setConfirmId(null)}>
                              No
                            </button>
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="admin-btn admin-btn--quiet"
                            disabled={busy || isSelf}
                            title={isSelf ? 'You cannot revoke your own access' : undefined}
                            onClick={() => setConfirmId(member.id)}
                          >
                            Revoke
                          </button>
                        )
                      ) : (
                        <button type="button" className="admin-btn admin-btn--quiet" disabled={busy} onClick={() => changeStatus(member.id, 'active')}>
                          Restore
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : null}
      </section>
    </AdminShell>
  )
}
