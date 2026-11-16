import React from 'react'
import { Button } from '../ui/button'
import { LandingSection } from './LandingSection'
import { HeroBackgroundVideo } from './HeroBackgroundVideo'

export function HeroSection({ onWatchStory }) {
  return (
    <div className="site-content min-w-0">
      <div className="flex flex-col items-center justify-start pt-8 sm:pt-14 lg:pt-24">
        <div className="w-full min-w-0 max-w-3xl scroll-animate text-center sm:max-w-4xl">
          <div className="space-y-8 lg:space-y-10">
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <h1 className="hero-display-serif text-reveal text-center leading-snug text-balance text-4xl sm:text-5xl md:text-[2.875rem] lg:text-6xl xl:text-7xl">
                <span className="hero-display-line1 mb-2 block text-4xl sm:mb-3 sm:text-5xl md:text-[2.875rem] lg:text-6xl xl:text-7xl">
                  Human-centred AI for high-stakes work,
                </span>
                <span className="hero-display-line2 block text-4xl sm:text-5xl md:text-[2.875rem] lg:text-6xl xl:text-7xl">
                  built on trust.
                </span>
              </h1>
            </div>
            <p className="hero-steward-tagline scroll-animate scroll-animate-delay-2 mx-auto w-full max-w-[min(100%,20.5rem)] text-balance text-pretty text-center font-normal sm:max-w-2xl lg:max-w-3xl">
              Epineon builds private, human-centred AI for organisations and people operating where trust, privacy
              and foresight are non-negotiable.
            </p>
          </div>
          {/* The pair fits on one line from ~400px, so it turns horizontal there rather than
              waiting for sm (640px) — that left a dead zone where two short buttons sat stacked
              in a 264px column on a 600px-wide screen. flex-wrap is the safety net: if the two
              ever do not fit, they wrap instead of overflowing. */}
          <div className="mx-auto mt-8 flex scroll-animate scroll-animate-delay-4 w-full max-w-[16.5rem] flex-col items-center justify-center gap-2.5 min-[390px]:max-w-none min-[390px]:flex-row min-[390px]:flex-wrap sm:gap-3">
            <Button
              asChild
              className="epineon-btn-primary hero-cta-learn-more shadow-none w-full min-h-11 min-w-0 rounded-full whitespace-normal text-center text-sm px-5 min-[390px]:w-auto min-[390px]:whitespace-nowrap sm:px-6 md:min-h-12 md:text-base md:px-7 lg:text-lg lg:px-8"
            >
              <a href="#ecosystems">Explore Ecosystems</a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="epineon-btn-secondary hero-cta-outline shadow-none !bg-white !text w-full min-h-11 min-w-0 rounded-full whitespace-normal text-center text-sm px-5 min-[390px]:w-auto min-[390px]:whitespace-nowrap sm:px-6 md:min-h-12 md:text-base md:px-7 lg:text-lg lg:px-8"
            >
              <a href="#industries">
                <span className="hero-cta-story-text">Find your path</span>
              </a>
            </Button>
          </div>
          <div className="mt-5 flex flex-wrap scroll-animate scroll-animate-delay-4 items-center justify-center gap-x-6 gap-y-2">
            <button
              type="button"
              onClick={onWatchStory}
              className="hero-story-link -mx-2 inline-flex min-h-[44px] items-center gap-2 rounded-md px-2 py-2 text-sm font-medium tracking-wide text-[#c9a227] underline-offset-4 transition-colors hover:text-[#e8c95a] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a227]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <span aria-hidden>▶</span>
              <span>Watch our story</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function HeroSectionBlock({ onWatchStory }) {
  return (
    <LandingSection id="home" withMeshBackground={false} className="landing-hero-section landing-hero-section--top-glow pb-24 pt-20 sm:pt-24 lg:pb-28 lg:pt-28">
      <div className="landing-hero-section__bg" aria-hidden>
        <div className="landing-hero-section__grid" />
        <HeroBackgroundVideo />
        <div className="landing-hero-section__glow" />
      </div>
      <div className="relative z-10">
        <HeroSection onWatchStory={onWatchStory} />
      </div>
    </LandingSection>
  )
}
