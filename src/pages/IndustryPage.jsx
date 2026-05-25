import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { PageShell } from '../components/PageShell'
import { Button } from '../components/ui/button'
import { ProductCard } from '../components/ProductCard'
import { INDUSTRIES } from '../data/industries.js'
import { ALL_PRODUCTS } from '../data/ecosystem.js'

const PRODUCT_BY_ID = Object.fromEntries(ALL_PRODUCTS.map((p) => [p.id, p]))

export default function IndustryPage() {
  const { slug } = useParams()
  const ind = INDUSTRIES[slug]

  if (!ind) {
    return (
      <PageShell title="Industry not found" path={`/industries/${slug || ''}`} noindex>
        <section className="pt-40 pb-32 text-center">
          <div className="site-content">
            <h1 className="epineon-h2 epineon-section-title text-slate-900">Industry not found</h1>
            <Link to="/" className="ecosystem-card-cta mt-6 inline-flex">Back to home</Link>
          </div>
        </section>
      </PageShell>
    )
  }

  const products = ind.productIds.map((id) => PRODUCT_BY_ID[id]).filter(Boolean)

  return (
    <PageShell title={ind.title} description={ind.seoDescription} path={ind.path}>
      {/* Hero */}
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16">
        <div className="site-content min-w-0">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c9a227]">Industries</p>
            <h1 className="epineon-h2 epineon-section-title mt-3 text-slate-900">{ind.title}</h1>
            <p className="epineon-body-large mt-5 text-white/80 text-lg leading-relaxed lg:text-xl">{ind.headline}</p>
          </div>
        </div>
      </section>

      {/* Challenges */}
      <section className="border-t border-white/5 py-14 lg:py-20">
        <div className="site-content min-w-0">
          <h2 className="epineon-h2 epineon-section-title text-slate-900">Where it gets hard</h2>
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
            {ind.challenges.map((c, i) => (
              <div key={i} className="challenge-card">
                <span className="challenge-card-num">{String(i + 1).padStart(2, '0')}</span>
                <p className="challenge-card-text mt-3">{c}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Relevant products + solution */}
      <section className="border-t border-white/5 py-14 lg:py-20">
        <div className="site-content min-w-0">
          <h2 className="epineon-h2 epineon-section-title text-slate-900">What we bring</h2>
          {ind.approach ? (
            <p className="epineon-body-large mt-4 max-w-3xl text-white/75 text-base leading-relaxed lg:text-lg">
              {ind.approach}
            </p>
          ) : null}
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {ind.relatedSolution ? (
            <Link to={ind.relatedSolution} className="ecosystem-card-cta mt-8 inline-flex">
              See how it works across the wider solution
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : null}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24">
        <div className="site-content min-w-0">
          <div className="final-cta-panel text-center">
            <h2 className="epineon-h2 epineon-section-title text-slate-900">
              {ind.ctaHeadline || `Let's talk about your ${ind.team} challenges.`}
            </h2>
            {ind.ctaHref && /^https?:\/\//.test(ind.ctaHref) ? (
              <a href={ind.ctaHref} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex">
                <Button className="epineon-btn-primary rounded-full px-9 py-4 text-base">
                  {ind.ctaButton || 'Talk to our sales team'}
                </Button>
              </a>
            ) : (
              <Link to={ind.ctaHref || '/contact#sales'} className="mt-8 inline-flex">
                <Button className="epineon-btn-primary rounded-full px-9 py-4 text-base">
                  {ind.ctaButton || 'Talk to our sales team'}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  )
}
