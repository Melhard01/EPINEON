import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import { CUSTOMER_BY_SLUG } from '../../data/customers.js'

// Partner/client wordmarks. TODO: replace text wordmarks with real logo assets (grayscale).
const CLIENTS = ['Chargea', 'Avenis', 'NeuroLab Institute', 'BioSync Research', 'Meridian Academic Center']

// Static, source-anchored metrics. TODO: verify each figure with a real source before launch.
const METRICS = [
  { value: '30+', label: 'Years of combined R&D', footnote: 'across our founding teams' },
  { value: '100+', label: 'Research partnerships', footnote: 'with universities and institutes' },
  { value: '7', label: 'Products shipping', footnote: 'across three ecosystems' },
]

const FEATURED_SLUGS = ['chargea', 'avenis']

function CaseCard({ c }) {
  return (
    <div className="epineon-card flex flex-col p-7 lg:p-8">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-[0.16em] text-[#9a8359]">
        <span className="font-semibold">{c.company}</span>
        <span aria-hidden>·</span>
        <span>{c.industry}</span>
      </div>
      <blockquote className="epineon-body-large mt-6 border-l-2 border-[#c9a227] pl-5 text-white/80 italic text-sm leading-relaxed lg:text-base">
        &ldquo;{c.shortQuote || c.quote}&rdquo;
        <footer className="mt-3 text-sm not-italic text-white/55">{c.attribution} · {c.role}</footer>
      </blockquote>
      <Link to={`/customers/${c.slug}`} className="ecosystem-card-cta mt-6 inline-flex">
        Read the full story
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  )
}

/** Section 4 — Social Proof: client logos, key metrics, featured case studies. */
export function SocialProof() {
  const [ref, visible] = useScrollAnimation()
  const featured = FEATURED_SLUGS.map((s) => CUSTOMER_BY_SLUG[s]).filter(Boolean)

  return (
    <section className="border-t border-white/5 py-16 lg:py-24" aria-label="Social proof">
      <div className="site-content min-w-0">
        {/* 4a — client logos */}
        <p className="text-center text-sm uppercase tracking-[0.18em] text-white/55">
          Trusted by organizations building what comes next.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {CLIENTS.map((name) => (
            <span key={name} className="social-logo">
              {name}
            </span>
          ))}
        </div>

        {/* 4b — metrics (3) */}
        <div ref={ref} className={`mt-16 grid grid-cols-1 gap-8 text-center sm:grid-cols-3 scroll-animate ${visible ? 'visible' : ''}`}>
          {METRICS.map((m) => (
            <div key={m.label} className="min-w-0">
              <div className="epineon-stat-number text-slate-900 text-3xl sm:text-4xl lg:text-5xl">{m.value}</div>
              <div className="epineon-stat-label mt-1 text-white/75 text-sm sm:text-base">{m.label}</div>
              <div className="mt-1 text-xs text-white/40">{m.footnote}</div>
            </div>
          ))}
        </div>

        {/* 4c — featured case studies */}
        <div className="mt-16 grid grid-cols-1 gap-6 lg:mt-20 lg:grid-cols-2 lg:gap-7">
          {featured.map((c) => (
            <CaseCard key={c.slug} c={c} />
          ))}
        </div>
      </div>
    </section>
  )
}
