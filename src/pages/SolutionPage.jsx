import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { PageShell } from '../components/PageShell'
import { LandingSection } from '../components/home/LandingSection'
import { Button } from '../components/ui/button'
import { ProductCard } from '../components/ProductCard'
import { SOLUTIONS } from '../data/solutions.js'
import { ALL_PRODUCTS } from '../data/ecosystem.js'
import { INDUSTRIES_LINKS } from '../data/navigation.js'
import trustedAiChallengeLeft from '../assets/solutions/trusted-ai-challenge-left.png'
import precisionHealthChallengeLeft from '../assets/solutions/precision-health-challenge-left.png'
import futureOfWorkChallengeLeft from '../assets/solutions/future-of-work-challenge-left.png'

const CHALLENGE_LEFT_IMAGE_BY_SLUG = {
  'trusted-ai': {
    src: trustedAiChallengeLeft,
    alt: 'Trusted AI challenge visual',
  },
  'precision-health': {
    src: precisionHealthChallengeLeft,
    alt: 'Precision health challenge visual',
  },
  'future-of-work': {
    src: futureOfWorkChallengeLeft,
    alt: 'Future of work challenge visual',
  },
}

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
  const challengeLeftImage = CHALLENGE_LEFT_IMAGE_BY_SLUG[slug]

  return (
    <PageShell title={sol.title} description={sol.seoDescription} path={sol.path}>
      {/* Hero */}
      <LandingSection
        withMeshBackground={false}
        className={`solution-hero-section landing-hero-section${sol.heroBackground ? ' solution-hero-section--has-bg' : ' solution-hero-section--top-glow'}`}
      >
        {sol.heroBackground ? (
          <img
            className="solution-hero-section__bg"
            src={sol.heroBackground}
            alt=""
            aria-hidden
            decoding="async"
            fetchPriority="high"
          />
        ) : (
          <div className="landing-hero-section__bg" aria-hidden>
            <div className="landing-hero-section__grid" />
            <div className="landing-hero-section__glow" />
          </div>
        )}
        <div className="relative z-10">
          <div className="site-content min-w-0">
            <div className="solution-hero">
              <p className="solution-hero__eyebrow epineon-eyebrow-pill scroll-animate scroll-animate-delay-1">{sol.eyebrow}</p>
              <h1 className="solution-hero__title text-slate-900">
                {sol.heroTitleLines?.length ? (
                  sol.heroTitleLines.map((line, i) => (
                    <span key={line} className={`solution-hero__title-line scroll-animate scroll-animate-delay-${i + 2}`}>
                      {line}
                    </span>
                  ))
                ) : (
                  <span className="solution-hero__title-line scroll-animate scroll-animate-delay-2">{sol.title}</span>
                )}
              </h1>
              <p className="solution-hero__lede scroll-animate scroll-animate-delay-4 epineon-body-large text-white/80">{sol.lede}</p>
            </div>
          </div>
        </div>
      </LandingSection>

      {/* Problem — "The challenge" */}
      <LandingSection
        className={`solution-challenge-section border-t border-white/5${challengeLeftImage ? ' solution-challenge-section--challenge-image' : ''}`}
      >
        <div className="site-content min-w-0">
          <div className="solution-challenge-section__inner">
            <div className="solution-challenge-section__title-frame scroll-animate-slide-left">
              {challengeLeftImage ? (
                <img
                  src={challengeLeftImage.src}
                  alt={challengeLeftImage.alt}
                  className="solution-challenge-section__title-image"
                />
              ) : (
                <h2 className="solution-section__heading">
                  {sol.problemHeading}
                </h2>
              )}
            </div>
            <div className="solution-challenge-card scroll-animate-slide-right scroll-animate-delay-1">
              {sol.problem.map((p, i) => (
                <p
                  key={i}
                  className="solution-challenge-card__text"
                >
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </LandingSection>

      {/* Solution overview + products */}
      <LandingSection className="solution-addresses-section border-t border-white/5">
        <div className="site-content min-w-0">
          <h2 className="solution-section__heading scroll-animate">{sol.solutionHeading}</h2>
          {sol.solutionIntroNavWidth && sol.solutionIntroLines ? (
            <p className="solution-intro__text solution-intro__text--nav-span solution-intro__text--two-lines scroll-animate scroll-animate-delay-1 epineon-body-large text-white/75">
              {sol.solutionIntroLines.map((line) => (
                <span key={line} className="solution-intro__text-line">
                  {line}
                </span>
              ))}
            </p>
          ) : sol.solutionIntroNavWidth ? (
            <p className="solution-intro__text solution-intro__text--nav-span scroll-animate scroll-animate-delay-1 epineon-body-large text-white/75">
              {sol.solutionIntro}
            </p>
          ) : sol.solutionIntroLines ? (
            <p className="solution-intro__text solution-intro__text--two-lines scroll-animate scroll-animate-delay-1 epineon-body-large text-white/75">
              {sol.solutionIntroLines.map((line) => (
                <span key={line} className="solution-intro__text-line">
                  {line}
                </span>
              ))}
            </p>
          ) : (
            <p className="solution-intro__text scroll-animate scroll-animate-delay-1 epineon-body-large text-white/75">
              {sol.solutionIntro}
            </p>
          )}
          {sol.credibilityLine ? (
            <p className="solution-addresses-section__credibility scroll-animate scroll-animate-delay-2 text-sm font-medium text-[#c9a227]">{sol.credibilityLine}</p>
          ) : null}

          <div className="solution-addresses-section__products grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            {products.map((product, i) => (
              <div
                key={product.id}
                className={`scroll-animate scroll-animate-delay-${Math.min(i + 2, 5)}`}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {sol.manifestoNote ? (
            <p className="solution-addresses-section__note scroll-animate scroll-animate-delay-4 text-sm text-white/60">
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

          {sol.proofNote ? (
            <p className="solution-addresses-section__note scroll-animate scroll-animate-delay-4 text-sm text-white/50">{sol.proofNote}</p>
          ) : null}
        </div>
      </LandingSection>

      {/* Audience / industries / use cases */}
      {(industries.length > 0 || sol.useCases) && (
        <LandingSection className="solution-audience-section border-t border-white/5 py-14 lg:py-20">
          <div className="site-content min-w-0">
            <h2 className="epineon-h2 epineon-section-title scroll-animate text-slate-900">{sol.audienceHeading}</h2>
            {industries.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {industries.map((ind, i) => (
                  <Link
                    key={ind.href}
                    to={ind.href}
                    className={`industry-chip scroll-animate scroll-animate-delay-${Math.min(i + 1, 5)}`}
                  >
                    {ind.label}
                  </Link>
                ))}
              </div>
            )}
            {sol.useCases && (
              <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sol.useCases.map((uc, i) => (
                  <li key={uc} className={`solution-usecase scroll-animate scroll-animate-delay-${Math.min(i + 1, 5)}`}>{uc}</li>
                ))}
              </ul>
            )}
          </div>
        </LandingSection>
      )}

      {/* CTA */}
      <LandingSection className="solution-cta-section">
        <div className="site-content min-w-0">
          <div className="final-cta-panel scroll-animate text-center">
            <h2 className="epineon-h2 epineon-section-title text-slate-900">{sol.ctaHeading}</h2>
            <Link to={sol.ctaHref} className="solution-cta-section__action scroll-animate scroll-animate-delay-1 inline-flex">
              <Button
                variant={
                  slug === 'precision-health' || slug === 'future-of-work' ? 'outline' : 'default'
                }
                className={
                  slug === 'trusted-ai'
                    ? 'epineon-btn-primary solution-final-cta__btn--gold rounded-full px-9 py-4 text-base'
                    : slug === 'precision-health' || slug === 'future-of-work'
                      ? 'epineon-btn-secondary solution-final-cta__btn--white rounded-full px-9 py-4 text-base'
                      : 'epineon-btn-primary rounded-full px-9 py-4 text-base'
                }
              >
                {sol.ctaLabel}
              </Button>
            </Link>
          </div>
        </div>
      </LandingSection>
    </PageShell>
  )
}
