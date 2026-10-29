import { useMemo, useState } from 'react'
import { AdminShell } from '../../admin/AdminShell.jsx'
import { useMessages, STATUS_LABELS } from '../../admin/useMessages.js'

const FILTERS = ['all', 'unread', 'read', 'replied', 'archived']

export default function AdminMessages() {
  const { messages, state, error, reload, setStatus, remove } = useMessages()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [busy, setBusy] = useState(false)

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return messages.filter((m) => {
      if (filter !== 'all' && m.status !== filter) return false
      if (!needle) return true
      return [m.name, m.email, m.subject, m.message].some((field) =>
        String(field || '').toLowerCase().includes(needle),
      )
    })
  }, [messages, query, filter])

  const selected = messages.find((m) => m.id === selectedId) ?? null

  const run = async (fn) => {
    setBusy(true)
    setActionError(null)
    try {
      await fn()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const open = (message) => {
    setSelectedId(message.id)
    if (message.status === 'unread') run(() => setStatus(message.id, 'read'))
  }

  return (
    <AdminShell
      title="Messages"
      heading="Messages"
      actions={
        <button type="button" className="admin-btn admin-btn--quiet" onClick={reload} disabled={state === 'loading'}>
          Refresh
        </button>
      }
    >
      <div className="admin-toolbar">
        <label className="admin-search">
          <span className="sr-only">Search messages</span>
          <input
            className="admin-input"
            type="search"
            placeholder="Search name, email, subject or message"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="admin-filters" role="group" aria-label="Filter by status">
          {FILTERS.map((value) => (
            <button
              key={value}
              type="button"
              className={`admin-filter${filter === value ? ' is-active' : ''}`}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {value === 'all' ? 'All' : STATUS_LABELS[value]}
            </button>
          ))}
        </div>
      </div>

      {actionError ? <p className="admin-alert admin-alert--error" role="alert">{actionError}</p> : null}

      {state === 'loading' ? <p className="admin-empty" role="status">Loading messages…</p> : null}

      {state === 'error' ? (
        <div className="admin-alert admin-alert--error" role="alert">
          {error}{' '}
          <button type="button" className="admin-btn admin-btn--link" onClick={reload}>Try again</button>
        </div>
      ) : null}

      {state === 'ready' && messages.length === 0 ? (
        <p className="admin-empty">No contact submissions yet. They will appear here as they arrive.</p>
      ) : null}

      {state === 'ready' && messages.length > 0 && visible.length === 0 ? (
        <p className="admin-empty">No messages match that search.</p>
      ) : null}

      {visible.length > 0 ? (
        <div className="admin-split">
          <ul className="admin-list">
            {visible.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  className={`admin-list__row${selectedId === m.id ? ' is-selected' : ''}`}
                  onClick={() => open(m)}
                >
                  <span className="admin-list__top">
                    <span className="admin-list__name">{m.name}</span>
                    <span className={`admin-pill admin-pill--${m.status}`}>{STATUS_LABELS[m.status]}</span>
                  </span>
                  <span className="admin-list__subject">{m.subject || 'No subject'}</span>
                  <span className="admin-list__date">{new Date(m.created_at).toLocaleString()}</span>
                </button>
              </li>
            ))}
          </ul>

          <section className="admin-card admin-detail" aria-live="polite">
            {!selected ? (
              <p className="admin-empty">Select a message to read it.</p>
            ) : (
              <>
                <h2 className="admin-h2">{selected.subject || 'No subject'}</h2>
                <dl className="admin-meta">
                  <div><dt>From</dt><dd>{selected.name}</dd></div>
                  <div><dt>Email</dt><dd><a href={`mailto:${selected.email}`}>{selected.email}</a></dd></div>
                  <div><dt>Received</dt><dd>{new Date(selected.created_at).toLocaleString()}</dd></div>
                  <div><dt>Status</dt><dd>{STATUS_LABELS[selected.status]}</dd></div>
                </dl>

                {/* Rendered as text, never as HTML — React escapes it. */}
                <p className="admin-message">{selected.message}</p>

                <div className="admin-detail__actions">
                  {['unread', 'read', 'replied', 'archived'].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`admin-btn admin-btn--quiet${selected.status === value ? ' is-active' : ''}`}
                      disabled={busy || selected.status === value}
                      onClick={() => run(() => setStatus(selected.id, value))}
                    >
                      Mark {STATUS_LABELS[value].toLowerCase()}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="admin-btn admin-btn--danger"
                    disabled={busy}
                    onClick={() => setConfirmId(selected.id)}
                  >
                    Delete
                  </button>
                </div>

                {confirmId === selected.id ? (
                  <div className="admin-confirm" role="alertdialog" aria-label="Confirm delete">
                    <p>Delete this message permanently? This cannot be undone.</p>
                    <div className="admin-confirm__actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn--danger"
                        disabled={busy}
                        onClick={() =>
                          run(async () => {
                            await remove(selected.id)
                            setConfirmId(null)
                            setSelectedId(null)
                          })
                        }
                      >
                        Yes, delete
                      </button>
                      <button type="button" className="admin-btn admin-btn--quiet" onClick={() => setConfirmId(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </section>
        </div>
      ) : null}
    </AdminShell>
  )
}
