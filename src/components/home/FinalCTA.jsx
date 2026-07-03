import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/button'
import { LandingSection } from './LandingSection'

/**
 * Section 7 — Final CTA. Corporate-level paths only (stays on the hub → /contact).
 * Two audiences: enterprises/institutions and partners/ventures.
 */
export function FinalCTA() {
  return (
    <LandingSection id="CTA" className="home-final-cta-section" aria-labelledby="final-cta">
      <div className="site-content min-w-0">
        <div className="final-cta-panel scroll-animate">
          <h2 id="final-cta" className="epineon-h2 epineon-section-title text-center text-slate-900">
            Ready to build something that lasts?
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-6 lg:gap-10">
            <div className="final-cta-path scroll-animate scroll-animate-delay-1">
              <p className="final-cta-path-label">For enterprises &amp; institutions</p>
              <p className="epineon-body mt-2 text-slate-700 text-sm leading-relaxed">
                Bring private, sovereign AI into environments where being wrong isn&apos;t an option.
              </p>
              <Link to="/contact#demo" className="mt-5 inline-flex">
                <Button className="epineon-btn-primary rounded-full px-8 py-4 text-base">Book a demo</Button>
              </Link>
            </div>

            <div className="final-cta-path final-cta-path--divider scroll-animate scroll-animate-delay-2">
              <p className="final-cta-path-label">For partners &amp; ventures</p>
              <p className="epineon-body mt-2 text-slate-700 text-sm leading-relaxed md:pl-5 lg:pl-6">
                Build and scale the next generation of life-science and deep-tech ventures with us.
              </p>
              <Link to="/contact#partnerships" className="mt-5 inline-flex">
                <Button variant="outline" className="epineon-btn-secondary rounded-full px-8 py-4 text-base">
                  Partner with us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </LandingSection>
  )
}
