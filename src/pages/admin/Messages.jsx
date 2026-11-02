import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AdminShell } from '../../admin/AdminShell.jsx'
import { useMessages, countByForm, STATUS_LABELS } from '../../admin/useMessages.js'
import { FORMS, LEGACY_FORM_ID, displayFormName } from '../../../api/_lib/forms.js'

const FILTERS = ['all', 'unread', 'read', 'replied', 'archived']

/**
 * One section per website form, plus "All".
 *
 * Built from the registry rather than from the data, so a form with no
 * submissions yet still gets a section and a visible zero. Two exceptions keep
 * an administrator from ever losing sight of a message:
 *   - the legacy 'contact' bucket is hidden until something actually lands in it
 *   - an id present in the data but absent from the registry gets a section
 *     anyway, labelled from whatever name was stored with it
 */
function useSections(messages) {
  return useMemo(() => {
    const counts = countByForm(messages)
    const known = FORMS.filter((form) => !form.legacy || (counts.get(form.id) ?? 0) > 0)
    const unregistered = [...counts.keys()]
      .filter((id) => !FORMS.some((form) => form.id === id))
      .map((id) => ({
        id,
        name: displayFormName(id, messages.find((m) => m.form_id === id)?.form_name),
      }))

    return [...known, ...unregistered].map((form) => ({
      ...form,
      count: counts.get(form.id) ?? 0,
    }))
  }, [messages])
}

export default function AdminMessages() {
  const { formId } = useParams()
  const { messages, state, error, reload, setStatus, remove } = useMessages()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [busy, setBusy] = useState(false)

  const sections = useSections(messages)
  const active = formId ? sections.find((section) => section.id === formId) ?? null : null

  // Rows belonging to this section. Categorisation is entirely automatic —
  // form_id is stamped at insert time, so there is nothing here to move by hand.
  const sectionMessages = useMemo(
    () => (formId ? messages.filter((m) => (m.form_id || LEGACY_FORM_ID) === formId) : messages),
    [messages, formId],
  )

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return sectionMessages.filter((m) => {
      if (filter !== 'all' && m.status !== filter) return false
      if (!needle) return true
      return [m.name, m.email, m.company, m.subject, m.message, m.form_name].some((field) =>
        String(field || '').toLowerCase().includes(needle),
      )
    })
  }, [sectionMessages, query, filter])

  const selected = sectionMessages.find((m) => m.id === selectedId) ?? null
  const heading = formId ? (active?.name ?? 'Unknown form') : 'Messages'

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
      title={heading}
      heading={heading}
      actions={
        <button type="button" className="admin-btn admin-btn--quiet" onClick={reload} disabled={state === 'loading'}>
          Refresh
        </button>
      }
    >
      {/* Section navigation. Each form is its own URL, so a section can be
          bookmarked and shared, and a refresh resolves to a real page. */}
      <nav className="admin-sections" aria-label="Form sections">
        <Link
          to="/admin/messages"
          className={`admin-section${!formId ? ' is-active' : ''}`}
          aria-current={!formId ? 'page' : undefined}
        >
          All
          <span className="admin-section__count">{messages.length}</span>
        </Link>
        {sections.map((section) => (
          <Link
            key={section.id}
            to={`/admin/messages/${section.id}`}
            className={`admin-section${formId === section.id ? ' is-active' : ''}`}
            aria-current={formId === section.id ? 'page' : undefined}
          >
            {section.name}
            <span className="admin-section__count">{section.count}</span>
          </Link>
        ))}
      </nav>

      <div className="admin-toolbar">
        <label className="admin-search">
          <span className="sr-only">Search messages</span>
          <input
            className="admin-input"
            type="search"
            placeholder="Search name, email, company, subject or message"
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

      {state === 'ready' && sectionMessages.length === 0 ? (
        <p className="admin-empty">
          {formId
            ? 'No submissions from this form yet. They will appear here as they arrive.'
            : 'No contact submissions yet. They will appear here as they arrive.'}
        </p>
      ) : null}

      {state === 'ready' && sectionMessages.length > 0 && visible.length === 0 ? (
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
                  <span className="admin-list__date">
                    {/* Which form it came from, only where it is not implied by the section. */}
                    {!formId ? (
                      <span className="admin-tag">{displayFormName(m.form_id, m.form_name)}</span>
                    ) : null}
                    {new Date(m.created_at).toLocaleString()}
                  </span>
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
                  <div><dt>Form</dt><dd>{displayFormName(selected.form_id, selected.form_name)}</dd></div>
                  <div><dt>From</dt><dd>{selected.name}</dd></div>
                  <div><dt>Email</dt><dd><a href={`mailto:${selected.email}`}>{selected.email}</a></dd></div>
                  {selected.company ? <div><dt>Company</dt><dd>{selected.company}</dd></div> : null}
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
