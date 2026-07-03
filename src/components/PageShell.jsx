import React, { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import '../App.css'
import '../theme-landing-dark.css'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { Seo } from './Seo'
import { scrollPageToTop } from '../lib/scrollPageToTop.js'
import { usePageSectionAnimations } from '../hooks/usePageSectionAnimations.js'

/**
 * Standard corporate-page shell: same dark chrome as the landing page.
 * Renders SiteHeader + page content + SiteFooter, scoped to .landing-page-dark so the
 * dark theme applies. Pass SEO props through to <Seo>.
 */
export function PageShell({ title, description, path, type, noindex, children }) {
  const mainRef = useRef(null)
  const { pathname } = useLocation()

  useEffect(() => {
    scrollPageToTop()
  }, [pathname])

  usePageSectionAnimations(mainRef, [pathname])

  return (
    <div className="landing-page-dark relative min-h-screen min-w-0 overflow-x-clip bg-black font-inter">
      <Seo title={title} description={description} path={path} type={type} noindex={noindex} />
      <SiteHeader />
      <main ref={mainRef} className="page-sections relative z-10">
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
