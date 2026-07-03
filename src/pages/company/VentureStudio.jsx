import React from 'react'
import { Link } from 'react-router-dom'
import { Brain, Sparkles } from 'lucide-react'
import { PageShell } from '../../components/PageShell'
import { LandingSection } from '../../components/home/LandingSection'
import { Button } from '../../components/ui/button'
import innovationLabImage from '../../assets/innovation-lab.png'
import innovationFactoryImage from '../../assets/innovation-factory.png'

const PILLARS = [
  {
    icon: Brain,
    title: 'Innovation Lab',
    body: 'Where early ideas are pressure-tested. The Lab pairs our researchers and operators to validate the science and the market before a venture is ever spun up.',
    image: innovationLabImage,
    imageAlt: 'Researchers and operators collaborating in an innovation lab with whiteboards and system maps',
  },
  {
    icon: Sparkles,
    title: 'Innovation Factory',
    body: 'Where validated ideas become companies. The Factory provides the capital, operators and go-to-market muscle to take a venture from prototype to scale, built with academic and industry partners.',
    image: innovationFactoryImage,
    imageAlt: 'Innovation Factory team in front of a wall branded with innovation and scale themes',
  },
]

export default function VentureStudio() {
  return (
    <PageShell
      title="Venture Studio"
      description="How Epineon builds and scales companies in partnership with academic and research institutions."
      path="/company/venture-studio"
    >
      <LandingSection
        withMeshBackground={false}
        className="venture-studio-intro landing-hero-section pt-32 pb-12 lg:pt-40 lg:pb-16"
      >
        <div className="landing-hero-section__bg" aria-hidden>
          <div className="landing-hero-section__grid" />
          <div className="landing-hero-section__glow" />
        </div>
        <div className="relative z-10">
          <div className="site-content min-w-0">
            <div className="mx-auto max-w-3xl text-center">
              <p className="epineon-eyebrow-pill">Company</p>
              <h1 className="epineon-h2 epineon-section-title mt-3 text-slate-900">Venture Studio</h1>
              <p className="epineon-body-large mx-auto mt-5 max-w-2xl !text-center text-balance text-white/80 text-base leading-relaxed lg:text-lg">
                We turn deep-tech and life-science research into companies. Working hand in hand with universities and
                research centres, we build, fund and scale ventures from first principle to market.
              </p>
            </div>
          </div>
        </div>
      </LandingSection>

      <LandingSection className="venture-studio-cards-section border-t border-white/5 py-14 lg:py-20">
        <div className="site-content min-w-0">
          <div className="venture-studio-cards mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:max-w-6xl lg:gap-8">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon
              return (
                <div
                  key={pillar.title}
                  className={`epineon-card venture-studio-card${pillar.image ? ' venture-studio-card--has-image p-0' : ' p-7 lg:p-8'}`}
                >
                  {pillar.image ? (
                    <div className="venture-studio-card__visual">
                      <img
                        src={pillar.image}
                        alt={pillar.imageAlt ?? ''}
                        className="venture-studio-card__image"
                        decoding="async"
                        loading="lazy"
                      />
                    </div>
                  ) : null}
                  <div className={pillar.image ? 'venture-studio-card__body p-7 lg:p-8' : undefined}>
                    <div className="venture-studio-card-heading">
                      <span className="why-item-icon lp-icon-chip venture-studio-card-heading__icon" aria-hidden>
                        <Icon className="h-5 w-5" />
                      </span>
                      <h2 className="why-item-label venture-studio-card-title text-slate-900">{pillar.title}</h2>
                    </div>
                    <p className="epineon-body mt-2 text-white/70 text-sm leading-relaxed">{pillar.body}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </LandingSection>

      {/* Portfolio + partners + engage — TODO: list real portfolio companies + academic partners by name */}
      <LandingSection className="venture-studio-outro border-t border-white/5">
        <div className="site-content min-w-0">
          <h2 className="epineon-h2 epineon-section-title text-slate-900">Portfolio &amp; partners</h2>
          <p className="epineon-body-large text-white/75 text-base leading-relaxed lg:text-lg">
            Our ventures span enterprise security, precision health and future intelligence, built alongside university
            and research-centre partners. Selected companies and named partners are introduced as each is ready to go public.
          </p>

          <div className="final-cta-panel text-center">
            <h2 className="epineon-h2 epineon-section-title text-slate-900">Have an idea worth building?</h2>
            <p className="epineon-body mx-auto mt-3 max-w-2xl !text-center text-white/70 text-sm">
              We partner with founders, universities, and research centers.
            </p>
            <Link to="/contact#partnerships" className="mt-8 inline-flex">
              <Button
                variant="outline"
                className="epineon-btn-secondary solution-final-cta__btn--white rounded-full px-9 py-4 text-base"
              >
                Engage the Studio
              </Button>
            </Link>
          </div>
        </div>
      </LandingSection>
    </PageShell>
  )
}
