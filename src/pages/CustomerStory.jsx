import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { PageShell } from '../components/PageShell'
import { Button } from '../components/ui/button'
import { CUSTOMERS } from '../data/customers.js'

const BY_SLUG = Object.fromEntries(CUSTOMERS.map((c) => [c.slug, c]))

export default function CustomerStory() {
  const { slug } = useParams()
  const c = BY_SLUG[slug]
  const idx = CUSTOMERS.findIndex((x) => x.slug === slug)
  const next = idx >= 0 ? CUSTOMERS[(idx + 1) % CUSTOMERS.length] : null

  if (!c) {
    return (
      <PageShell title="Story not found" path={`/customers/${slug || ''}`} noindex>
        <section className="pt-40 pb-32 text-center">
          <div className="site-content">
            <h1 className="epineon-h2 epineon-section-title text-slate-900">Story not found</h1>
            <Link to="/customers" className="ecosystem-card-cta mt-6 inline-flex">All customer stories</Link>
          </div>
        </section>
      </PageShell>
    )
  }

  return (
    <PageShell title={`${c.company} — Customer Story`} description={`How ${c.company} works with Epineon.`} path={`/customers/${c.slug}`}>
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16">
        <div className="site-content min-w-0">
          <Link to="/customers" className="text-sm text-white/55 hover:text-white">← All stories</Link>
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-[0.16em] text-[#9a8359]">
            <span className="font-semibold">{c.company}</span>
            <span aria-hidden>·</span>
            <span>{c.industry}</span>
            {c.ecosystem ? (
              <>
                <span aria-hidden>·</span>
                <span className="text-white/45">Ecosystem · {c.ecosystem}</span>
              </>
            ) : null}
          </div>
          <h1 className="epineon-h2 epineon-section-title mt-3 text-slate-900">{c.company}</h1>
          {c.context ? (
            <p className="mt-3 max-w-2xl text-sm text-white/55">{c.context}</p>
          ) : null}
        </div>
      </section>

      <section className="border-t border-white/5 py-12 lg:py-16">
        <div className="site-content min-w-0">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-white/45">Challenge</p>
              <p className="epineon-body-large mt-2 text-white/75 text-base leading-relaxed">{c.challenge}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-white/45">Outcome</p>
              <p className="epineon-body-large mt-2 text-white/75 text-base leading-relaxed">{c.outcome}</p>
            </div>
          </div>

          <blockquote className="epineon-body-large mt-10 border-l-2 border-[#c9a227] pl-5 text-white/80 italic text-lg leading-relaxed lg:text-xl">
            &ldquo;{c.quote}&rdquo;
            <footer className="mt-3 text-sm not-italic text-white/55">{c.attribution} · {c.role}</footer>
          </blockquote>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="site-content min-w-0">
          <div className="final-cta-panel text-center">
            <h2 className="epineon-h2 epineon-section-title text-slate-900">Want results like this?</h2>
            <Link to="/contact#sales" className="mt-8 inline-flex">
              <Button className="epineon-btn-primary rounded-full px-9 py-4 text-base">Talk to Us</Button>
            </Link>
          </div>

          {next ? (
            <div className="mt-10 text-right">
              <Link to={`/customers/${next.slug}`} className="ecosystem-card-cta inline-flex">
                Next: {next.company} →
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </PageShell>
  )
}
