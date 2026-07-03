import React, { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { scrollPageToTop } from '../lib/scrollPageToTop.js'
import { usePageSectionAnimations } from '../hooks/usePageSectionAnimations.js'
import '../App.css'
import '../theme-landing-dark.css'
import '../legal-doc.css'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { Seo } from './Seo'
import { LegalDocTocSidebar } from './LegalDocTocSidebar'

/**
 * Legal document shell: same site chrome as `App`, grid background, sticky TOC on the left (md+).
 * Pass unchanged policy body as children.
 */
export function LegalDocLayout({
  title,
  path,
  lastUpdated,
  effectiveDate,
  tocItems,
  children,
}) {
  const mainRef = useRef(null)
  const { pathname } = useLocation()

  useEffect(() => {
    scrollPageToTop()
  }, [pathname])

  usePageSectionAnimations(mainRef, [pathname])

  return (
    <div
      className="landing-page-dark relative min-h-screen overflow-x-clip bg-black font-inter"
    >
      <Seo title={title} description={`${title} for Epineon.`} path={path} />
      <SiteHeader />

      <div className="legal-page-root relative min-h-screen bg-black text-white pt-24 lg:pt-28">
        <div className="legal-page-grid" aria-hidden />

        <div className="relative z-10">
          <div className="site-content min-w-0 py-10 lg:py-14">
            <main ref={mainRef} className="page-sections min-w-0">
              <section className="mb-10 lg:mb-12" data-animate-section>
                <h1 className="epineon-legal-doc-title text-3xl text-white sm:text-4xl lg:text-5xl">
                  {title}
                </h1>
                <div className="mt-4 flex flex-col gap-1 font-mono text-xs uppercase tracking-wide text-white/45 sm:flex-row sm:gap-8">
                  <span>Last updated {lastUpdated}</span>
                  <span>Effective date {effectiveDate}</span>
                </div>
              </section>

              <div className="flex flex-col gap-10 md:flex-row md:items-stretch md:gap-10 lg:gap-12 xl:gap-16">
                <LegalDocTocSidebar tocItems={tocItems} />

                <div
                  className="legal-doc-main min-w-0 flex-1 md:w-[68%] md:max-w-[68%] lg:w-[75%] lg:max-w-[75%] lg:flex-none"
                  data-animate-section
                >
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
