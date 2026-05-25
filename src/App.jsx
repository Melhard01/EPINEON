import React, { useState } from 'react'
import { Button } from './components/ui/button'
import { useScrollAnimation } from './hooks/useScrollAnimation'
import CookieConsent from './components/CookieConsent'
import './App.css'
import './theme-landing-dark.css'
import CookieSettingsButton from './components/CookieSettingsButton'
import { SiteHeader } from './components/SiteHeader'
import { SiteFooter } from './components/SiteFooter'
import { Seo } from './components/Seo'
import { EcosystemPortfolio } from './components/home/EcosystemPortfolio'
import { IndustryStrip } from './components/home/IndustryStrip'
import { SocialProof } from './components/home/SocialProof'
import { WhyEpineon } from './components/home/WhyEpineon'
import { FinalCTA } from './components/home/FinalCTA'

const STORY_VIDEO_URL =
  'https://pub-aac5b9c26dbb46c394af3e5472d9429d.r2.dev/Synergeon-presentation.mp4'

function App() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [showCookieConsent, setShowCookieConsent] = useState(false)
  const [heroRef, heroVisible] = useScrollAnimation({ initialVisible: true })

  return (
    <>
      <Seo path="/" />
      {/* Main landing (dark theme scoped via .landing-page-dark in theme-landing-dark.css) */}
      <div className="landing-page-dark relative min-h-screen min-w-0 overflow-x-clip bg-black font-inter">
        <SiteHeader />

        {/* Section 1 — Hero */}
        <section id="home" className="relative overflow-x-clip pb-16 pt-28">
          <div className="site-content min-w-0">
            <div className="flex min-h-[calc(100svh-12rem)] flex-col items-center justify-center">
              <div ref={heroRef} className={`w-full min-w-0 max-w-3xl scroll-animate text-center sm:max-w-4xl ${heroVisible ? 'visible' : ''}`}>
                <div className="space-y-5 lg:space-y-7">
                  <div className="flex flex-col items-center gap-3 sm:gap-4">
                    <p className={`hero-precision-pill scroll-animate text-reveal text-center ${heroVisible ? 'visible' : ''}`}>
                      PRECISION LIFE SCIENCE, POWERED BY AI
                    </p>
                    <h1 className={`hero-display-serif text-reveal text-center leading-snug text-balance text-4xl sm:text-5xl md:text-[2.875rem] lg:text-6xl xl:text-7xl ${heroVisible ? 'visible' : ''}`}>
                      <span className="hero-display-line1 mb-2 block text-4xl sm:mb-3 sm:text-5xl md:text-[2.875rem] lg:text-6xl xl:text-7xl">
                        Human-centred AI for high-stakes work,
                      </span>
                      <span className="hero-display-line2 block text-4xl sm:text-5xl md:text-[2.875rem] lg:text-6xl xl:text-7xl">
                        built on trust.
                      </span>
                    </h1>
                  </div>
                  <p className={`hero-steward-tagline scroll-animate scroll-animate-delay-2 mx-auto max-w-3xl text-pretty text-lg font-normal sm:text-xl lg:text-2xl ${heroVisible ? 'visible' : ''}`}>
                    Epineon builds private, human-centred AI for organisations and people operating where trust, privacy and foresight are non-negotiable.
                  </p>
                </div>
                <div className={`mx-auto mt-8 flex scroll-animate scroll-animate-delay-4 w-full max-w-[16.5rem] flex-col items-center justify-center gap-2.5 md:max-w-none md:flex-row md:justify-center md:gap-3 ${heroVisible ? 'visible' : ''}`}>
                  <Button
                    asChild
                    className="epineon-btn-primary hero-cta-learn-more shadow-none w-full min-w-0 rounded-full whitespace-normal text-center text-sm px-5 py-2.5 md:w-auto md:text-lg md:px-8 md:py-4 lg:text-xl lg:px-11 lg:py-5"
                  >
                    <a href="#ecosystems">Explore Ecosystems</a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="epineon-btn-secondary hero-cta-outline shadow-none !bg-white !text w-full min-w-0 rounded-full whitespace-normal text-center text-sm px-5 py-2.5 md:w-auto md:text-lg md:px-8 md:py-4 lg:text-xl lg:px-11 lg:py-5"
                  >
                    <a href="#industries"><span className="hero-cta-story-text">Find your path</span></a>
                  </Button>
                </div>
                <div className={`mt-5 flex flex-wrap scroll-animate scroll-animate-delay-4 items-center justify-center gap-x-6 gap-y-2 ${heroVisible ? 'visible' : ''}`}>
                  <button
                    type="button"
                    onClick={() => setIsVideoModalOpen(true)}
                    className="hero-story-link -mx-2 inline-flex min-h-[44px] items-center gap-2 rounded-md px-2 py-2 text-sm font-medium tracking-wide text-[#c9a227] underline-offset-4 transition-colors hover:text-[#e8c95a] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a227]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    <span aria-hidden>▶</span>
                    <span>Watch our story</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 — Ecosystem Portfolio */}
        <EcosystemPortfolio />

        {/* Section 3 — Industry Entry Strip */}
        <IndustryStrip />

        {/* Section 4 — Social Proof */}
        <SocialProof />

        {/* Section 5 — Why Epineon */}
        <WhyEpineon />

        {/* Section 6 — Final CTA */}
        <FinalCTA />

        <SiteFooter />
      </div>

      {/* Cookie Consent Banner */}
      <CookieConsent openFromButton={showCookieConsent} onClose={() => setShowCookieConsent(false)} />
      <CookieSettingsButton />

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex max-h-[100dvh] items-center justify-center overflow-y-auto overflow-x-clip overscroll-contain p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative my-auto w-full max-w-5xl shrink-0 aspect-video max-h-[min(90dvh,calc(100dvh-2rem))] bg-black rounded-lg overflow-hidden shadow-2xl">
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              aria-label="Close video"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <video
              src={STORY_VIDEO_URL}
              controls
              autoPlay
              preload="metadata"
              controlsList="nodownload nofullscreen noremoteplayback"
              disablePictureInPicture
              onContextMenu={(e) => e.preventDefault()}
              className="w-full h-full object-contain"
              onError={() => {
                alert('Sorry, the video could not be loaded. Please try again later.')
                setIsVideoModalOpen(false)
              }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="absolute inset-0 -z-10" onClick={() => setIsVideoModalOpen(false)} />
        </div>
      )}
    </>
  )
}

export default App
