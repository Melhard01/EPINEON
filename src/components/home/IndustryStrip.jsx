import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Landmark,
  Stethoscope,
  ShieldCheck,
  HeartPulse,
  Briefcase,
  Megaphone,
  School,
  Activity,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { LandingSection } from './LandingSection'
import financeBankingImage from '../../assets/find-your-path/finance-banking.png'
import healthcareImage from '../../assets/find-your-path/healthcare.png'
import publicSectorImage from '../../assets/find-your-path/public-sector.png'
import wellnessImage from '../../assets/find-your-path/wellness.png'
import personalImage from '../../assets/find-your-path/personal.png'
import programmesImage from '../../assets/find-your-path/programmes.png'
import leadershipImage from '../../assets/find-your-path/leadership.png'
import creatorsImage from '../../assets/find-your-path/creators.png'
import academiaImage from '../../assets/find-your-path/academia.png'

/** Audience entry paths — card grid (Principle 2: multiple entry vectors). */
const PATHS = [
  {
    icon: Landmark,
    label: "I work in finance or banking",
    href: '/industries/finance-banking',
    tag: 'Finance',
    headerBg: '#0747A6',
    tagBg: '#DEEBFF',
    tagColor: '#0747A6',
    image: financeBankingImage,
    imageAlt: 'Finance professional presenting market data and risk assessment in a modern office',
    frameBlue: true,
  },
  {
    icon: Stethoscope,
    label: "I'm a clinician or care provider",
    href: '/industries/healthcare',
    tag: 'Healthcare',
    headerBg: '#00875A',
    tagBg: '#E3FCEF',
    tagColor: '#006644',
    image: healthcareImage,
    imageAlt: 'Healthcare professionals collaborating in a modern hospital corridor',
    frameGreen: true,
  },
  {
    icon: ShieldCheck,
    label: 'I work in government or defence',
    href: '/industries/government-defence',
    tag: 'Public sector',
    headerBg: '#0052CC',
    tagBg: '#B3D4FF',
    tagColor: '#003884',
    image: publicSectorImage,
    imageAlt: 'Government and defence leaders reviewing national security and strategic analysis data',
    frameBlue: true,
  },
  {
    icon: HeartPulse,
    label: "I'm a wellness coach",
    href: '/industries/wellness-coaching',
    tag: 'Wellness',
    headerBg: '#36B37E',
    tagBg: '#ABF5D1',
    tagColor: '#006644',
    image: wellnessImage,
    imageAlt: 'Wellness coach guiding a client through an exercise in a modern gym',
    frameGreen: true,
  },
  {
    icon: Activity,
    label: "I'm optimising my own health",
    href: '/industries/longevity',
    tag: 'Personal',
    headerBg: '#6554C0',
    tagBg: '#EAE6FF',
    tagColor: '#403294',
    image: personalImage,
    imageAlt: 'Person preparing a healthy meal in a bright modern kitchen',
    frameGreen: true,
  },
  {
    icon: Building2,
    label: 'I run a clinic or health programme',
    href: '/industries/clinics-organisations',
    tag: 'Programmes',
    headerBg: '#8777D9',
    tagBg: '#EAE6FF',
    tagColor: '#5243AA',
    image: programmesImage,
    imageAlt: 'Clinician with EpiTrust doctor portal and EPIWELL metabolic health mobile app',
    imagePosition: '75% top',
    frameGreen: true,
  },
  {
    icon: Briefcase,
    label: "I lead a company",
    href: '/industries/enterprise-workforce',
    tag: 'Leadership',
    headerBg: '#2684FF',
    tagBg: '#DEEBFF',
    tagColor: '#0052CC',
    image: leadershipImage,
    imageAlt: 'Business leader facilitating a team meeting in a modern office',
    framePurple: true,
  },
  {
    icon: Megaphone,
    label: "I'm an educator or influencer",
    href: '/industries/influencers-educators',
    tag: 'Creators',
    headerBg: '#5243AA',
    tagBg: '#DFD8FD',
    tagColor: '#403294',
    image: creatorsImage,
    imageAlt: 'Educator or creator recording content with laptop and phone in a bright home studio',
    framePurple: true,
  },
  {
    icon: School,
    label: "I work in higher education",
    href: '/industries/universities-academics',
    tag: 'Academia',
    headerBg: '#006644',
    tagBg: '#E3FCEF',
    tagColor: '#004D33',
    image: academiaImage,
    imageAlt: 'Professor teaching a diverse group of students in a modern lecture hall',
    imagePosition: '65% top',
    framePurple: true,
  },
]

function getScrollGap(el) {
  if (!el) return 24
  const gap = parseFloat(getComputedStyle(el).columnGap || getComputedStyle(el).gap)
  return Number.isFinite(gap) ? gap : 24
}

function updateScrollButtons(el) {
  if (!el) return { canPrev: false, canNext: false }
  const maxScroll = el.scrollWidth - el.clientWidth
  return {
    canPrev: el.scrollLeft > 4,
    canNext: el.scrollLeft < maxScroll - 4,
  }
}

function IndustryStripContent() {
  const scrollRef = useRef(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  const syncScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const { canPrev: prev, canNext: next } = updateScrollButtons(el)
    setCanPrev(prev)
    setCanNext(next)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return undefined

    syncScrollState()

    const onScroll = () => syncScrollState()
    el.addEventListener('scroll', onScroll, { passive: true })

    const ro = new ResizeObserver(() => syncScrollState())
    ro.observe(el)

    return () => {
      el.removeEventListener('scroll', onScroll)
      ro.disconnect()
    }
  }, [syncScrollState])

  const scrollByDirection = (direction) => {
    const el = scrollRef.current
    if (!el) return

    const card = el.querySelector('.path-card')
    const step = card ? card.offsetWidth + getScrollGap(el) : Math.round(el.clientWidth * 0.85)

    el.scrollBy({
      left: direction === 'next' ? step : -step,
      behavior: 'smooth',
    })
  }

  return (
    <div className="industry-strip-inner min-w-0">
      <div className="site-content min-w-0">
        <h2
          id="find-your-path"
          className="epineon-h2 epineon-section-title text-slate-900 scroll-animate"
        >
          Find your path.
        </h2>
      </div>

      <div className="path-cards-section mt-12 scroll-animate lg:mt-16">
        <div className="path-cards-bleed">
          <div
            ref={scrollRef}
            className="path-cards-scroll flex gap-6 overflow-x-auto pt-3 pb-1 md:gap-8 lg:gap-10"
            role="region"
            aria-label="Industry paths"
            tabIndex={0}
          >
            {PATHS.map((path) => {
              const Icon = path.icon
              return (
                <Link
                  key={path.href}
                  to={path.href}
                  className={`path-card group shrink-0 flex-col overflow-hidden rounded-2xl no-underline transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl${path.frameBlue ? ' path-card--frame-blue' : ''}${path.frameGreen ? ' path-card--frame-green' : ''}${path.framePurple ? ' path-card--frame-purple' : ''}`}
                >
                  <div className={`path-card-visual${path.image ? ' path-card-visual--image' : ''}`}>
                    {path.image ? (
                      <img
                        src={path.image}
                        alt={path.imageAlt ?? ''}
                        className="path-card-image"
                        style={
                          path.imagePosition
                            ? {
                                objectPosition: path.imagePosition,
                                transformOrigin: path.imagePosition,
                              }
                            : undefined
                        }
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className="path-card-icon-wrap" aria-hidden>
                        <Icon className="path-card-icon" strokeWidth={1.5} style={{ color: path.headerBg }} />
                      </span>
                    )}
                  </div>
                  <div className="path-card-body">
                    <span className="path-card-tag">{path.tag}</span>
                    <h3 className="path-card-title">{path.label}</h3>
                    <span className="path-card-cta">Explore path →</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="path-cards-nav mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            className="path-cards-nav-btn"
            aria-label="Scroll to previous paths"
            disabled={!canPrev}
            onClick={() => scrollByDirection('prev')}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            className="path-cards-nav-btn"
            aria-label="Scroll to next paths"
            disabled={!canNext}
            onClick={() => scrollByDirection('next')}
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  )
}

/** Section 3 — Find your path (horizontal scroll + nav arrows). */
export function IndustryStrip() {
  return (
    <LandingSection
      id="industries"
      className="border-t border-white/5 py-16 lg:py-20"
      aria-labelledby="find-your-path"
    >
      <IndustryStripContent />
    </LandingSection>
  )
}
