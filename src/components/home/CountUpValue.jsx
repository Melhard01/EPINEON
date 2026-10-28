import { useEffect, useState } from 'react'
import { useCountAnimation } from '../../hooks/useCountAnimation'

// Values are authored as display strings ("30+", "100+", "6"). Split the
// leading digits from whatever trails them so the suffix is never animated.
const VALUE_PATTERN = /^(\d+)(.*)$/

/**
 * Counts from 0 to the numeric part of `value` while `active` is true, and
 * resets when it goes false — so the count replays every time the figure
 * scrolls back into view rather than firing once.
 *
 * Renders the literal value until the client has mounted, which keeps the
 * prerendered HTML (and any reader without JS) showing the real figure
 * instead of "0". It also stays literal under prefers-reduced-motion, since
 * a counter is auto-updating content (WCAG 2.2.2).
 */
export function CountUpValue({ value, active, duration = 1600 }) {
  const match = VALUE_PATTERN.exec(String(value))
  const target = match ? Number(match[1]) : null
  const suffix = match ? match[2] : ''

  const [animatable, setAnimatable] = useState(false)

  useEffect(() => {
    if (target === null) return undefined
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setAnimatable(!mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [target])

  const count = useCountAnimation(target ?? 0, duration, animatable && active)

  if (target === null || !animatable) return value
  return `${count}${suffix}`
}
