import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Activity, Compass, ArrowRight, Info } from 'lucide-react'
import { ECOSYSTEMS } from '../../data/ecosystem.js'
import { LandingSection } from './LandingSection'

const MOTIF_ICONS = { shield: Shield, pulse: Activity, compass: Compass }

/**
 * Section 2 — Ecosystem Portfolio Overview.
 * One card per ecosystem; each links to its Solution page (NOT individual product sites).
 * Product names are listed without descriptions (progressive disclosure).
 */
export function EcosystemPortfolio() {
  return (
    <LandingSection
      id="ecosystems"
      className="border-t border-white/5 py-36 lg:py-52"
      aria-labelledby="ecosystems-heading"
    >
      <div className="site-content min-w-0">
        <div className="mb-14 max-w-3xl scroll-animate lg:mb-24">
          <h2 id="ecosystems-heading" className="epineon-h2 epineon-section-title text-slate-900">
            Three ecosystems. One standard of trust.
          </h2>
        </div>

        <div className="ecosystem-cards-grid grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-7">
          {ECOSYSTEMS.map((eco, i) => {
            const Icon = MOTIF_ICONS[eco.motif] || Shield
            return (
              <Link
                key={eco.id}
                to={eco.solutionHref}
                style={{
                  '--eco-accent': eco.accent,
                  '--eco-progress': `${Math.round((eco.products.length / 3) * 100)}%`,
                }}
                className={`ecosystem-card epineon-card group flex flex-col scroll-animate scroll-animate-delay-${i + 1}`}
              >
                <div className="ecosystem-card__header">
                  <span className="ecosystem-card-icon shrink-0" aria-hidden>
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="ecosystem-card-label">{eco.categoryLabel}</span>
                </div>

                <h3 className="ecosystem-card-headline">{eco.cardHeadline}</h3>

                <div className="ecosystem-card__progress" aria-hidden>
                  <div className="ecosystem-card__progress-fill" />
                </div>

                <div className="ecosystem-card__divider" aria-hidden />

                <div className="ecosystem-card__detail">
                  <span className="ecosystem-card__info-icon" aria-hidden>
                    <Info className="h-3.5 w-3.5" strokeWidth={2} />
                  </span>
                  <span className="ecosystem-card-products">
                    {eco.products.map((p) => p.name).join('  ·  ')}
                  </span>
                </div>

                <span className="ecosystem-card-cta mt-auto">
                  {eco.solutionCta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </LandingSection>
  )
}
