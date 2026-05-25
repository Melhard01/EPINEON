import React from 'react'
import { Link } from 'react-router-dom'
import { Brain, Sparkles } from 'lucide-react'
import { PageShell } from '../../components/PageShell'
import { Button } from '../../components/ui/button'

const PILLARS = [
  {
    icon: Brain,
    title: 'Innovation Lab',
    body: 'Where early ideas are pressure-tested. The Lab pairs our researchers and operators to validate the science and the market before a venture is ever spun up.',
  },
  {
    icon: Sparkles,
    title: 'Innovation Factory',
    body: 'Where validated ideas become companies. The Factory provides the capital, operators and go-to-market muscle to take a venture from prototype to scale, built with academic and industry partners.',
  },
]

export default function VentureStudio() {
  return (
    <PageShell
      title="Venture Studio"
      description="How Epineon builds and scales companies in partnership with academic and research institutions."
      path="/company/venture-studio"
    >
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16">
        <div className="site-content min-w-0">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c9a227]">Company</p>
            <h1 className="epineon-h2 epineon-section-title mt-3 text-slate-900">Venture Studio</h1>
            <p className="epineon-body-large mt-5 text-white/80 text-base leading-relaxed lg:text-lg">
              We turn deep-tech and life-science research into companies. Working hand in hand with universities and
              research centres, we build, fund and scale ventures from first principle to market.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 py-14 lg:py-20">
        <div className="site-content min-w-0">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon
              return (
                <div key={pillar.title} className="epineon-card p-7 lg:p-8">
                  <span className="why-item-icon lp-icon-chip" aria-hidden>
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="why-item-label mt-4 text-slate-900">{pillar.title}</h2>
                  <p className="epineon-body mt-2 text-white/70 text-sm leading-relaxed">{pillar.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Portfolio + partners — TODO: list real portfolio companies + academic partners by name */}
      <section className="border-t border-white/5 py-14 lg:py-20">
        <div className="site-content min-w-0">
          <h2 className="epineon-h2 epineon-section-title text-slate-900">Portfolio &amp; partners</h2>
          <p className="epineon-body-large mt-4 text-white/75 text-base leading-relaxed lg:text-lg">
            Our ventures span enterprise security, precision health and future intelligence, built alongside university
            and research-centre partners. Selected companies and named partners are introduced as each is ready to go public.
          </p>
        </div>
      </section>

      {/* How to engage */}
      <section className="py-16 lg:py-24">
        <div className="site-content min-w-0">
          <div className="final-cta-panel text-center">
            <h2 className="epineon-h2 epineon-section-title text-slate-900">Have an idea worth building?</h2>
            <p className="epineon-body mt-3 text-white/70 text-sm">
              We partner with founders, universities, and research centers.
            </p>
            <Link to="/contact#partnerships" className="mt-8 inline-flex">
              <Button className="epineon-btn-primary rounded-full px-9 py-4 text-base">Engage the Studio</Button>
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
