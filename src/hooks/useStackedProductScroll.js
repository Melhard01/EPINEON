import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

const STICKY_TOP_PX = 96
const EXIT_PADDING_VH = 0.15

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function buildPhases(heights, viewportHeight) {
  const n = heights.length
  if (n === 0) return { phases: [], totalScroll: 0, viewable: 0 }

  const viewable = Math.max(320, viewportHeight - STICKY_TOP_PX)
  const phases = []
  let cursor = 0

  const holdIntro = Math.min(heights[0] * 0.25, viewable * 0.35)

  phases.push({
    start: 0,
    end: holdIntro,
    apply: () => {
      const y = Array(n).fill(0)
      for (let j = 1; j < n; j += 1) y[j] = viewable
      return y
    },
  })
  cursor = holdIntro

  for (let i = 1; i < n; i += 1) {
    const revealLen = viewable + Math.max(0, heights[i] - viewable)
    const coverLen = heights[i - 1]
    const stackTop = heights[0]

    phases.push({
      start: cursor,
      end: cursor + revealLen,
      apply: (t) => {
        const y = Array(n).fill(0)
        for (let j = 1; j < n; j += 1) y[j] = viewable
        for (let j = 0; j < i; j += 1) y[j] = 0
        for (let j = i + 1; j < n; j += 1) y[j] = viewable
        y[i] = viewable - easeInOutCubic(t) * (viewable - stackTop)
        return y
      },
    })
    cursor += revealLen

    phases.push({
      start: cursor,
      end: cursor + coverLen,
      apply: (t) => {
        const y = Array(n).fill(0)
        for (let j = 1; j < n; j += 1) y[j] = viewable
        for (let j = 0; j < i; j += 1) y[j] = 0
        for (let j = i + 1; j < n; j += 1) y[j] = viewable
        y[i] = stackTop * (1 - easeInOutCubic(t))
        return y
      },
    })
    cursor += coverLen
  }

  const totalScroll = cursor + viewable * EXIT_PADDING_VH
  return { phases, totalScroll, viewable }
}

function transformsForScroll(scroll, phases, count, viewable) {
  const y = Array(count).fill(0)
  for (let i = 1; i < count; i += 1) y[i] = viewable

  if (phases.length === 0) return y

  const last = phases[phases.length - 1]
  if (scroll >= last.end) {
    for (let i = 0; i < count; i += 1) y[i] = 0
    return y
  }

  for (const phase of phases) {
    if (scroll >= phase.start && scroll < phase.end) {
      const t = (scroll - phase.start) / (phase.end - phase.start)
      return phase.apply(t)
    }
  }

  if (scroll < phases[0].start) {
    return phases[0].apply(0)
  }

  return y
}

/**
 * Scroll-driven stacked product cards (/products — Enterprise AI, Health & Wellness).
 * Returns translateY (px) per card and track height for the scroll runway.
 */
export function useStackedProductScroll(cardCount) {
  const trackRef = useRef(null)
  const cardRefs = useRef([])
  const [heights, setHeights] = useState(() => Array(cardCount).fill(0))
  const [transformsY, setTransformsY] = useState(() => Array(cardCount).fill(0))
  const [pinHeight, setPinHeight] = useState(0)
  const [trackHeightPx, setTrackHeightPx] = useState(0)
  const [enabled, setEnabled] = useState(true)

  const setCardRef = useCallback(
    (index) => (node) => {
      cardRefs.current[index] = node
    },
    [],
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setEnabled(!mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const measure = useCallback(() => {
    const next = cardRefs.current.map((el) => el?.offsetHeight ?? 0)
    setHeights(next)
    setPinHeight(Math.max(...next, 1))
  }, [])

  useLayoutEffect(() => {
    measure()
    const ro = new ResizeObserver(() => measure())
    cardRefs.current.forEach((el) => {
      if (el) ro.observe(el)
    })
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [measure, cardCount])

  const { phases, totalScroll, viewable } = useMemo(
    () => buildPhases(heights, typeof window !== 'undefined' ? window.innerHeight : 900),
    [heights],
  )

  useLayoutEffect(() => {
    const viewable = Math.max(320, (typeof window !== 'undefined' ? window.innerHeight : 900) - STICKY_TOP_PX)
    setTrackHeightPx(totalScroll + viewable)
  }, [totalScroll])

  const updateScroll = useCallback(() => {
    if (!enabled || !trackRef.current || heights.every((h) => h === 0)) {
      return
    }

    const track = trackRef.current
    const rect = track.getBoundingClientRect()
    const scroll = Math.max(0, Math.min(-rect.top + STICKY_TOP_PX, totalScroll))
    const y = transformsForScroll(scroll, phases, cardCount, viewable)
    setTransformsY(y)
  }, [enabled, heights, phases, totalScroll, viewable, cardCount])

  useEffect(() => {
    if (!enabled) return undefined

    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(updateScroll)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    updateScroll()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [enabled, updateScroll])

  useLayoutEffect(() => {
    updateScroll()
  }, [updateScroll, heights, phases])

  return {
    trackRef,
    setCardRef,
    transformsY,
    pinHeight,
    trackHeightPx,
    stickyTopPx: STICKY_TOP_PX,
    enabled,
  }
}
