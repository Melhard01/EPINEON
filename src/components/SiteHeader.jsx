import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, ChevronDown, ArrowUpRight } from 'lucide-react'
import { Button } from './ui/button'
import epineonWordmarkLogo from '../assets/epineon_logo_wordmark.png'
import { ECOSYSTEMS } from '../data/ecosystem.js'
import {
  SOLUTIONS_LINKS,
  INDUSTRIES_LINKS,
  COMPANY_LINKS,
  UTILITY_LINKS,
  PRIMARY_CTA,
} from '../data/navigation.js'

const DESKTOP_NAV_MQ = '(min-width: 1024px)'
const MENU_CLOSE_DELAY_MS = 130

/** Outbound product entry for the Products mega-menu + mobile group. */
function ProductMenuItem({ product, onNavigate }) {
  const isLive = product.status === 'live'
  const body = (
    <>
      <span className="megamenu-item-dot" aria-hidden />
      <span className="megamenu-item-body">
        <span className="megamenu-item-name">
          {product.name}
          {isLive || product.demoHref ? (
            <ArrowUpRight className="megamenu-item-arrow" aria-hidden />
          ) : (
            <span className="megamenu-item-soon">Coming soon</span>
          )}
        </span>
        <span className="megamenu-item-positioning">{product.positioning}</span>
        <span className="megamenu-item-audience">{product.audience}</span>
      </span>
    </>
  )

  // Internal demo route (e.g. EPICRYPT / EPIQUANTUM → prefilled demo form).
  if (product.demoHref) {
    return (
      <Link
        to={product.demoHref}
        onClick={onNavigate}
        className="megamenu-item group"
        style={{ '--product-accent': product.accent }}
      >
        {body}
      </Link>
    )
  }

  const linkProps = isLive
    ? { href: product.href, target: '_blank', rel: 'noopener noreferrer' }
    : { href: product.href }
  return (
    <a {...linkProps} onClick={onNavigate} className="megamenu-item group" style={{ '--product-accent': product.accent }}>
      {body}
    </a>
  )
}

/** Simple list dropdown (Solutions / Industries / Company). */
function NavDropdown({ id, label, items, openMenu, onOpen, onScheduleClose, onNavigate }) {
  const isOpen = openMenu === id
  return (
    <div
      className="site-header-dropdown"
      onMouseEnter={() => onOpen(id)}
      onMouseLeave={onScheduleClose}
    >
      <button
        type="button"
        className="site-header-nav-link site-header-nav-trigger"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => (isOpen ? onScheduleClose() : onOpen(id))}
        onFocus={() => onOpen(id)}
      >
        {label}
        <ChevronDown className={`site-header-products-chevron${isOpen ? ' is-open' : ''}`} aria-hidden />
      </button>
      <div className={`site-header-dropdown-panel${isOpen ? ' is-open' : ''}`} aria-hidden={!isOpen}>
        <ul>
          {items.map((item) => (
            <li key={item.href}>
              <Link to={item.href} className="site-header-dropdown-item" onClick={onNavigate}>
                <span className="site-header-dropdown-item-label">{item.label}</span>
                {item.blurb ? (
                  <span className="site-header-dropdown-item-blurb">{item.blurb}</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function SiteHeader() {
  const headerRef = useRef(null)
  const navScrollSentinelRef = useRef(null)
  const [headerScrolled, setHeaderScrolled] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState(null) // 'solutions'|'products'|'industries'|'company'|null
  const [mobileSection, setMobileSection] = useState(null)
  const closeTimer = useRef(null)

  useEffect(() => {
    const sentinel = navScrollSentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => setHeaderScrolled(!entry.isIntersecting),
      { root: null, rootMargin: '0px', threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!mobileNavOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileNavOpen])

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_NAV_MQ)
    const closeIfDesktop = () => {
      if (mq.matches) setMobileNavOpen(false)
    }
    closeIfDesktop()
    mq.addEventListener('change', closeIfDesktop)
    return () => mq.removeEventListener('change', closeIfDesktop)
  }, [])

  // Escape closes everything; click-outside closes desktop dropdowns.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileNavOpen(false)
        setOpenMenu(null)
      }
    }
    const onPointerDown = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) setOpenMenu(null)
    }
    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [])

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  const openMenuFn = (k) => {
    clearTimeout(closeTimer.current)
    setOpenMenu(k)
  }
  const scheduleClose = () => {
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpenMenu(null), MENU_CLOSE_DELAY_MS)
  }
  const closeAll = () => {
    setMobileNavOpen(false)
    setOpenMenu(null)
    setMobileSection(null)
  }

  return (
    <>
      <div
        ref={navScrollSentinelRef}
        className="pointer-events-none absolute left-0 top-[var(--site-header-height,5rem)] h-px w-px opacity-0"
        aria-hidden
      />
      <header
        ref={headerRef}
        className={`site-header fixed top-0 w-full bg-black border-b border-white/10 backdrop-blur-md z-50 lg:bg-[#ffffff] lg:border-black/10 lg:backdrop-blur-sm${headerScrolled ? ' scrolled' : ''}${mobileNavOpen ? ' site-header--menu-open' : ''}${openMenu ? ' site-header--mega-open' : ''}`}
      >
        <div className="site-header__content site-content w-full min-w-0">
          <div className="site-header-inner relative flex min-w-0 items-center gap-3 lg:gap-5">
            <div className="site-header-logo flex min-w-0 shrink-0 items-center self-center">
              <Link to="/" className="site-header-logo-link flex min-w-0 max-w-full items-center" onClick={closeAll}>
                <img
                  src={epineonWordmarkLogo}
                  alt="Epineon — Precision Life Science"
                  className="site-header-wordmark site-brand-wordmark"
                />
              </Link>
            </div>

            <button
              type="button"
              className="site-header-menu-btn relative z-[60] ml-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/5 text-white shadow-none hover:bg-white/10 sm:h-11 sm:w-11 lg:hidden"
              aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen((o) => !o)}
            >
              {mobileNavOpen ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
            </button>

            {/* Desktop primary nav (left) */}
            <nav className="site-header-primary hidden lg:flex min-w-0 items-center self-center">
              <NavDropdown
                id="solutions"
                label="USE CASES"
                items={SOLUTIONS_LINKS}
                openMenu={openMenu}
                onOpen={openMenuFn}
                onScheduleClose={scheduleClose}
                onNavigate={closeAll}
              />

              {/* Products mega-menu trigger */}
              <div
                className="site-header-products"
                onMouseEnter={() => openMenuFn('products')}
                onMouseLeave={scheduleClose}
              >
                <button
                  type="button"
                  className="site-header-nav-link site-header-nav-trigger"
                  aria-haspopup="true"
                  aria-expanded={openMenu === 'products'}
                  onClick={() => (openMenu === 'products' ? scheduleClose() : openMenuFn('products'))}
                  onFocus={() => openMenuFn('products')}
                >
                  PRODUCTS
                  <ChevronDown
                    className={`site-header-products-chevron${openMenu === 'products' ? ' is-open' : ''}`}
                    aria-hidden
                  />
                </button>
              </div>

              <NavDropdown
                id="industries"
                label="INDUSTRIES"
                items={INDUSTRIES_LINKS}
                openMenu={openMenu}
                onOpen={openMenuFn}
                onScheduleClose={scheduleClose}
                onNavigate={closeAll}
              />

              <Link to="/customers" className="site-header-nav-link" onClick={closeAll}>
                CUSTOMERS
              </Link>

              <NavDropdown
                id="company"
                label="COMPANY"
                items={COMPANY_LINKS}
                openMenu={openMenu}
                onOpen={openMenuFn}
                onScheduleClose={scheduleClose}
                onNavigate={closeAll}
              />
            </nav>

            {/* Desktop utility bar (right) */}
            <div className="site-header-utility ml-auto hidden lg:flex items-center self-center shrink-0">
              {UTILITY_LINKS.map((item) => (
                <Link key={item.href} to={item.href} className="site-header-utility-link" onClick={closeAll}>
                  {item.label}
                </Link>
              ))}
              <Link to={PRIMARY_CTA.href} className="site-header-cta-persistent" onClick={closeAll}>
                <Button className="epineon-btn-primary header-cta-get-started rounded-full px-4 py-2 text-sm shadow-md xl:px-5 xl:py-2.5 xl:text-base">
                  {PRIMARY_CTA.label}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop Products mega-menu — outbound routing surface, grouped by ecosystem */}
        <div
          className={`site-header-megamenu hidden lg:block${openMenu === 'products' ? ' is-open' : ''}`}
          onMouseEnter={() => openMenuFn('products')}
          onMouseLeave={scheduleClose}
          aria-hidden={openMenu !== 'products'}
        >
          <div className="site-content">
            <div className="site-header-megamenu-grid">
              {ECOSYSTEMS.map((eco) => (
                <div className="megamenu-col" key={eco.id} style={{ '--eco-accent': eco.accent }}>
                  <div className="megamenu-col-head">
                    <span className="megamenu-eco-name">{eco.name}</span>
                    <span className="megamenu-eco-eyebrow">{eco.eyebrow}</span>
                  </div>
                  <div className="megamenu-col-list">
                    {eco.products.map((product) => (
                      <ProductMenuItem key={product.id} product={product} onNavigate={scheduleClose} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="site-header-megamenu-foot">
              <span>Each product lives on its own platform.</span>
              <Link to="/products" className="site-header-megamenu-viewall" onClick={closeAll}>
                View all products
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {mobileNavOpen ? (
        <div
          className="site-header-mobile-panel fixed bottom-0 left-0 right-0 z-[55] flex min-h-0 w-full min-w-0 flex-col bg-black lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <nav className="site-header-mobile-nav flex h-full w-full min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain px-[var(--site-content-gutter)] pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
            <MobileAccordion
              label="Use Cases"
              open={mobileSection === 'solutions'}
              onToggle={() => setMobileSection((s) => (s === 'solutions' ? null : 'solutions'))}
            >
              {SOLUTIONS_LINKS.map((l) => (
                <Link key={l.href} to={l.href} className="mobile-sub-link" onClick={closeAll}>
                  {l.label}
                </Link>
              ))}
            </MobileAccordion>

            <MobileAccordion
              label="Products"
              open={mobileSection === 'products'}
              onToggle={() => setMobileSection((s) => (s === 'products' ? null : 'products'))}
            >
              {ECOSYSTEMS.map((eco) => (
                <div key={eco.id} className="mb-2">
                  <div className="mobile-eco-label" style={{ color: eco.accent }}>
                    {eco.name}
                  </div>
                  {eco.products.map((product) => {
                    const isLive = product.status === 'live'
                    if (product.demoHref) {
                      return (
                        <Link key={product.id} to={product.demoHref} onClick={closeAll} className="mobile-product-link">
                          <span>{product.name}</span>
                          <ArrowUpRight className="h-4 w-4 shrink-0 text-white/50" aria-hidden />
                        </Link>
                      )
                    }
                    const props = isLive
                      ? { href: product.href, target: '_blank', rel: 'noopener noreferrer' }
                      : { href: product.href }
                    return (
                      <a key={product.id} {...props} onClick={closeAll} className="mobile-product-link">
                        <span>{product.name}</span>
                        {isLive ? (
                          <ArrowUpRight className="h-4 w-4 shrink-0 text-white/50" aria-hidden />
                        ) : (
                          <span className="mobile-soon">Soon</span>
                        )}
                      </a>
                    )
                  })}
                </div>
              ))}
              <Link to="/products" className="mobile-sub-link font-semibold" onClick={closeAll}>
                View all products →
              </Link>
            </MobileAccordion>

            <MobileAccordion
              label="Industries"
              open={mobileSection === 'industries'}
              onToggle={() => setMobileSection((s) => (s === 'industries' ? null : 'industries'))}
            >
              {INDUSTRIES_LINKS.map((l) => (
                <Link key={l.href} to={l.href} className="mobile-sub-link" onClick={closeAll}>
                  {l.label}
                </Link>
              ))}
            </MobileAccordion>

            <Link to="/customers" className="mobile-top-link" onClick={closeAll}>
              Customers
            </Link>

            <MobileAccordion
              label="Company"
              open={mobileSection === 'company'}
              onToggle={() => setMobileSection((s) => (s === 'company' ? null : 'company'))}
            >
              {COMPANY_LINKS.map((l) => (
                <Link key={l.href} to={l.href} className="mobile-sub-link" onClick={closeAll}>
                  {l.label}
                </Link>
              ))}
            </MobileAccordion>

            <div className="mt-2 border-t border-white/10 pt-3">
              {UTILITY_LINKS.map((l) => (
                <Link key={l.href} to={l.href} className="mobile-top-link" onClick={closeAll}>
                  {l.label}
                </Link>
              ))}
              <Link to={PRIMARY_CTA.href} className="mt-3 flex w-full justify-center" onClick={closeAll}>
                <Button className="epineon-btn-primary header-cta-get-started w-full rounded-full px-5 py-3 text-base shadow-md">
                  {PRIMARY_CTA.label}
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </>
  )
}

/** Mobile accordion section with a chevron toggle. */
function MobileAccordion({ label, open, onToggle, children }) {
  return (
    <div className="mobile-accordion">
      <button
        type="button"
        className="mobile-accordion-trigger"
        aria-expanded={open}
        onClick={onToggle}
      >
        {label}
        <ChevronDown className={`h-5 w-5 transition-transform${open ? ' rotate-180' : ''}`} aria-hidden />
      </button>
      {open ? <div className="mobile-accordion-body">{children}</div> : null}
    </div>
  )
}
