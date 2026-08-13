import React from 'react'
import { Link } from 'react-router-dom'
import epineonWordmarkLogo from '../assets/epineon_logo_wordmark.png'
import { scrollPageToTop } from '../lib/scrollPageToTop.js'

// Live products link to their own domains (new tab); under-development products route
// to the portfolio page until they have a site. (No more broken /#epi-* anchors.)
const FOOTER_SOLUTIONS = [
  { label: 'Qaegis', href: 'https://quantumaegis.ai/', external: true },
  { label: 'EPIWELL', href: 'https://epiwell.tech/', external: true },
  { label: 'SoulChain', href: 'https://soulchain.net/', external: true },
  { label: 'Epitrust', href: '/products#epitrust' },
  { label: 'EPIQUANTUM', href: '/products#epiquantum' },
  { label: 'EPICRYPT', href: '/products#epicrypt' },
]

/** Same footer slab as the landing page (`App.jsx`). */
function FooterSolutionLinks({ listClassName, linkClassName }) {
  return (
    <ul className={listClassName}>
      {FOOTER_SOLUTIONS.map(({ label, href, external }) => (
        <li key={label}>
          {external ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
            >
              {label}
            </a>
          ) : (
            <Link to={href} className={linkClassName}>
              {label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  )
}

export function SiteFooter() {
  const linkMuted =
    'footer-mobile-link transition-colors hover:text-white block py-1.5'

  return (
    <footer className="site-footer relative z-30 w-full py-12 lg:py-16 overflow-hidden">
      <div className="site-content min-w-0">
        {/* Mobile: centered stack (reference: logo → tagline → cookie → grouped legal → follow) */}
        <div className="flex flex-col items-center text-center md:hidden">
          <Link to="/" className="inline-block">
            <img
              src={epineonWordmarkLogo}
              alt="Epineon — Precision Life Science"
              className="site-brand-wordmark site-brand-wordmark--center mx-auto"
            />
          </Link>
          <div className="footer-mobile-tagline mt-4 max-w-sm text-sm leading-relaxed">
            Precision life science, powered by AI you can trust.
          </div>
          <div className="mt-10 w-full max-w-xs">
            <h4 className="text-base font-semibold text-white tracking-tight">Products</h4>
            <FooterSolutionLinks
              listClassName="mt-3 space-y-0.5 text-sm"
              linkClassName={linkMuted}
            />
          </div>
          <div className="mt-10 w-full max-w-xs">
            <h4 className="text-base font-semibold text-white tracking-tight">
              Resources
            </h4>
            <ul className="mt-3 space-y-0.5 text-sm">
              <li>
                <Link to="/privacy" className={linkMuted} onClick={scrollPageToTop}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className={linkMuted} onClick={scrollPageToTop}>
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className={linkMuted} onClick={scrollPageToTop}>
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
          <div className="mt-10 w-full">
            <h4 className="text-base font-semibold text-white tracking-tight">
              Follow Us
            </h4>
            <div className="mt-4 flex justify-center gap-4 sm:gap-5">
              <a
                href="https://www.instagram.com/epineon.now/"
                target="_blank"
                rel="noopener noreferrer"
                className="site-footer-social-btn lp-icon-chip rounded-xl hover:scale-110 transition-transform duration-300"
                aria-label="Follow Epineon on Instagram"
              >
                <svg className="h-5 w-5 shrink-0 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/epineonn"
                target="_blank"
                rel="noopener noreferrer"
                className="site-footer-social-btn lp-icon-chip rounded-xl hover:scale-110 transition-transform duration-300"
                aria-label="Follow Epineon on LinkedIn"
              >
                <svg className="h-5 w-5 shrink-0 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
          <div className="footer-mobile-copyright mt-12 text-xs">
            © {new Date().getFullYear()} Epineon.ai. All rights reserved.
          </div>
        </div>

        {/* Desktop & tablet: original row */}
        <div className="hidden md:flex md:flex-row md:flex-wrap md:gap-x-6 md:gap-y-10 lg:flex-nowrap lg:gap-x-8 lg:gap-y-0">
          <div className="min-w-0 flex-1 md:flex-[2] md:basis-[min(100%,20rem)] lg:basis-auto">
            <div className="flex items-center mb-3 lg:mb-4">
              <Link to="/">
                <img
                  src={epineonWordmarkLogo}
                  alt="Epineon — Precision Life Science"
                  className="site-brand-wordmark"
                />
              </Link>
            </div>
            <p className="text-slate-700 mb-4 lg:mb-6 max-w-md text-sm sm:text-base leading-relaxed">
              Precision life science, powered by AI you can trust.
            </p>
            <div className="text-xs sm:text-sm text-slate-600">
              © {new Date().getFullYear()} Epineon.ai. All rights reserved.
            </div>
          </div>

          <div className="min-w-0 flex-1 md:min-w-[min(100%,12rem)]">
            <h4 className="font-semibold text-slate-900 mb-3 lg:mb-4 text-sm sm:text-base lg:text-lg">Follow Us</h4>
            <div className="flex flex-wrap gap-4 sm:gap-5">
              <a
                href="https://www.instagram.com/epineon.now/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Epineon on Instagram"
                className="site-footer-social-btn lp-icon-chip rounded-lg sm:rounded-xl hover:scale-110 transition-transform duration-300"
              >
                <svg className="h-5 w-5 shrink-0 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/epineonn"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Epineon on LinkedIn"
                className="site-footer-social-btn lp-icon-chip rounded-lg sm:rounded-xl hover:scale-110 transition-transform duration-300"
              >
                <svg className="h-5 w-5 shrink-0 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
          <div className="min-w-0 flex-1 md:min-w-[min(100%,12rem)]">
            <h4 className="font-semibold text-slate-900 mb-3 lg:mb-4 text-sm sm:text-base lg:text-lg">Products</h4>
            <FooterSolutionLinks
              listClassName="space-y-1 lg:space-y-2 text-slate-700 text-xs sm:text-sm lg:text-base"
              linkClassName="hover:text-slate-900 transition-colors block py-1"
            />
          </div>
          <div className="min-w-0 flex-1 md:min-w-[min(100%,12rem)]">
            <h4 className="font-semibold text-slate-900 mb-3 lg:mb-4 text-sm sm:text-base lg:text-lg">Resources</h4>
            <ul className="space-y-1 lg:space-y-2 text-slate-700 text-xs sm:text-sm lg:text-base">
              <li><Link to="/privacy" className="hover:text-slate-900 transition-colors block py-1" onClick={scrollPageToTop}>Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-slate-900 transition-colors block py-1" onClick={scrollPageToTop}>Terms & Conditions</Link></li>
              <li><Link to="/cookie-policy" className="hover:text-slate-900 transition-colors block py-1" onClick={scrollPageToTop}>Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
