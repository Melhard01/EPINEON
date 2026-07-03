import { useEffect } from 'react'

const SECTION_SELECTOR = [
  'section:not([data-no-section-animate]):not(.legal-doc-main section)',
  '[data-animate-section]',
  'article.about-strip-row',
].join(', ')

const ANIMATE_TARGET_SELECTOR = [
  '.scroll-animate',
  '.scroll-animate-slide-left',
  '.scroll-animate-slide-right',
  '.scroll-animate-scale',
  '.scroll-animate-fade',
  '.text-reveal',
].join(', ')

function setSectionActive(section, active) {
  section.classList.toggle('page-section--active', active)
  section.classList.toggle('landing-section--active', active)
  section.querySelectorAll(ANIMATE_TARGET_SELECTOR).forEach((el) => {
    el.classList.toggle('visible', active)
  })
}

/**
 * Observes page sections inside a container and toggles enter animations whenever
 * a block becomes sufficiently visible — works across all routes and replays on revisit.
 */
export function usePageSectionAnimations(containerRef, deps = [], options = {}) {
  const { sectionSnap = false } = options

  useEffect(() => {
    const root = containerRef.current
    if (!root) return undefined

    const reducedMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const sections = root.querySelectorAll(SECTION_SELECTOR)
    if (!sections.length) return undefined

    if (reducedMotion) {
      sections.forEach((section) => setSectionActive(section, true))
      return undefined
    }

    const observers = []
    const observerOptions = sectionSnap
      ? {
          rootMargin: '0px 0px 20% 0px',
          threshold: [0, 0.05, 0.1, 0.18, 0.28, 0.4, 0.55, 0.7, 1],
        }
      : {
          rootMargin: '0px',
          threshold: [0, 0.06, 0.12, 0.2, 0.28, 0.4, 0.55, 0.7, 1],
        }
    const activateRatio = sectionSnap ? 0.05 : 0.12

    sections.forEach((section) => {
      setSectionActive(section, false)

      const observer = new IntersectionObserver(
        ([entry]) => {
          setSectionActive(section, entry.isIntersecting && entry.intersectionRatio >= activateRatio)
        },
        observerOptions,
      )

      observer.observe(section)
      observers.push({ observer, section })
    })

    return () => {
      observers.forEach(({ observer, section }) => {
        observer.disconnect()
        setSectionActive(section, false)
      })
    }
  }, [...deps, sectionSnap])
}
