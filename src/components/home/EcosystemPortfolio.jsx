import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Activity, Compass, ArrowRight } from 'lucide-react'
import { ECOSYSTEMS } from '../../data/ecosystem.js'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'

const MOTIF_ICONS = { shield: Shield, pulse: Activity, compass: Compass }

/**
 * Section 2 — Ecosystem Portfolio Overview.
 * One card per ecosystem; each links to its Solution page (NOT individual product sites).
 * Product names are listed without descriptions (progressive disclosure).
 */
export function EcosystemPortfolio() {
  const [ref, visible] = useScrollAnimation()

  return (
    <section id="ecosystems" className="border-t border-white/5 py-16 lg:py-24" aria-labelledby="ecosystems-heading">
      <div className="site-content min-w-0">
        <div ref={ref} className={`mb-10 max-w-3xl scroll-animate lg:mb-14 ${visible ? 'visible' : ''}`}>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c9a227]">The portfolio</p>
          <h2 id="ecosystems-heading" className="epineon-h2 epineon-section-title mt-3 text-slate-900">
            Three ecosystems. One standard of trust.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-7">
          {ECOSYSTEMS.map((eco, i) => {
            const Icon = MOTIF_ICONS[eco.motif] || Shield
            return (
              <Link
                key={eco.id}
                to={eco.solutionHref}
                style={{ '--eco-accent': eco.accent }}
                className={`ecosystem-card epineon-card group flex flex-col p-6 lg:p-8 scroll-animate scroll-animate-delay-${i + 1} ${visible ? 'visible' : ''}`}
              >
                <span className="ecosystem-card-icon" aria-hidden>
                  <Icon className="h-6 w-6" />
                </span>
                <span className="ecosystem-card-label mt-5">{eco.categoryLabel}</span>
                <h3 className="ecosystem-card-headline mt-3">{eco.cardHeadline}</h3>
                <span className="ecosystem-card-products mt-5">
                  {eco.products.map((p) => p.name).join('  ·  ')}
                </span>
                <span className="ecosystem-card-cta mt-auto pt-6">
                  {eco.solutionCta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
