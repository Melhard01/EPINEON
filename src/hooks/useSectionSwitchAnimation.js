import { useEffect, useRef, useState } from 'react'

/**
 * Section-level visibility for landing page blocks. Active when enough of the
 * section is in view; deactivates when scrolling or hash-navigating away so
 * enter animations can replay on every revisit.
 *
 * @param {object} [options]
 * @param {number} [options.ratio] — minimum intersectionRatio to count as active (default 0.32)
 * @param {string} [options.rootMargin] — IntersectionObserver rootMargin
 */
export const useSectionSwitchAnimation = (options = {}) => {
  const { ratio = 0.32, rootMargin = '0px' } = options
  const [isActive, setIsActive] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsActive(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting && entry.intersectionRatio >= ratio)
      },
      {
        rootMargin,
        threshold: [0, 0.12, 0.24, 0.32, 0.45, 0.6, 0.75, 1],
      },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [ratio, rootMargin])

  return [ref, isActive]
}
