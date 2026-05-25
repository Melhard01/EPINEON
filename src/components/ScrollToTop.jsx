import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { scrollPageToTop } from '../lib/scrollPageToTop.js'

/** Scroll window to top on route change (skip when navigating to in-page #hash). */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) return
    scrollPageToTop()
  }, [pathname, hash])

  return null
}
