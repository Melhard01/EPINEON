import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { PageShell } from '../components/PageShell'
import { LandingSection } from '../components/home/LandingSection'
import { Button } from '../components/ui/button'
import { ProductCard } from '../components/ProductCard'
import { IndustryChallengesSplit } from '../components/industry/IndustryChallengesSplit.jsx'
import { INDUSTRIES } from '../data/industries.js'
import { ALL_PRODUCTS } from '../data/ecosystem.js'

const PRODUCT_BY_ID = Object.fromEntries(ALL_PRODUCTS.map((p) => [p.id, p]))

const WHITE_CTA_INDUSTRY_SLUGS = new Set([
  'finance-banking',
  'healthcare',
  'government-defence',
  'wellness-coaching',
  'longevity',
  'clinics-organisations',
  'enterprise-workforce',
  'influencers-educators',
  'universities-academics',
])

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
  const whiteCta = WHITE_CTA_INDUSTRY_SLUGS.has(slug)
  const ctaButtonClass = whiteCta
    ? 'epineon-btn-secondary solution-final-cta__btn--white rounded-full px-9 py-4 text-base'
    : 'epineon-btn-primary rounded-full px-9 py-4 text-base'

  return (
    <PageShell title={ind.title} description={ind.seoDescription} path={ind.path}>
      {/* Hero */}
      <LandingSection
        withMeshBackground={false}
        className="industry-page-hero landing-hero-section pt-32 pb-12 lg:pt-40 lg:pb-16"
      >
        <div className="landing-hero-section__bg" aria-hidden>
          <div className="landing-hero-section__grid" />
          <div className="landing-hero-section__glow" />
        </div>
        <div className="relative z-10">
          <div className="site-content min-w-0">
            <div className="mx-auto max-w-3xl text-center">
              <p className="scroll-animate scroll-animate-delay-1 text-sm font-semibold uppercase tracking-[0.22em] text-[#c9a227]">Industries</p>
              <h1 className="industry-hero__title scroll-animate scroll-animate-delay-2 mt-3 text-slate-900">{ind.title}</h1>
              <p className="scroll-animate scroll-animate-delay-3 epineon-body-large mx-auto mt-5 max-w-2xl text-balance !text-center text-white/80 text-lg leading-relaxed lg:text-xl">
                {ind.headline}
              </p>
            </div>
          </div>
        </div>
      </LandingSection>

      {/* Challenges */}
      <LandingSection className="industry-challenges-section border-t border-white/5">
        <div className="site-content min-w-0">
          <IndustryChallengesSplit challenges={ind.challenges} />
        </div>
      </LandingSection>

      {/* Relevant products + solution */}
      <LandingSection className="industry-what-we-bring-section border-t border-white/5">
        <div className="site-content min-w-0">
          <h2 className="industry-what-we-bring__heading scroll-animate epineon-h2 epineon-section-title text-slate-900">What we bring</h2>
          {ind.approach?.length > 0 ? (
            <p
              className={`industry-approach industry-approach__block scroll-animate scroll-animate-delay-1 text-white/75${slug === 'wellness-coaching' ? ' industry-approach__block--wellness' : ''}`}
            >
              {ind.approach.join('\n')}
            </p>
          ) : null}
          <div className="industry-products-grid grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            {products.map((product, i) => (
              <div
                key={product.id}
                className={`scroll-animate scroll-animate-delay-${Math.min(i + 2, 5)}`}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          {ind.relatedSolution ? (
            <Link to={ind.relatedSolution} className="ecosystem-card-cta scroll-animate scroll-animate-delay-4 mt-8 inline-flex">
              See how it works across the wider solution
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : null}
        </div>
      </LandingSection>

      {/* CTA */}
      <LandingSection className="solution-cta-section">
        <div className="site-content min-w-0">
          <div className="final-cta-panel scroll-animate text-center">
            <h2 className="epineon-h2 epineon-section-title text-slate-900">
              {ind.ctaHeadline || `Let's talk about your ${ind.team} challenges.`}
            </h2>
            {ind.ctaHref && /^https?:\/\//.test(ind.ctaHref) ? (
              <a href={ind.ctaHref} target="_blank" rel="noopener noreferrer" className="solution-cta-section__action scroll-animate scroll-animate-delay-1 inline-flex">
                <Button variant={whiteCta ? 'outline' : 'default'} className={ctaButtonClass}>
                  {ind.ctaButton || 'Talk to our sales team'}
                </Button>
              </a>
            ) : (
              <Link to={ind.ctaHref || '/contact#sales'} className="solution-cta-section__action scroll-animate scroll-animate-delay-1 inline-flex">
                <Button variant={whiteCta ? 'outline' : 'default'} className={ctaButtonClass}>
                  {ind.ctaButton || 'Talk to our sales team'}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </LandingSection>
    </PageShell>
  )
}
