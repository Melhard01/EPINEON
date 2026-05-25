import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { PageShell } from '../components/PageShell'
import { Button } from '../components/ui/button'
import { CUSTOMERS, CUSTOMER_INDUSTRIES } from '../data/customers.js'

export default function Customers() {
  const [filter, setFilter] = useState('All')
  const filters = ['All', ...CUSTOMER_INDUSTRIES]
  const shown = filter === 'All' ? CUSTOMERS : CUSTOMERS.filter((c) => c.industry === filter)

  return (
    <PageShell
      title="Customer Stories"
      description="How organisations build what comes next with Epineon."
      path="/customers"
    >
      <section className="pt-32 pb-10 lg:pt-40 lg:pb-12">
        <div className="site-content min-w-0">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c9a227]">Customers</p>
            <h1 className="epineon-h2 epineon-section-title mt-3 text-slate-900">Building what comes next.</h1>
            <p className="epineon-body-large mt-5 text-white/80 text-lg leading-relaxed">
              Stories from the organisations we work with across our ecosystems.
            </p>
          </div>

          {/* Filter (by industry) */}
          <div className="mt-8 flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`customers-filter${filter === f ? ' is-active' : ''}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20 lg:pb-24">
        <div className="site-content min-w-0">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-7">
            {shown.map((c) => (
              <Link key={c.slug} to={`/customers/${c.slug}`} className="customer-card epineon-card group flex flex-col p-7">
                <span className="customer-card-logo">{c.company}</span>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="customer-card-industry">{c.industry}</span>
                  <span className="customer-eco-tag">{c.ecosystem}</span>
                </div>
                <span className="customer-card-outcome mt-5">{c.outcomeStat}</span>
                <span className="ecosystem-card-cta mt-auto pt-6">
                  Read story
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pb-24 lg:pb-32">
        <div className="site-content min-w-0">
          <div className="final-cta-panel text-center">
            <h2 className="epineon-h2 epineon-section-title text-slate-900">Ready to write your own story?</h2>
            <Link to="/contact#sales" className="mt-8 inline-flex">
              <Button className="epineon-btn-primary rounded-full px-9 py-4 text-base">Talk to Us</Button>
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
