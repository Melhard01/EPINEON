import { Link } from 'react-router-dom'
import { AdminShell } from '../../admin/AdminShell.jsx'
import { useMessages, STATUS_LABELS } from '../../admin/useMessages.js'

export default function AdminDashboard() {
  const { messages, state, error, reload } = useMessages()

  const counts = messages.reduce(
    (acc, m) => {
      acc.total += 1
      acc[m.status] = (acc[m.status] ?? 0) + 1
      return acc
    },
    { total: 0 },
  )

  const recent = messages.slice(0, 5)

  return (
    <AdminShell title="Overview" heading="Overview">
      {state === 'loading' ? <p className="admin-empty" role="status">Loading…</p> : null}

      {state === 'error' ? (
        <div className="admin-alert admin-alert--error" role="alert">
          {error}{' '}
          <button type="button" className="admin-btn admin-btn--link" onClick={reload}>
            Try again
          </button>
        </div>
      ) : null}

      {state === 'ready' ? (
        <>
          <div className="admin-stats">
            <article className="admin-stat">
              <p className="admin-stat__value">{counts.total}</p>
              <p className="admin-stat__label">Total messages</p>
            </article>
            <article className="admin-stat admin-stat--accent">
              <p className="admin-stat__value">{counts.unread ?? 0}</p>
              <p className="admin-stat__label">Unread</p>
            </article>
            <article className="admin-stat">
              <p className="admin-stat__value">{counts.replied ?? 0}</p>
              <p className="admin-stat__label">Replied</p>
            </article>
            <article className="admin-stat">
              <p className="admin-stat__value">{counts.archived ?? 0}</p>
              <p className="admin-stat__label">Archived</p>
            </article>
          </div>

          <section className="admin-card">
            <div className="admin-card__head">
              <h2 className="admin-h2">Latest submissions</h2>
              <Link to="/admin/messages" className="admin-btn admin-btn--quiet">View all</Link>
            </div>

            {recent.length === 0 ? (
              <p className="admin-empty">No contact submissions yet.</p>
            ) : (
              <ul className="admin-recent">
                {recent.map((m) => (
                  <li key={m.id} className="admin-recent__item">
                    <div className="admin-recent__main">
                      <p className="admin-recent__name">{m.name}</p>
                      <p className="admin-recent__subject">{m.subject || 'No subject'}</p>
                    </div>
                    <div className="admin-recent__meta">
                      <span className={`admin-pill admin-pill--${m.status}`}>{STATUS_LABELS[m.status]}</span>
                      <time dateTime={m.created_at}>{new Date(m.created_at).toLocaleDateString()}</time>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </AdminShell>
  )
}
