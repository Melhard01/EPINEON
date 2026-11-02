import { useMemo, useRef, useState } from 'react'
import { seriesMax } from './dashboardStats.js'

/**
 * Incoming message flow, one line per form.
 *
 * Hand-drawn SVG rather than a charting library on purpose: this app ships as a
 * single bundle (no route splitting), so anything imported here is also
 * downloaded by every visitor to the public marketing site. Recharts is in
 * package.json but unused, and pulling it in for one chart would put ~400kB on
 * a bundle that already trips Vite's size warning.
 *
 * The viewBox is fixed and the SVG scales to its container; strokes carry
 * vector-effect="non-scaling-stroke" so they stay 2px at any width.
 */

const W = 720
const H = 240
const PAD = { top: 16, right: 14, bottom: 28, left: 34 }
const INNER_W = W - PAD.left - PAD.right
const INNER_H = H - PAD.top - PAD.bottom

const pointAt = (index, value, count, max) => ({
  x: PAD.left + (count === 1 ? INNER_W / 2 : (index * INNER_W) / (count - 1)),
  y: PAD.top + INNER_H - (value / max) * INNER_H,
})

const linePath = (values, max) =>
  values
    .map((value, i) => {
      const { x, y } = pointAt(i, value, values.length, max)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

export function MessageFlowChart({ buckets, series }) {
  const [hidden, setHidden] = useState(() => new Set())
  const [hoverIndex, setHoverIndex] = useState(null)
  const svgRef = useRef(null)

  const visible = series.filter((s) => !hidden.has(s.id))

  const values = useMemo(
    () => new Map(series.map((s) => [s.id, buckets.map((b) => b.byForm[s.id] ?? 0)])),
    [buckets, series],
  )

  const max = useMemo(
    () => seriesMax(visible.map((s) => values.get(s.id) ?? [])),
    [visible, values],
  )

  // A y-axis that lands on whole messages — fractional counts would be a lie.
  const ticks = useMemo(() => {
    const step = Math.max(1, Math.ceil(max / 3))
    const out = []
    for (let v = 0; v <= max; v += step) out.push(v)
    if (out[out.length - 1] !== max) out.push(max)
    return out
  }, [max])

  const toggle = (id) =>
    setHidden((prev) => {
      const next = new Set(prev)
      // Never let the last visible line be switched off: an empty chart reads
      // as "no data" rather than "you hid everything".
      if (next.has(id)) next.delete(id)
      else if (visible.length > 1) next.add(id)
      return next
    })

  const onPointerMove = (event) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect || buckets.length === 0) return
    const ratio = (event.clientX - rect.left) / rect.width
    const x = ratio * W - PAD.left
    const index = Math.round((x / INNER_W) * (buckets.length - 1))
    setHoverIndex(Math.min(buckets.length - 1, Math.max(0, index)))
  }

  const hovered = hoverIndex == null ? null : buckets[hoverIndex]
  const hoverX = hoverIndex == null ? 0 : pointAt(hoverIndex, 0, buckets.length, max).x

  // Roughly six x labels, however many days are in the window.
  const labelEvery = Math.max(1, Math.ceil(buckets.length / 6))

  return (
    <div className="admin-chart">
      <div className="admin-chart__legend">
        {series.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`admin-chart__key${hidden.has(s.id) ? ' is-off' : ''}`}
            onClick={() => toggle(s.id)}
            aria-pressed={!hidden.has(s.id)}
          >
            <span className="admin-chart__swatch" style={{ background: s.color }} />
            {s.name}
          </button>
        ))}
      </div>

      <div className="admin-chart__plot">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="admin-chart__svg"
          role="img"
          aria-label={`Incoming messages per day, by form, over the last ${buckets.length} days`}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="adChartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={visible[0]?.color ?? '#c9a227'} stopOpacity="0.2" />
              <stop offset="100%" stopColor={visible[0]?.color ?? '#c9a227'} stopOpacity="0" />
            </linearGradient>
          </defs>

          {ticks.map((value) => {
            const { y } = pointAt(0, value, buckets.length, max)
            return (
              <g key={value}>
                <line
                  x1={PAD.left} x2={W - PAD.right} y1={y} y2={y}
                  stroke="rgba(255,255,255,0.07)" strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
                <text x={PAD.left - 8} y={y + 4} textAnchor="end" className="admin-chart__axis">
                  {value}
                </text>
              </g>
            )
          })}

          {buckets.map((bucket, i) =>
            i % labelEvery === 0 || i === buckets.length - 1 ? (
              <text
                key={bucket.key}
                x={pointAt(i, 0, buckets.length, max).x}
                y={H - 8}
                textAnchor="middle"
                className="admin-chart__axis"
              >
                {bucket.label}
              </text>
            ) : null,
          )}

          {/* Area under the first visible line, for depth. */}
          {visible[0] ? (
            <path
              d={`${linePath(values.get(visible[0].id) ?? [], max)} L${W - PAD.right},${PAD.top + INNER_H} L${PAD.left},${PAD.top + INNER_H} Z`}
              fill="url(#adChartFill)"
            />
          ) : null}

          {visible.map((s) => (
            <path
              key={s.id}
              d={linePath(values.get(s.id) ?? [], max)}
              fill="none"
              stroke={s.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {hoverIndex != null ? (
            <>
              <line
                x1={hoverX} x2={hoverX} y1={PAD.top} y2={PAD.top + INNER_H}
                stroke="rgba(255,255,255,0.22)" strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              {visible.map((s) => {
                const value = (values.get(s.id) ?? [])[hoverIndex] ?? 0
                const { x, y } = pointAt(hoverIndex, value, buckets.length, max)
                return <circle key={s.id} cx={x} cy={y} r="3.5" fill="#09090b" stroke={s.color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
              })}
            </>
          ) : null}
        </svg>

        {hovered ? (
          <div
            className="admin-chart__tip"
            style={{ left: `${(hoverX / W) * 100}%` }}
            role="status"
          >
            <p className="admin-chart__tip-day">{hovered.label}</p>
            {visible.map((s) => (
              <p key={s.id} className="admin-chart__tip-row">
                <span className="admin-chart__swatch" style={{ background: s.color }} />
                {s.name}
                <span className="admin-chart__tip-value">{hovered.byForm[s.id] ?? 0}</span>
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

/** Thumbnail trend for a metric card. Same no-library reasoning as above. */
export function Sparkline({ values, color = '#c9a227' }) {
  const max = Math.max(1, ...values)
  const w = 100
  const h = 28
  const points = values
    .map((value, i) => {
      const x = values.length === 1 ? w / 2 : (i * w) / (values.length - 1)
      const y = h - (value / max) * (h - 3) - 1.5
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="admin-spark" aria-hidden preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
