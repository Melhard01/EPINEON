import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ArrowDownRight, Bell, Inbox, RefreshCw, UserPlus, Minus } from 'lucide-react'
import { AdminShell } from '../../admin/AdminShell.jsx'
import { MessageFlowChart, Sparkline } from '../../admin/MessageFlowChart.jsx'
import { useMessages, STATUS_LABELS } from '../../admin/useMessages.js'
import { useTeam } from '../../admin/useTeam.js'
import { adminDisplayName, adminInitial, adminDateline } from '../../admin/identity.js'
import { useAdminAuth } from '../../admin/useAdminAuth.js'
import { bucketByDay, growth, formSummary, formIdOf, relativeTime } from '../../admin/dashboardStats.js'
import { FORMS, formLabelForRow } from '../../../api/_lib/forms.js'

const WINDOW_DAYS = 14

/** Gold leads; the other lines stay cool and desaturated so it keeps the stage. */
const SERIES_COLOR = {
  demo: '#c9a227',
  sales: '#7dd3fc',
  partnerships: '#d4d4d8',
  contact: '#71717a',
}

/** The three live forms get a metric card; the legacy bucket does not. */
const METRIC_FORMS = FORMS.filter((form) => !form.legacy)

function Delta({ percent }) {
  // No previous period to compare against -> say so rather than invent a 0%.
  if (percent == null) {
    return (
      <span className="admin-delta admin-delta--flat">
        <Minus className="admin-delta__icon" aria-hidden />
        no prior week
      </span>
    )
  }
  const up = percent >= 0
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <span className={`admin-delta${up ? '' : ' admin-delta--down'}`}>
      <Icon className="admin-delta__icon" aria-hidden />
      {up ? '+' : ''}{percent}% this week
    </span>
  )
}

export default function AdminDashboard() {
  const { email } = useAdminAuth()
  const { messages, state, error, reload } = useMessages()
  const { members, state: teamState } = useTeam()

  const stats = useMemo(() => {
    const buckets = bucketByDay(messages, { days: WINDOW_DAYS })
    return {
      buckets,
      total: messages.length,
      unread: messages.filter((m) => m.status === 'unread').length,
      overall: growth(messages),
      perForm: METRIC_FORMS.map((form) => ({ ...form, ...formSummary(messages, form.id, { days: WINDOW_DAYS }) })),
    }
  }, [messages])

  // Only chart a form once it has something to show, so the legend stays honest.
  const series = useMemo(() => {
    const present = new Set(messages.map(formIdOf))
    return FORMS.filter((form) => !form.legacy || present.has(form.id)).map((form) => ({
      id: form.id,
      name: form.name,
      color: SERIES_COLOR[form.id] ?? '#71717a',
    }))
  }, [messages])

  const recent = messages.slice(0, 7)
  const dateline = adminDateline()

  return (
    <AdminShell
      title="Overview"
      eyebrow={dateline}
      heading={<>Hello {adminDisplayName(email)} <span aria-hidden>👋</span></>}
      actions={
        <>
          <Link
            to="/admin/messages?status=unread"
            className="admin-iconbtn"
            aria-label={`${stats.unread} unread submissions`}
          >
            <Bell className="admin-iconbtn__icon" aria-hidden />
            {stats.unread > 0 ? <span className="admin-iconbtn__dot">{stats.unread}</span> : null}
          </Link>
          <button
            type="button"
            className="admin-iconbtn"
            onClick={reload}
            disabled={state === 'loading'}
            aria-label="Refresh"
          >
            <RefreshCw className="admin-iconbtn__icon" aria-hidden />
          </button>
        </>
      }
    >
      {state === 'error' ? (
        <div className="admin-alert admin-alert--error" role="alert">
          {error}{' '}
          <button type="button" className="admin-btn admin-btn--link" onClick={reload}>Try again</button>
        </div>
      ) : null}

      {state === 'loading' ? <p className="admin-empty" role="status">Loading…</p> : null}

      {state === 'ready' ? (
        <div className="admin-grid">
          <div className="admin-grid__main">
            {/* Featured ------------------------------------------------- */}
            <section className="admin-hero">
              <div className="admin-hero__glow" aria-hidden />
              <div className="admin-hero__body">
                <p className="admin-hero__label">Total submissions</p>
                <p className="admin-figure admin-hero__value">{stats.total.toLocaleString()}</p>
                <Delta percent={stats.overall.percent} />
              </div>
              <div className="admin-hero__side">
                <p className="admin-hero__sub">
                  <span className="admin-figure">{stats.overall.current}</span> in the last 7 days
                  <span className="admin-hero__dot" aria-hidden />
                  <span className="admin-figure">{stats.overall.previous}</span> the week before
                </p>
                <div className="admin-hero__actions">
                  <Link to="/admin/messages?status=unread" className="admin-btn admin-btn--primary">
                    <Inbox className="admin-rail__icon" aria-hidden />
                    {stats.unread} unread
                  </Link>
                  <Link to="/admin/messages" className="admin-btn admin-btn--ghost">View all</Link>
                </div>
              </div>
            </section>

            {/* Per-form metrics ----------------------------------------- */}
            <div className="admin-metrics">
              {stats.perForm.map((form) => (
                <Link key={form.id} to={`/admin/messages/${form.id}`} className="admin-metric">
                  <div className="admin-metric__head">
                    <p className="admin-metric__name">{form.name}</p>
                    <ArrowUpRight className="admin-metric__go" aria-hidden />
                  </div>
                  <p className="admin-figure admin-metric__value">{form.total}</p>
                  <Sparkline values={form.series} color={SERIES_COLOR[form.id]} />
                  <p className="admin-metric__foot">
                    <span className="admin-metric__chip">{form.unread} unread</span>
                    <span className="admin-metric__chip">{form.replied} replied</span>
                  </p>
                </Link>
              ))}
            </div>

            {/* Flow ------------------------------------------------------ */}
            <section className="admin-card">
              <div className="admin-card__head">
                <h2 className="admin-h2">Incoming message flow</h2>
                <span className="admin-card__note">Last {WINDOW_DAYS} days</span>
              </div>
              <MessageFlowChart buckets={stats.buckets} series={series} />
            </section>

            {/* Bottom pair ----------------------------------------------- */}
            <div className="admin-duo">
              <section className="admin-card">
                <div className="admin-card__head">
                  <h2 className="admin-h2">Submissions by form</h2>
                  <Link to="/admin/messages" className="admin-btn admin-btn--quiet">View all</Link>
                </div>
                <ul className="admin-formlist">
                  {stats.perForm.map((form) => (
                    <li key={form.id}>
                      <Link to={`/admin/messages/${form.id}`} className="admin-formlist__row">
                        <span className="admin-formlist__name">{form.name}</span>
                        <span className="admin-figure admin-formlist__count">{form.total}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="admin-card">
                <div className="admin-card__head">
                  <h2 className="admin-h2">Team access</h2>
                  <Link to="/admin/team" className="admin-btn admin-btn--quiet">
                    <UserPlus className="admin-rail__icon" aria-hidden />
                    Manage
                  </Link>
                </div>
                {teamState === 'loading' ? <p className="admin-empty" role="status">Loading…</p> : null}
                {teamState === 'error' ? <p className="admin-empty">Could not load the team.</p> : null}
                {teamState === 'ready' ? (
                  <ul className="admin-people">
                    {members.map((member) => (
                      <li key={member.id} className="admin-people__row">
                        <span className="admin-who__disc" aria-hidden>{adminInitial(member.email)}</span>
                        <span className="admin-people__text">
                          <span className="admin-people__name">{adminDisplayName(member.email)}</span>
                          <span className="admin-people__email">{member.email}</span>
                        </span>
                        <span className={`admin-pill admin-pill--${member.status === 'revoked' ? 'archived' : member.last_seen_at ? 'replied' : 'unread'}`}>
                          {member.status === 'revoked' ? 'Revoked' : member.last_seen_at ? 'Active' : 'Pending'}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            </div>
          </div>

          {/* Activity feed --------------------------------------------- */}
          <aside className="admin-grid__rail">
            <section className="admin-card admin-card--sticky">
              <div className="admin-card__head">
                <h2 className="admin-h2">Recent activity</h2>
                <Link to="/admin/messages" className="admin-btn admin-btn--quiet">View all</Link>
              </div>
              {recent.length === 0 ? (
                <p className="admin-empty">No submissions yet.</p>
              ) : (
                <ul className="admin-feed">
                  {recent.map((m) => (
                    <li key={m.id} className="admin-feed__row">
                      <span
                        className="admin-feed__tick"
                        style={{ background: SERIES_COLOR[formIdOf(m)] ?? '#71717a' }}
                        aria-hidden
                      />
                      <span className="admin-feed__body">
                        <span className="admin-feed__top">
                          <span className="admin-feed__who">{m.company || m.name}</span>
                          <span className="admin-feed__when">{relativeTime(m.created_at)}</span>
                        </span>
                        <span className="admin-feed__meta">
                          <span className="admin-tag">{formLabelForRow(m)}</span>
                          <span className={`admin-pill admin-pill--${m.status}`}>{STATUS_LABELS[m.status]}</span>
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </aside>
        </div>
      ) : null}
    </AdminShell>
  )
}
