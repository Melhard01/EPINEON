import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { PageShell } from '../components/PageShell'
import { Button } from '../components/ui/button'
import { ProductCard } from '../components/ProductCard'
import { SOLUTIONS } from '../data/solutions.js'
import { ALL_PRODUCTS } from '../data/ecosystem.js'
import { INDUSTRIES_LINKS } from '../data/navigation.js'

const PRODUCT_BY_ID = Object.fromEntries(ALL_PRODUCTS.map((p) => [p.id, p]))
const INDUSTRY_BY_SLUG = Object.fromEntries(
  INDUSTRIES_LINKS.map((l) => [l.href.split('/').pop(), l]),
)

export default function SolutionPage() {
  const { slug } = useParams()
  const sol = SOLUTIONS[slug]

  if (!sol) {
    return (
      <PageShell title="Solution not found" path={`/solutions/${slug || ''}`} noindex>
        <section className="pt-40 pb-32 text-center">
          <div className="site-content">
            <h1 className="epineon-h2 epineon-section-title text-slate-900">Solution not found</h1>
            <Link to="/" className="ecosystem-card-cta mt-6 inline-flex">Back to home</Link>
          </div>
        </section>
      </PageShell>
    )
  }

  const products = sol.productIds.map((id) => PRODUCT_BY_ID[id]).filter(Boolean)
  const industries = (sol.industries || []).map((s) => INDUSTRY_BY_SLUG[s]).filter(Boolean)

  return (
    <PageShell title={sol.title} description={sol.seoDescription} path={sol.path}>
      {/* Hero */}
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16">
        <div className="site-content min-w-0">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c9a227]">{sol.eyebrow}</p>
            <h1 className="epineon-h2 epineon-section-title mt-3 text-slate-900">{sol.title}</h1>
            <p className="epineon-body-large mt-5 text-white/80 text-lg leading-relaxed">{sol.lede}</p>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-t border-white/5 py-14 lg:py-20">
        <div className="site-content min-w-0">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-14">
            <h2 className="epineon-h2 epineon-section-title shrink-0 text-slate-900 lg:w-72">{sol.problemHeading}</h2>
            <div className="min-w-0 flex-1 space-y-5">
              {sol.problem.map((p, i) => (
                <p key={i} className="epineon-body-large text-white/75 text-base leading-relaxed lg:text-lg">{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solution overview + products */}
      <section className="border-t border-white/5 py-14 lg:py-20">
        <div className="site-content min-w-0">
          <h2 className="epineon-h2 epineon-section-title text-slate-900">{sol.solutionHeading}</h2>
          <p className="epineon-body-large mt-4 max-w-3xl text-white/75 text-base leading-relaxed lg:text-lg">
            {sol.solutionIntro}
          </p>
          {sol.credibilityLine ? (
            <p className="mt-4 text-sm font-medium text-[#c9a227]">{sol.credibilityLine}</p>
          ) : null}

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {sol.manifestoNote ? (
            <p className="mt-8 text-sm text-white/60">
              {sol.manifestoNote.text}{' '}
              <a
                href={sol.manifestoNote.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#c9a227] hover:underline"
              >
                {sol.manifestoNote.label}
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </a>
            </p>
          ) : null}
        </div>
      </section>

      {/* Audience / industries / use cases */}
      {(industries.length > 0 || sol.useCases) && (
        <section className="border-t border-white/5 py-14 lg:py-20">
          <div className="site-content min-w-0">
            <h2 className="epineon-h2 epineon-section-title text-slate-900">{sol.audienceHeading}</h2>
            {industries.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {industries.map((ind) => (
                  <Link key={ind.href} to={ind.href} className="industry-chip">
                    {ind.label}
                  </Link>
                ))}
              </div>
            )}
            {sol.useCases && (
              <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sol.useCases.map((uc) => (
                  <li key={uc} className="solution-usecase">{uc}</li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* Muted proof note */}
      {sol.proofNote ? (
        <section className="border-t border-white/5 py-12 lg:py-16">
          <div className="site-content min-w-0">
            <p className="text-white/50 text-sm">{sol.proofNote}</p>
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <section className="py-16 lg:py-24">
        <div className="site-content min-w-0">
          <div className="final-cta-panel text-center">
            <h2 className="epineon-h2 epineon-section-title text-slate-900">{sol.ctaHeading}</h2>
            <Link to={sol.ctaHref} className="mt-8 inline-flex">
              <Button className="epineon-btn-primary rounded-full px-9 py-4 text-base">{sol.ctaLabel}</Button>
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
