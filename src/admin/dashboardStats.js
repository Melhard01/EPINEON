/**
 * Derivations behind the Overview dashboard.
 *
 * Pure functions over the rows useMessages() already holds — no extra query,
 * no React — so the arithmetic can be unit-tested directly
 * (tests/dashboardStats.test.js) rather than only eyeballed on a chart.
 *
 * Everything is computed from real rows. Where there is not enough history to
 * state something honestly (a growth figure with no previous period to compare
 * against) the function returns null and the UI shows a dash.
 */
import { inferFormId } from '../../api/_lib/forms.js'

const DAY_MS = 24 * 60 * 60 * 1000

/** Local-time YYYY-MM-DD, so "today" means the operator's today. */
export function dayKey(date) {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return null
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Midnight local time, as a timestamp. */
function startOfDay(ts) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** Single definition of which form a row belongs to, shared with the hook. */
export const formIdOf = (message) => inferFormId(message)

/**
 * One bucket per day for the last `days` days, newest last.
 *
 * @returns {Array<{key: string, label: string, total: number, byForm: Record<string, number>}>}
 */
export function bucketByDay(messages, { days = 14, now = Date.now() } = {}) {
  const today = startOfDay(now)
  const buckets = []
  const index = new Map()

  for (let i = days - 1; i >= 0; i -= 1) {
    const ts = today - i * DAY_MS
    const key = dayKey(ts)
    const bucket = {
      key,
      label: new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
      total: 0,
      byForm: {},
    }
    buckets.push(bucket)
    index.set(key, bucket)
  }

  for (const message of messages) {
    const bucket = index.get(dayKey(message.created_at))
    if (!bucket) continue // older than the window, or an unparseable date
    bucket.total += 1
    const id = formIdOf(message)
    bucket.byForm[id] = (bucket.byForm[id] ?? 0) + 1
  }

  return buckets
}

/**
 * This period against the one before it.
 *
 * @returns {{current: number, previous: number, percent: number|null}}
 *          percent is null when the previous period was empty — there is no
 *          honest percentage to quote against zero.
 */
export function growth(messages, { windowDays = 7, now = Date.now() } = {}) {
  const windowMs = windowDays * DAY_MS
  const currentFrom = now - windowMs
  const previousFrom = now - windowMs * 2

  let current = 0
  let previous = 0
  for (const message of messages) {
    const ts = Date.parse(message.created_at)
    if (!Number.isFinite(ts)) continue
    if (ts > currentFrom) current += 1
    else if (ts > previousFrom) previous += 1
  }

  return {
    current,
    previous,
    percent: previous === 0 ? null : Math.round(((current - previous) / previous) * 100),
  }
}

/** Status counts plus a daily series, for one form or (formId omitted) all of them. */
export function formSummary(messages, formId, { days = 14, now = Date.now() } = {}) {
  const rows = formId ? messages.filter((m) => formIdOf(m) === formId) : messages
  const byStatus = { unread: 0, read: 0, replied: 0, archived: 0 }
  for (const row of rows) {
    if (row.status in byStatus) byStatus[row.status] += 1
  }
  return {
    total: rows.length,
    ...byStatus,
    growth: growth(rows, { now }),
    series: bucketByDay(rows, { days, now }).map((b) => b.total),
  }
}

/** Largest daily total across the given series, floored at 1 so charts have a scale. */
export function seriesMax(seriesList) {
  let max = 0
  for (const series of seriesList) {
    for (const value of series) if (value > max) max = value
  }
  return Math.max(max, 1)
}

/** "just now" / "4h ago" / "3d ago" — short enough for a feed row. */
export function relativeTime(value, now = Date.now()) {
  const ts = Date.parse(value)
  if (!Number.isFinite(ts)) return ''
  const seconds = Math.round((now - ts) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}
