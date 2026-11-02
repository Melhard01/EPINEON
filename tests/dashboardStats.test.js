import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  dayKey, bucketByDay, growth, formSummary, seriesMax, relativeTime, formIdOf,
} from '../src/admin/dashboardStats.js'

/** The arithmetic behind the Overview cards and chart. */

const DAY = 86400000
const NOW = new Date('2026-11-02T12:00:00').getTime()
const ago = (days, hours = 0) => new Date(NOW - days * DAY - hours * 3600000).toISOString()

const msg = (over = {}) => ({
  id: Math.random().toString(36).slice(2),
  form_id: 'demo',
  status: 'unread',
  created_at: ago(1),
  ...over,
})

test('formIdOf falls back to the legacy bucket for a row with no form', () => {
  assert.equal(formIdOf({ form_id: 'sales' }), 'sales')
  assert.equal(formIdOf({ form_id: null }), 'contact')
  assert.equal(formIdOf({}), 'contact')
})

test('dayKey is local-time and rejects rubbish', () => {
  assert.equal(dayKey('2026-11-02T23:30:00'), '2026-11-02')
  assert.equal(dayKey('not a date'), null)
})

test('bucketByDay returns one bucket per day, oldest first', () => {
  const buckets = bucketByDay([], { days: 14, now: NOW })
  assert.equal(buckets.length, 14)
  assert.equal(buckets[13].key, dayKey(NOW))
  assert.equal(buckets[0].key, dayKey(NOW - 13 * DAY))
})

test('bucketByDay counts per day and per form', () => {
  const buckets = bucketByDay(
    [
      msg({ created_at: ago(0), form_id: 'demo' }),
      msg({ created_at: ago(0), form_id: 'demo' }),
      msg({ created_at: ago(0), form_id: 'sales' }),
      msg({ created_at: ago(3), form_id: 'partnerships' }),
    ],
    { days: 14, now: NOW },
  )
  const today = buckets[13]
  assert.equal(today.total, 3)
  assert.deepEqual(today.byForm, { demo: 2, sales: 1 })
  assert.equal(buckets[10].byForm.partnerships, 1)
})

test('bucketByDay ignores anything outside the window or unparseable', () => {
  const buckets = bucketByDay(
    [msg({ created_at: ago(40) }), msg({ created_at: 'nonsense' }), msg({ created_at: ago(2) })],
    { days: 14, now: NOW },
  )
  assert.equal(buckets.reduce((n, b) => n + b.total, 0), 1)
})

test('growth compares the period against the one before it', () => {
  const rows = [
    ...Array.from({ length: 6 }, () => msg({ created_at: ago(2) })),   // this week
    ...Array.from({ length: 2 }, () => msg({ created_at: ago(9) })),   // week before
    msg({ created_at: ago(60) }),                                      // neither
  ]
  const g = growth(rows, { now: NOW })
  assert.equal(g.current, 6)
  assert.equal(g.previous, 2)
  assert.equal(g.percent, 200)
})

test('growth reports null rather than a percentage against zero', () => {
  const g = growth([msg({ created_at: ago(1) })], { now: NOW })
  assert.equal(g.previous, 0)
  assert.equal(g.percent, null, 'there is no honest percentage to quote against an empty week')
})

test('growth handles a decline and an empty set', () => {
  const rows = [msg({ created_at: ago(1) }), ...Array.from({ length: 4 }, () => msg({ created_at: ago(10) }))]
  assert.equal(growth(rows, { now: NOW }).percent, -75)
  assert.deepEqual(growth([], { now: NOW }), { current: 0, previous: 0, percent: null })
})

test('formSummary scopes every figure to one form', () => {
  const rows = [
    msg({ form_id: 'demo', status: 'unread', created_at: ago(1) }),
    msg({ form_id: 'demo', status: 'replied', created_at: ago(2) }),
    msg({ form_id: 'sales', status: 'unread', created_at: ago(1) }),
  ]
  const demo = formSummary(rows, 'demo', { now: NOW })
  assert.equal(demo.total, 2)
  assert.equal(demo.unread, 1)
  assert.equal(demo.replied, 1)
  assert.equal(demo.archived, 0)
  assert.equal(demo.series.length, 14)
  assert.equal(demo.series.reduce((a, b) => a + b, 0), 2)
})

test('formSummary with no form id covers everything', () => {
  const rows = [msg({ form_id: 'demo' }), msg({ form_id: 'sales' })]
  assert.equal(formSummary(rows, undefined, { now: NOW }).total, 2)
})

test('seriesMax never returns zero, so a chart always has a scale', () => {
  assert.equal(seriesMax([[0, 0, 0]]), 1)
  assert.equal(seriesMax([[0, 3], [7, 1]]), 7)
  assert.equal(seriesMax([]), 1)
})

test('relativeTime reads as a feed timestamp', () => {
  assert.equal(relativeTime(new Date(NOW - 30000).toISOString(), NOW), 'just now')
  assert.equal(relativeTime(new Date(NOW - 5 * 60000).toISOString(), NOW), '5m ago')
  assert.equal(relativeTime(new Date(NOW - 3 * 3600000).toISOString(), NOW), '3h ago')
  assert.equal(relativeTime(new Date(NOW - 2 * DAY).toISOString(), NOW), '2d ago')
  assert.equal(relativeTime('nonsense', NOW), '')
  // Beyond a week it switches to a date rather than an ever-growing day count.
  assert.match(relativeTime(new Date(NOW - 30 * DAY).toISOString(), NOW), /\w/)
})
