import { useEffect, useRef, useState } from 'react'

/**
 * Scroll-driven visibility for CSS classes like `.scroll-animate.visible`
 * (horizontal slide on the landing page; Synergetic Solutions overrides inside its root).
 * Toggles whenever the observed element enters or leaves the viewport (not one-shot).
 *
 * @param {object} [options]
 * @param {boolean} [options.initialVisible] — starting state before first observation (e.g. hero above the fold)
 * @param {number} [options.threshold] — IntersectionObserver threshold (default 0.2)
 * @param {string} [options.rootMargin] — IntersectionObserver rootMargin (default `0px`)
 * @param {Element|null} [options.root] — IntersectionObserver root
 */
export const useScrollAnimation = (options = {}) => {
  const { initialVisible = false, threshold, rootMargin, root } = options
  const [isVisible, setIsVisible] = useState(initialVisible)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true)
      return undefined
    }

    const ioOpts = {
      threshold: threshold ?? 0.2,
      rootMargin: rootMargin ?? '0px',
    }
    if (root !== undefined && root !== null) {
      ioOpts.root = root
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting)
    }, ioOpts)

    observer.observe(el)
    return () => observer.disconnect()
  }, [initialVisible, threshold, rootMargin, root])

  return [ref, isVisible]
}
