import React, { useCallback, useEffect, useMemo, useState } from 'react'

/** Distance from viewport top to treat a section as “current” (fixed header + padding). */
const STICKY_TOP_PX = 100

function findActiveSectionId(ids) {
  let active = ids[0] ?? null
  for (const id of ids) {
    const el = document.getElementById(id)
    if (!el) continue
    const { top } = el.getBoundingClientRect()
    if (top <= STICKY_TOP_PX) {
      active = id
    }
  }
  return active
}

/**
 * Desktop-only sticky “On this page” nav with scroll-spy.
 * Parent row must use align-items: stretch so this column matches main height (sticky track).
 */
export function LegalDocTocSidebar({ tocItems }) {
  const ids = useMemo(() => tocItems.map((t) => t.id), [tocItems])
  const [activeId, setActiveId] = useState(() => ids[0] ?? null)

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : ''
    if (hash && ids.includes(hash)) {
      setActiveId(hash)
    } else {
      setActiveId(ids[0] ?? null)
    }
  }, [ids])

  const updateActive = useCallback(() => {
    const next = findActiveSectionId(ids)
    if (next) setActiveId((prev) => (prev === next ? prev : next))
  }, [ids])

  useEffect(() => {
    updateActive()
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        updateActive()
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [updateActive])

  const onTocClick = (e, hash) => {
    e.preventDefault()
    const el = document.getElementById(hash)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.history.replaceState(null, '', `#${hash}`)
      setActiveId(hash)
    }
  }

  return (
    <aside
      className="legal-doc-sidebar-track hidden w-full shrink-0 md:flex md:w-[32%] md:max-w-[32%] md:flex-col md:self-stretch lg:w-[25%] lg:max-w-[25%]"
      aria-label="Document outline"
    >
      <nav
        className="legal-doc-toc-nav sticky top-[100px] w-full max-w-full self-start max-h-[calc(100vh-7rem)] overflow-y-auto overflow-x-hidden p-5"
        aria-label="On this page"
      >
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#9a8359]">
          On this page
        </p>
        <ul className="legal-doc-toc-list mt-4 space-y-0.5 pt-4 text-sm">
          {tocItems.map((item) => {
            const isActive = item.id === activeId
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => onTocClick(e, item.id)}
                  className={`legal-doc-toc-link block py-2 pl-3 pr-2 text-left transition-colors ${
                    isActive ? 'legal-doc-toc-link--active' : ''
                  }`}
                  aria-current={isActive ? 'location' : undefined}
                >
                  {item.label}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
