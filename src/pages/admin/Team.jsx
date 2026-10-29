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
  const [state, setState] = useState('loading')
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [invite, setInvite] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmId, setConfirmId] = useState(null)

  const load = useCallback(async () => {
    setState('loading')
    setError(null)
    try {
      const data = await adminFetch('/api/admin/team')
      setMembers(data.members ?? [])
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
    try {
      const result = await adminFetch('/api/admin/team', {
        method: 'POST',
        body: JSON.stringify({ email: invite }),
      })
      setInvite('')
      if (result.alreadyActive) setNotice('That address already has access.')
      else if (result.reactivated) setNotice('Access restored. They can sign in again.')
      else setNotice('Invitation sent. They must sign in through Supabase before the dashboard opens.')
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
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
          They receive a Supabase invitation email and must set a password before the dashboard
          will open for them. There is no public sign-up.
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
                return (
                  <tr key={member.id}>
                    <td>
                      {member.email}
                      {isSelf ? <span className="admin-tag">you</span> : null}
                    </td>
                    <td>
                      <span className={`admin-pill admin-pill--${member.status === 'active' ? (pending ? 'unread' : 'replied') : 'archived'}`}>
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
