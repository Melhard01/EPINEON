import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { usePageSectionAnimations } from './hooks/usePageSectionAnimations'
import CookieConsent from './components/CookieConsent'
import './App.css'
import './theme-landing-dark.css'
import CookieSettingsButton from './components/CookieSettingsButton'
import { SiteHeader } from './components/SiteHeader'
import { SiteFooter } from './components/SiteFooter'
import { Seo } from './components/Seo'
import { EcosystemPortfolio } from './components/home/EcosystemPortfolio'
import { IndustryStrip } from './components/home/IndustryStrip'
import { WhyEpineon } from './components/home/WhyEpineon'
import { FinalCTA } from './components/home/FinalCTA'
import { HeroSectionBlock } from './components/home/HeroSection'

const STORY_VIDEO_URL =
  'https://pub-aac5b9c26dbb46c394af3e5472d9429d.r2.dev/Synergeon-presentation.mp4'

function App() {
  const mainRef = useRef(null)
  const { pathname } = useLocation()
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [showCookieConsent, setShowCookieConsent] = useState(false)

  usePageSectionAnimations(mainRef, [pathname], { sectionSnap: true })

  useEffect(() => {
    document.documentElement.classList.add('landing-scroll-snap')
    return () => document.documentElement.classList.remove('landing-scroll-snap')
  }, [])

  return (
    <>
      <Seo path="/" />
      {/* Main landing (dark theme scoped via .landing-page-dark in theme-landing-dark.css) */}
      <div className="landing-page-dark relative min-h-screen min-w-0 overflow-x-clip bg-black font-inter">
        <SiteHeader />

        <main ref={mainRef} className="page-sections page-sections--snap relative z-10">
          <HeroSectionBlock onWatchStory={() => setIsVideoModalOpen(true)} />
          <EcosystemPortfolio />
          <IndustryStrip />
          <WhyEpineon />
          <FinalCTA />
        </main>

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
