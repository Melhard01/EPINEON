import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion as Motion, useInView, useReducedMotion } from 'framer-motion'
import Autoplay from 'embla-carousel-autoplay'
import { Brain, ChevronLeft, ChevronRight, Dna, Shield } from 'lucide-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel'
import { synergeticCategories } from '../../data/synergeticSolutionsData.js'
import { getPhoneScreenshotAttrs } from '../../lib/phoneScreenshot.js'
import './synergetic-solutions.css'

function mockupTransformTemplate(_, generated) {
  if (!generated || generated === 'none') return 'none'
  return generated
}

const SYN_MOTION_EASE = [0.22, 1, 0.36, 1]

const SYN_CAROUSEL_TRANSITION = {
  duration: 0.42,
  ease: SYN_MOTION_EASE,
}

const SYN_FAN_ROTATE_TRANSITION = {
  type: 'tween',
  duration: 0.55,
  ease: SYN_MOTION_EASE,
}

const SYN_FLOAT_TRANSITION = (duration, delay) => ({
  duration,
  delay,
  repeat: Infinity,
  repeatType: 'mirror',
  ease: [0.45, 0, 0.55, 1],
})

const CATEGORY_ICONS = {
  biotech: Dna,
  cybersecurity: Shield,
  edtech: Brain,
}

/** No gallery — same stacked layout as Epi Minded (logo centered above copy). */
const STACKED_TEXT_ONLY_PRODUCT_IDS = new Set(['epi-legalet', 'epi-crypt', 'epi-quantum', 'renaissance-now'])

function buildPhoneFanSlots(count, screenAltPrefix, phoneWDesktop) {
  const titles = Array.from({ length: count }, (_, i) => `${screenAltPrefix} screen ${i + 1}`)
  if (count === 4) {
    return [
      {
        alt: titles[0],
        floatPx: 18,
        duration: 5.4,
        delay: 0,
        hoverDeltaDeg: -2,
        desktop: { leftPct: 14, topPct: 9, fanRotate: -9, z: 2, widthRem: phoneWDesktop },
      },
      {
        alt: titles[1],
        floatPx: 14,
        duration: 4.9,
        delay: 0.45,
        hoverDeltaDeg: 1,
        desktop: { leftPct: 36, topPct: 0, fanRotate: -3, z: 12, widthRem: phoneWDesktop },
      },
      {
        alt: titles[2],
        floatPx: 11,
        duration: 5.6,
        delay: 0.85,
        hoverDeltaDeg: 1,
        desktop: { leftPct: 56, topPct: 0, fanRotate: 3, z: 13, widthRem: phoneWDesktop },
      },
      {
        alt: titles[3],
        floatPx: 16,
        duration: 5.1,
        delay: 0.2,
        hoverDeltaDeg: -2,
        desktop: { leftPct: 78, topPct: 9, fanRotate: 9, z: 3, widthRem: phoneWDesktop },
      },
    ]
  }
  if (count === 6) {
    return [
      {
        alt: titles[0],
        floatPx: 18,
        duration: 5.35,
        delay: 0,
        hoverDeltaDeg: -2,
        desktop: { leftPct: 10, topPct: 11, fanRotate: -9, z: 2, widthRem: phoneWDesktop },
      },
      {
        alt: titles[1],
        floatPx: 15,
        duration: 5.05,
        delay: 0.35,
        hoverDeltaDeg: 1,
        desktop: { leftPct: 26, topPct: 4, fanRotate: -5, z: 10, widthRem: phoneWDesktop },
      },
      {
        alt: titles[2],
        floatPx: 12,
        duration: 5.55,
        delay: 0.65,
        hoverDeltaDeg: 1,
        desktop: { leftPct: 42, topPct: 0, fanRotate: -2, z: 14, widthRem: phoneWDesktop },
      },
      {
        alt: titles[3],
        floatPx: 12,
        duration: 5.45,
        delay: 0.72,
        hoverDeltaDeg: -1,
        desktop: { leftPct: 56, topPct: 0, fanRotate: 2, z: 13, widthRem: phoneWDesktop },
      },
      {
        alt: titles[4],
        floatPx: 14,
        duration: 5.15,
        delay: 0.28,
        hoverDeltaDeg: 1,
        desktop: { leftPct: 72, topPct: 4, fanRotate: 5, z: 11, widthRem: phoneWDesktop },
      },
      {
        alt: titles[5],
        floatPx: 16,
        duration: 5.08,
        delay: 0.12,
        hoverDeltaDeg: -2,
        desktop: { leftPct: 88, topPct: 11, fanRotate: 9, z: 3, widthRem: phoneWDesktop },
      },
    ]
  }
  return Array.from({ length: count }, (_, i) => {
    const t = count <= 1 ? 0.5 : i / (count - 1)
    const depth = Math.round(9 - Math.sin(t * Math.PI) * 8)
    return {
      alt: titles[i],
      floatPx: 14,
      duration: 5.1 + (i % 3) * 0.05,
      delay: (i * 0.11) % 0.85,
      hoverDeltaDeg: i % 2 === 0 ? -2 : 1,
      desktop: {
        leftPct: 10 + t * 76,
        topPct: 9 - Math.sin(t * Math.PI) * 9,
        fanRotate: Math.round(-11 + t * 22),
        z: 3 + depth,
        widthRem: phoneWDesktop,
      },
    }
  })
}

function PhoneFanNavButton({ direction, onClick, label }) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      className={`synergetic-phone-nav synergetic-phone-nav--${direction}`}
      onClick={onClick}
      aria-label={label}
    >
      <Icon className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
    </button>
  )
}

function EpiTrustPreviewToggle({ value, onChange }) {
  return (
    <div
      role="group"
      aria-label="Epi Trust preview type"
      className="synergetic-preview-toggle synergetic-preview-toggle--epi-trust"
    >
      <button
        type="button"
        className="synergetic-preview-toggle__btn"
        aria-pressed={value === 'phone'}
        onClick={() => onChange('phone')}
      >
        Mobile app
      </button>
      <button
        type="button"
        className="synergetic-preview-toggle__btn"
        aria-pressed={value === 'web'}
        onClick={() => onChange('web')}
      >
        Web portal
      </button>
    </div>
  )
}

const GALLERY_MID_NUDGE_IDS = new Set(['epi-trust', 'epi-well', 'epi-minded'])

const SCROLL_SYNC_FALLBACK_MS = 500
const SCROLL_DEBOUNCE_MS = 100

/** Read active slide index from scroll position (works with sub-pixel widths on mobile). */
function readSlideIndexFromStrip(el, slideCount) {
  if (!el || slideCount < 1) return 0
  const slides = el.querySelectorAll(':scope > .synergetic-mobile-scroll-slide')
  if (!slides.length) return 0

  const scrollLeft = el.scrollLeft
  let closest = 0
  let minDist = Number.POSITIVE_INFINITY
  slides.forEach((slide, i) => {
    const dist = Math.abs(slide.offsetLeft - scrollLeft)
    if (dist < minDist) {
      minDist = dist
      closest = i
    }
  })
  return Math.max(0, Math.min(closest, slideCount - 1))
}

/** Scroll strip to a slide without relying on a fixed clientWidth (iOS-safe). */
function scrollStripToSlide(el, index, reduceMotion, behavior) {
  if (!el || index < 0) return false
  const slide = el.children[index]
  if (!slide || !(slide instanceof HTMLElement)) return false

  const scrollBehavior = reduceMotion ? 'auto' : behavior ?? 'smooth'
  try {
    slide.scrollIntoView({
      behavior: scrollBehavior,
      inline: 'start',
      block: 'nearest',
    })
  } catch {
    slide.scrollIntoView(false)
  }
  return true
}

/** Mobile / solo carousel — native horizontal scroll with snap for smooth touch swiping. */
function MobileScreenshotScrollStrip({
  slideCount,
  slideIndex,
  onSlideChange,
  onInteractStart,
  onInteractEnd,
  reduceMotion,
  productName,
  renderSlide,
  className = '',
}) {
  const [stripEl, setStripEl] = useState(null)
  const syncingFromProps = useRef(false)
  const indexFromUserScroll = useRef(false)
  const scrollDebounceTimer = useRef(null)
  const scrollToFallbackTimer = useRef(null)
  const rafAlignId = useRef(null)
  const touchActive = useRef(false)

  const slideIndexRef = useRef(slideIndex)
  const slideCountRef = useRef(slideCount)
  const onSlideChangeRef = useRef(onSlideChange)
  const onInteractEndRef = useRef(onInteractEnd)
  const reduceMotionRef = useRef(reduceMotion)

  slideIndexRef.current = slideIndex
  slideCountRef.current = slideCount
  onSlideChangeRef.current = onSlideChange
  onInteractEndRef.current = onInteractEnd
  reduceMotionRef.current = reduceMotion

  const clearSyncLock = useCallback(() => {
    syncingFromProps.current = false
    if (scrollToFallbackTimer.current != null && typeof window !== 'undefined') {
      window.clearTimeout(scrollToFallbackTimer.current)
      scrollToFallbackTimer.current = null
    }
  }, [])

  const scrollToIndex = useCallback(
    (index, behavior) => {
      const el = stripEl
      const count = slideCountRef.current
      if (!el || count < 1 || index < 0 || index >= count) return false

      const current = readSlideIndexFromStrip(el, count)
      if (current === index && !syncingFromProps.current) {
        clearSyncLock()
        return true
      }

      if (scrollToFallbackTimer.current != null && typeof window !== 'undefined') {
        window.clearTimeout(scrollToFallbackTimer.current)
      }

      syncingFromProps.current = true
      const didScroll = scrollStripToSlide(el, index, reduceMotionRef.current, behavior)
      if (!didScroll) {
        clearSyncLock()
        return false
      }

      if (typeof window !== 'undefined') {
        scrollToFallbackTimer.current = window.setTimeout(
          clearSyncLock,
          reduceMotionRef.current ? 50 : SCROLL_SYNC_FALLBACK_MS,
        )
      }
      return true
    },
    [stripEl, clearSyncLock],
  )

  const scheduleAlignToIndex = useCallback(
    (index, behavior) => {
      if (typeof window === 'undefined') return
      if (rafAlignId.current != null) {
        window.cancelAnimationFrame(rafAlignId.current)
      }
      rafAlignId.current = window.requestAnimationFrame(() => {
        rafAlignId.current = null
        scrollToIndex(index, behavior)
      })
    },
    [scrollToIndex],
  )

  useEffect(() => {
    if (indexFromUserScroll.current) {
      indexFromUserScroll.current = false
      return
    }
    if (!stripEl || slideCount < 1) return
    scheduleAlignToIndex(slideIndex, reduceMotion ? 'auto' : 'smooth')
  }, [slideIndex, slideCount, stripEl, reduceMotion, scheduleAlignToIndex])

  useEffect(() => {
    const el = stripEl
    if (!el || typeof window === 'undefined') return undefined

    const syncIndexFromScroll = () => {
      const count = slideCountRef.current
      if (!el.isConnected || count < 1) return

      if (syncingFromProps.current) {
        const target = slideIndexRef.current
        const current = readSlideIndexFromStrip(el, count)
        if (current === target) {
          clearSyncLock()
        }
        return
      }

      const index = readSlideIndexFromStrip(el, count)
      if (index !== slideIndexRef.current) {
        indexFromUserScroll.current = true
        onSlideChangeRef.current?.(index)
      }
    }

    const onScroll = () => {
      if (scrollDebounceTimer.current != null) {
        window.clearTimeout(scrollDebounceTimer.current)
      }
      scrollDebounceTimer.current = window.setTimeout(syncIndexFromScroll, SCROLL_DEBOUNCE_MS)
    }

    const supportsScrollEnd =
      typeof window !== 'undefined' && 'onscrollend' in window
    if (supportsScrollEnd) {
      el.addEventListener('scrollend', syncIndexFromScroll)
    }
    el.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      if (supportsScrollEnd) {
        el.removeEventListener('scrollend', syncIndexFromScroll)
      }
      el.removeEventListener('scroll', onScroll)
      if (scrollDebounceTimer.current != null) {
        window.clearTimeout(scrollDebounceTimer.current)
      }
      clearSyncLock()
    }
  }, [stripEl, clearSyncLock])

  useEffect(() => {
    const el = stripEl
    if (!el || typeof window === 'undefined' || typeof ResizeObserver === 'undefined') {
      return undefined
    }

    const ro = new ResizeObserver(() => {
      if (syncingFromProps.current || indexFromUserScroll.current || slideCountRef.current < 1) {
        return
      }
      const index = slideIndexRef.current
      const current = readSlideIndexFromStrip(el, slideCountRef.current)
      if (current !== index && el.clientWidth > 0) {
        scheduleAlignToIndex(index, reduceMotionRef.current ? 'auto' : 'auto')
      }
    })

    ro.observe(el)
    return () => ro.disconnect()
  }, [stripEl, scheduleAlignToIndex])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const onResize = () => {
      const el = stripEl
      if (!el || syncingFromProps.current || slideCountRef.current < 1 || el.clientWidth < 1) {
        return
      }
      const index = slideIndexRef.current
      if (readSlideIndexFromStrip(el, slideCountRef.current) !== index) {
        scheduleAlignToIndex(index, 'auto')
      }
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [stripEl, scheduleAlignToIndex])

  useEffect(
    () => () => {
      if (typeof window === 'undefined') return
      if (rafAlignId.current != null) {
        window.cancelAnimationFrame(rafAlignId.current)
      }
      if (scrollDebounceTimer.current != null) {
        window.clearTimeout(scrollDebounceTimer.current)
      }
      clearSyncLock()
    },
    [clearSyncLock],
  )

  const handleTouchStart = useCallback(() => {
    touchActive.current = true
    onInteractStart?.()
  }, [onInteractStart])

  const handleTouchEnd = useCallback(() => {
    if (!touchActive.current) return
    touchActive.current = false
    const el = stripEl
    if (typeof window === 'undefined') {
      onInteractEnd?.()
      return
    }
    window.setTimeout(() => {
      if (el?.isConnected && slideCountRef.current > 0) {
        const index = readSlideIndexFromStrip(el, slideCountRef.current)
        if (index !== slideIndexRef.current) {
          indexFromUserScroll.current = true
          onSlideChangeRef.current?.(index)
        }
      }
      onInteractEndRef.current?.()
    }, SCROLL_DEBOUNCE_MS)
  }, [stripEl])

  const safeSlideCount = Math.max(0, slideCount | 0)
  if (safeSlideCount < 1) {
    return null
  }

  return (
    <div
      ref={setStripEl}
      className={`synergetic-mobile-scroll-strip${className ? ` ${className}` : ''}`}
      role="region"
      aria-label={`${productName} previews`}
      aria-live="polite"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {Array.from({ length: safeSlideCount }, (_, i) => (
        <div
          key={i}
          className="synergetic-mobile-scroll-slide"
          data-slide-index={i}
          aria-hidden={i !== slideIndex}
        >
          {typeof renderSlide === 'function' ? renderSlide(i) : null}
        </div>
      ))}
    </div>
  )
}

/** Phone previews: single carousel (narrow), two-at-a-time pairs (tablet), full fan (wide). Pauses auto-advance on carousel hover. */
function ProductPhoneFanStack({
  shots,
  productName,
  productId,
  compact = false,
  frameKind = 'phone',
  uniformScreens = false,
}) {
  const reduceMotion = useReducedMotion()
  const rootRef = useRef(null)
  const inView = useInView(rootRef, { amount: 0.22, margin: '0px 0px -12% 0px' })
  const [layoutVariant, setLayoutVariant] = useState(() => {
    if (typeof window === 'undefined') return 'mobile'
    if (window.matchMedia('(min-width: 1280px)').matches) return 'desktop'
    if (window.matchMedia('(min-width: 900px)').matches) return 'tablet'
    return 'mobile'
  })
  const [mobileSlide, setMobileSlide] = useState(0)
  const [tabletPair, setTabletPair] = useState(0)
  const [carouselHovered, setCarouselHovered] = useState(false)
  const [carouselInteracting, setCarouselInteracting] = useState(false)

  const count = shots?.length ?? 0
  const pairCount = Math.max(1, Math.ceil(count / 2))
  const isWebFrame = frameKind === 'web'
  const isEpiTrustWeb = productId === 'epi-trust' && isWebFrame
  const screenAltPrefix = isWebFrame ? `${productName} web portal` : `${productName} app`

  const phoneWDesktop = isWebFrame ? (compact ? 21 : 26) : compact ? 11.85 : 12.75
  const phoneWMobile = isWebFrame ? 22.5 : compact ? 7.5 : 8.05
  const phoneTabletPair = isWebFrame ? 20 : compact ? 7.65 : 8.4

  const slots = useMemo(
    () => (count > 0 ? buildPhoneFanSlots(count, screenAltPrefix, phoneWDesktop) : []),
    [count, screenAltPrefix, phoneWDesktop],
  )

  useEffect(() => {
    if (!count) return
    setMobileSlide((s) => Math.min(s, count - 1))
    setTabletPair((p) => Math.min(p, pairCount - 1))
  }, [count, pairCount])

  useEffect(() => {
    setMobileSlide(0)
    setTabletPair(0)
  }, [shots, frameKind])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const mq900 = window.matchMedia('(min-width: 900px)')
    const mq1280 = window.matchMedia('(min-width: 1280px)')
    const sync = () => {
      if (mq1280.matches) setLayoutVariant('desktop')
      else if (mq900.matches) setLayoutVariant('tablet')
      else setLayoutVariant('mobile')
    }
    sync()
    mq900.addEventListener('change', sync)
    mq1280.addEventListener('change', sync)
    return () => {
      mq900.removeEventListener('change', sync)
      mq1280.removeEventListener('change', sync)
    }
  }, [])

  const singleCarousel =
    layoutVariant === 'mobile' || (isWebFrame && layoutVariant === 'tablet') || isEpiTrustWeb

  useEffect(() => {
    if (!count || reduceMotion || !inView || carouselHovered || carouselInteracting) return undefined
    if (singleCarousel) {
      const id = window.setInterval(() => {
        setMobileSlide((s) => (s + 1) % count)
      }, 4200)
      return () => window.clearInterval(id)
    }
    if (layoutVariant === 'tablet' && pairCount > 1) {
      const id = window.setInterval(() => {
        setTabletPair((p) => (p + 1) % pairCount)
      }, 4500)
      return () => window.clearInterval(id)
    }
    return undefined
  }, [singleCarousel, layoutVariant, inView, reduceMotion, carouselHovered, carouselInteracting, count, pairCount])

  const mobileSoloWidthRem = isWebFrame
    ? isEpiTrustWeb
      ? 30
      : undefined
    : uniformScreens
      ? 6.85
      : compact
        ? 7.5
        : 8.05

  const renderMobileSlide = useCallback(
    (i) => {
      const slot = slots[i]
      if (!slot) return null
      return (
        <FanPhoneSlot
          slot={slot}
          src={shots?.[i]}
          screenIndex={i + 1}
          inView={inView}
          reduceMotion={reduceMotion}
          variant="mobileSolo"
          soloWidthRem={mobileSoloWidthRem}
          frameKind={frameKind}
          uniformScreens={uniformScreens}
        />
      )
    },
    [slots, shots, inView, reduceMotion, mobileSoloWidthRem, frameKind, uniformScreens],
  )

  if (!count || slots.length !== count) {
    return null
  }

  const leftTabletIdx = tabletPair * 2
  const rightTabletIdx = leftTabletIdx + 1
  const hasRightTablet = rightTabletIdx < count
  const wideFan = count > 4
  const isEpiTrust = productId === 'epi-trust'
  const isEpiWell = productId === 'epi-well'
  const isEpiMinded = productId === 'epi-minded'
  const isGalleryLayoutNatural = isEpiTrust || isEpiWell || isEpiMinded
  const fanStageClass = !isWebFrame
    ? [
        'synergetic-phone-fan-stage',
        compact && 'synergetic-phone-fan-stage--compact',
        wideFan && 'synergetic-phone-fan-stage--wide',
      ]
        .filter(Boolean)
        .join(' ')
    : ''
  const desktopMinW = isWebFrame
    ? 'min-[1280px]:w-full min-[1280px]:min-w-0'
    : isGalleryLayoutNatural && compact
      ? 'w-full max-w-full min-w-0'
      : compact
        ? count > 4
          ? 'min-[1280px]:min-w-[24rem]'
          : 'min-[1280px]:min-w-[21rem]'
        : count > 4
          ? 'min-[1280px]:min-w-[28rem]'
          : 'min-[1280px]:min-w-[23rem]'
  const desktopInnerMinH = isWebFrame
    ? 'synergetic-web-gallery--fan relative w-full max-w-full overflow-visible pb-0'
    : `${fanStageClass} relative w-full max-w-full min-w-0 overflow-visible pb-0`

  const isEpimindedFan = count === 4
  const rootDesktopLayout = isEpiTrustWeb
    ? 'min-[1280px]:justify-end'
    : wideFan
      ? 'min-[1280px]:justify-end min-[1280px]:max-[1290px]:translate-x-[calc(0.75rem-0.5rem-2cm)] min-[1291px]:max-[1291px]:translate-x-[calc(0.75rem-0.5rem-3cm)] min-[1292px]:max-[1292px]:translate-x-[calc(0.75rem-1cm-0.5rem-5cm)] min-[1293px]:max-[1299px]:translate-x-[calc(0.75rem-0.5rem-3cm)] min-[1300px]:max-[1300px]:translate-x-[calc(0.75rem-0.5rem-4cm)] min-[1301px]:max-[1307px]:translate-x-[calc(0.75rem-1cm-0.5rem-4cm)] min-[1308px]:max-[1439px]:translate-x-[calc(0.75rem-0.5rem-2cm)] min-[1440px]:max-[2559px]:translate-x-[calc(0.75rem-1cm-0.5rem-1cm)] min-[2560px]:translate-x-[calc(0.75rem-1cm-0.5rem-4.5cm)]'
      : isEpimindedFan
        ? 'min-[1280px]:justify-end min-[1280px]:max-[1292px]:-translate-x-[calc(2.5rem+0.5rem+2cm)] min-[1293px]:max-[1300px]:-translate-x-[calc(2.5rem+0.5rem+1cm)] min-[1301px]:max-[1306px]:-translate-x-[calc(2.5rem+0.5rem-0.5cm)] min-[1307px]:max-[1307px]:-translate-x-[calc(2.5rem+0.5rem+2cm)] min-[1308px]:max-[1439px]:-translate-x-[calc(2.5rem+0.5rem)] min-[1440px]:max-[2559px]:-translate-x-[calc(2.5rem+0.5rem)] min-[2560px]:-translate-x-[calc(2.5rem+0.5rem+3.5cm)]'
        : 'min-[1280px]:justify-end min-[1280px]:-translate-x-[calc(2.5rem+1cm+0.5rem)] min-[1440px]:-translate-x-[calc(2.5rem+0.5rem)] min-[2560px]:-translate-x-[calc(2.5rem+0.5rem+3.5cm)]'
  const useGalleryMidNudge = productId != null && GALLERY_MID_NUDGE_IDS.has(productId)
  const galleryMidNudge =
    useGalleryMidNudge && !isEpiTrustWeb ? 'min-[900px]:max-[1022px]:translate-x-[2.5cm]' : ''
  const galleryWebTrustNudge = isEpiTrustWeb
    ? 'min-[900px]:max-[1244px]:translate-x-[1cm] min-[1280px]:max-[1675px]:translate-x-[1cm] min-[1767px]:max-[4667px]:-translate-x-[1cm]'
    : ''
  const rootTabletShift = useGalleryMidNudge
    ? compact
      ? 'min-[1023px]:max-[1279px]:-translate-x-[calc(2.5rem+4cm)] min-[1024px]:max-[1279px]:-translate-x-[calc(2.5rem+4cm-4.5cm)]'
      : isEpimindedFan
        ? 'min-[1023px]:max-[1279px]:-translate-x-[calc(2.5rem+2cm)] min-[1024px]:max-[1279px]:-translate-x-[2.5rem]'
        : isEpiTrustWeb
          ? 'min-[1245px]:max-[1279px]:-translate-x-10'
          : 'min-[1023px]:max-[1279px]:-translate-x-10'
    : compact
      ? 'min-[900px]:max-[1023px]:-translate-x-[calc(2.5rem+4cm)] min-[1024px]:max-[1279px]:-translate-x-[calc(2.5rem+4cm-4.5cm)]'
      : isEpimindedFan
        ? 'min-[900px]:max-[1023px]:-translate-x-[calc(2.5rem+2cm)] min-[1024px]:max-[1279px]:-translate-x-[calc(2.5rem+2cm-2cm)]'
        : 'min-[900px]:max-[1279px]:-translate-x-10'

  const rootOuterSizing = isWebFrame
    ? isGalleryLayoutNatural && compact
      ? 'w-full max-w-full min-w-0'
      : 'w-full max-w-full min-[900px]:mt-3 min-[1280px]:max-w-none lg:mt-4'
    : isGalleryLayoutNatural && compact
      ? 'w-full max-w-full min-w-0'
      : compact
        ? 'max-w-[min(100%,18.5rem)] min-[900px]:max-w-[12.25rem]'
        : 'max-w-[min(100%,19.5rem)] min-[900px]:mt-4 min-[900px]:max-w-[13.5rem] lg:mt-5'
  const mobileShellClass = isWebFrame
    ? 'relative mx-auto flex w-full max-w-full flex-col items-center overflow-visible px-1 pb-1'
    : isGalleryLayoutNatural && compact
      ? 'relative mx-auto flex w-full max-w-full flex-col items-center overflow-visible px-1 pb-1'
      : compact
        ? 'relative mx-auto flex w-full max-w-[18.5rem] flex-col items-center overflow-visible px-1 pb-1'
        : 'relative mx-auto flex w-full max-w-[19.5rem] flex-col items-center overflow-visible px-1 pb-1'
  const goMobilePrev = () => setMobileSlide((s) => (s - 1 + count) % count)
  const goMobileNext = () => setMobileSlide((s) => (s + 1) % count)
  const goTabletPrev = () => setTabletPair((p) => (p - 1 + pairCount) % pairCount)
  const goTabletNext = () => setTabletPair((p) => (p + 1) % pairCount)
  const tabletShellClass = isWebFrame
    ? 'relative mx-auto flex w-full max-w-full flex-col items-center overflow-visible pb-1 min-[900px]:px-1'
    : compact
      ? 'relative mx-auto flex w-full max-w-[27rem] flex-col items-center overflow-visible pb-1 min-[900px]:max-w-[31rem]'
      : 'relative mx-auto flex w-full max-w-[30rem] flex-col items-center overflow-visible pb-1 min-[900px]:max-w-[34rem]'
  const tabletRowMinClass = isWebFrame
    ? 'relative flex min-h-[300px] w-full items-start justify-center pt-1 min-[480px]:min-h-[360px]'
    : compact
      ? 'relative flex min-h-[290px] w-full items-start justify-center pt-1 min-[480px]:min-h-[340px]'
      : 'relative flex min-h-[320px] w-full items-start justify-center pt-1 min-[480px]:min-h-[380px]'
  const singleCarouselFrameClass = isWebFrame
    ? isEpiTrustWeb
      ? 'synergetic-web-gallery__carousel synergetic-web-gallery__carousel--epi-trust-solo relative flex min-h-[clamp(200px,58vw,280px)] w-full items-center justify-center min-[480px]:min-h-[clamp(220px,52vw,320px)] min-[900px]:min-h-[clamp(240px,38vw,400px)]'
      : 'synergetic-web-gallery__carousel relative flex min-h-[clamp(180px,52vw,240px)] w-full items-center justify-center min-[480px]:min-h-[clamp(200px,48vw,260px)]'
    : uniformScreens
      ? 'relative z-[1] flex min-h-[clamp(220px,64vw,320px)] w-full max-w-[min(100%,19.5rem)] items-center justify-center px-4 min-[480px]:min-h-[clamp(240px,58vw,360px)] min-[480px]:max-w-[min(100%,21rem)] min-[480px]:px-8 min-[640px]:px-9'
      : compact
        ? 'relative flex min-h-[260px] w-full items-center justify-center px-9 min-[480px]:min-h-[280px]'
        : 'relative flex min-h-[280px] w-full items-center justify-center px-9 min-[480px]:min-h-[300px]'
  const webGalleryRootClass = isWebFrame
    ? `synergetic-web-gallery${singleCarousel ? '' : ' synergetic-web-gallery--fan'}`
    : ''

  const galleryPositionClasses = isGalleryLayoutNatural
    ? 'min-[1280px]:justify-end'
    : `${galleryMidNudge} ${galleryWebTrustNudge} ${rootTabletShift} ${rootDesktopLayout}`.trim()

  return (
    <div
      ref={rootRef}
      className={`${webGalleryRootClass} relative mx-auto w-full shrink-0 select-none overflow-visible pb-0 min-[900px]:mx-0 min-[900px]:flex min-[900px]:max-w-none min-[900px]:min-w-0 min-[900px]:flex-1 min-[900px]:basis-0 ${galleryPositionClasses} min-[900px]:justify-end min-[900px]:max-[1279px]:flex-col min-[1280px]:flex-row min-[900px]:pb-0 ${rootOuterSizing} ${desktopMinW}${compact ? '' : ' mt-2'}${isEpiTrustWeb ? ' synergetic-web-gallery--epi-trust-carousel' : ''}`}
      aria-label={`${productName} interface previews`}
    >
      <div
        className={
          singleCarousel
            ? mobileShellClass
            : layoutVariant === 'tablet'
              ? tabletShellClass
              : desktopInnerMinH
        }
      >
        {singleCarousel ? (
          <div
            className="flex w-full flex-col items-center"
            onMouseEnter={() => setCarouselHovered(true)}
            onMouseLeave={() => setCarouselHovered(false)}
          >
            <div
              className={`${singleCarouselFrameClass} synergetic-carousel-stage relative${
                isEpiTrustWeb && count > 1 ? ' synergetic-carousel-stage--trust-web' : ''
              }`}
            >
              {count > 1 && isEpiTrustWeb ? (
                <>
                  <PhoneFanNavButton
                    direction="prev"
                    label={`Previous ${productName} preview`}
                    onClick={goMobilePrev}
                  />
                  <div className="synergetic-trust-web-carousel-track">
                    <MobileScreenshotScrollStrip
                      slideCount={count}
                      slideIndex={mobileSlide}
                      onSlideChange={setMobileSlide}
                      onInteractStart={() => setCarouselInteracting(true)}
                      onInteractEnd={() => setCarouselInteracting(false)}
                      reduceMotion={reduceMotion}
                      productName={productName}
                      className="synergetic-mockup-motion--trust-web-inner h-full min-h-0"
                      renderSlide={renderMobileSlide}
                    />
                  </div>
                  <PhoneFanNavButton
                    direction="next"
                    label={`Next ${productName} preview`}
                    onClick={goMobileNext}
                  />
                </>
              ) : (
                <>
                  {count > 1 ? (
                    <>
                      <PhoneFanNavButton
                        direction="prev"
                        label={`Previous ${productName} preview`}
                        onClick={goMobilePrev}
                      />
                      <PhoneFanNavButton
                        direction="next"
                        label={`Next ${productName} preview`}
                        onClick={goMobileNext}
                      />
                    </>
                  ) : null}
                  <MobileScreenshotScrollStrip
                    slideCount={count}
                    slideIndex={mobileSlide}
                    onSlideChange={setMobileSlide}
                    onInteractStart={() => setCarouselInteracting(true)}
                    onInteractEnd={() => setCarouselInteracting(false)}
                    reduceMotion={reduceMotion}
                    productName={productName}
                    className="synergetic-mockup-motion--carousel relative z-[1] h-full w-full min-h-0"
                    renderSlide={renderMobileSlide}
                  />
                </>
              )}
            </div>
            <nav
              className="flex items-center justify-center gap-2.5 pt-2"
              aria-label={`${productName} preview steps`}
            >
              {slots.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Show ${productName} preview ${i + 1} of ${slots.length}`}
                  aria-current={i === mobileSlide ? 'true' : undefined}
                  className={`h-2.5 w-2.5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                    i === mobileSlide ? 'bg-[#d4af37]' : 'bg-white/30 hover:bg-white/45'
                  }`}
                  onClick={() => setMobileSlide(i)}
                />
              ))}
            </nav>
          </div>
        ) : layoutVariant === 'tablet' ? (
          <div
            className="flex w-full flex-col items-center"
            onMouseEnter={() => setCarouselHovered(true)}
            onMouseLeave={() => setCarouselHovered(false)}
          >
            <div
              className={`${tabletRowMinClass} synergetic-carousel-stage relative${pairCount > 1 ? ' synergetic-phone-gallery__pair' : ''}`}
            >
              {pairCount > 1 ? (
                <>
                  <PhoneFanNavButton
                    direction="prev"
                    label={`Previous ${productName} previews`}
                    onClick={goTabletPrev}
                  />
                  <PhoneFanNavButton
                    direction="next"
                    label={`Next ${productName} previews`}
                    onClick={goTabletNext}
                  />
                </>
              ) : null}
              <AnimatePresence mode="sync" initial={false}>
                <Motion.div
                  key={tabletPair}
                  className={`synergetic-mockup-motion synergetic-mockup-motion--carousel absolute inset-0 mx-auto flex w-fit max-w-full flex-row items-start justify-center px-1 ${hasRightTablet ? 'gap-[1cm]' : 'w-full'}`}
                  transformTemplate={mockupTransformTemplate}
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                  transition={SYN_CAROUSEL_TRANSITION}
                >
                  <FanPhoneSlot
                    slot={slots[leftTabletIdx]}
                    src={shots?.[leftTabletIdx]}
                    screenIndex={leftTabletIdx + 1}
                    inView={inView}
                    reduceMotion={reduceMotion}
                    variant="mobileSolo"
                    soloWidthRem={phoneTabletPair}
                    frameKind={frameKind}
                    uniformScreens={uniformScreens}
                  />
                  {hasRightTablet ? (
                    <FanPhoneSlot
                      slot={slots[rightTabletIdx]}
                      src={shots?.[rightTabletIdx]}
                      screenIndex={rightTabletIdx + 1}
                      inView={inView}
                      reduceMotion={reduceMotion}
                      variant="mobileSolo"
                      soloWidthRem={phoneTabletPair}
                      frameKind={frameKind}
                      uniformScreens={uniformScreens}
                    />
                  ) : null}
                </Motion.div>
              </AnimatePresence>
            </div>
            <nav
              className="flex items-center justify-center gap-2.5 pt-2"
              aria-label={`${productName} preview pairs`}
            >
              {Array.from({ length: pairCount }, (_, pairIdx) => (
                <button
                  key={pairIdx}
                  type="button"
                  aria-label={`Show ${productName} previews ${pairIdx * 2 + 1}${pairIdx * 2 + 2 <= count ? `–${pairIdx * 2 + 2}` : ''} of ${slots.length}`}
                  aria-current={pairIdx === tabletPair ? 'true' : undefined}
                  className={`h-2.5 w-2.5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                    pairIdx === tabletPair ? 'bg-[#d4af37]' : 'bg-white/30 hover:bg-white/45'
                  }`}
                  onClick={() => setTabletPair(pairIdx)}
                />
              ))}
            </nav>
          </div>
        ) : (
          slots.map((slot, i) => (
            <FanPhoneSlot
              key={i}
              slot={slot}
              src={shots?.[i]}
              screenIndex={i + 1}
              inView={inView}
              reduceMotion={reduceMotion}
              variant="desktop"
              frameKind={frameKind}
              uniformScreens={uniformScreens}
            />
          ))
        )}
      </div>
    </div>
  )
}

function FanPhoneSlot({ slot, src, screenIndex, inView, reduceMotion, variant, soloWidthRem, frameKind = 'phone', uniformScreens = false }) {
  const [pointerOver, setPointerOver] = useState(false)
  const { floatPx, duration, delay, hoverDeltaDeg, alt, desktop } = slot
  const isDesktop = variant === 'desktop'
  const isWebFrame = frameKind === 'web'
  const shouldFloat = inView && !reduceMotion && !isDesktop && !isWebFrame
  const soloFloat = Math.min(floatPx, 6)
  const shotLayout = isWebFrame ? 'web' : isDesktop ? 'desktop' : 'solo'
  const shotWidthRem = isDesktop ? desktop?.widthRem : soloWidthRem
  const shotAttrs = src
    ? getPhoneScreenshotAttrs(src, {
        widthRem: shotWidthRem ?? (isWebFrame ? 22.5 : 12),
        layout: shotLayout,
      })
    : null

  const phoneScreenClass = uniformScreens
    ? 'synergetic-phone-screen-viewport synergetic-phone-screen-viewport--trust overflow-hidden rounded-2xl border border-black/25 bg-[#FFFFFF] min-[900px]:rounded-[1.15rem]'
    : 'relative w-full overflow-hidden rounded-2xl border border-black/25 bg-[#FFFFFF] min-[900px]:rounded-[1.15rem]'

  const screenContent = shotAttrs ? (
    <img
      {...shotAttrs}
      alt={alt}
      draggable={variant === 'mobileSolo' ? false : undefined}
      className={
        isWebFrame
          ? 'synergetic-web-shot'
          : uniformScreens
            ? 'synergetic-phone-shot synergetic-phone-shot--trust'
            : 'synergetic-phone-shot block h-auto w-full max-w-full align-top'
      }
      fetchPriority={isDesktop || variant === 'mobileSolo' || screenIndex <= 2 ? 'high' : 'low'}
      loading={isDesktop || variant === 'mobileSolo' || screenIndex <= 1 ? 'eager' : 'lazy'}
    />
  ) : (
    <div
      className={`flex w-full items-center justify-center bg-[#FFFFFF] text-[0.55rem] font-medium uppercase tracking-widest text-zinc-300 ${
        isWebFrame ? 'aspect-[1024/440]' : uniformScreens ? 'absolute inset-0' : 'aspect-[9/19.5]'
      }`}
      aria-hidden
    >
      {`Screen ${screenIndex}`}
    </div>
  )

  const phoneInner = isWebFrame ? (
    <div className="synergetic-web-frame overflow-hidden rounded-xl border border-white/20 bg-zinc-950 p-0.5 shadow-[0_12px_32px_rgba(0,0,0,0.45)] min-[900px]:rounded-2xl min-[900px]:p-1">
      <div className="relative w-full overflow-hidden rounded-lg border border-black/20 bg-white min-[900px]:rounded-xl">
        {screenContent}
      </div>
    </div>
  ) : (
    <>
      <div
        className={`synergetic-phone-frame rounded-[1.25rem] border-2 border-white bg-zinc-950 p-[3px] min-[900px]:rounded-3xl min-[900px]:p-1${uniformScreens ? ' synergetic-phone-frame--trust' : ''}`}
      >
        <div className={phoneScreenClass}>{screenContent}</div>
      </div>
    </>
  )

  if (variant === 'mobileSolo') {
    const w = soloWidthRem ?? 8.05
    return (
      <div
        className={`pointer-events-auto relative mx-auto w-full max-w-full${isWebFrame ? ' synergetic-web-slot--solo' : ''}`}
        style={isWebFrame ? undefined : { width: `${w}rem` }}
      >
        <Motion.div
          className="synergetic-mockup-float relative"
          transformTemplate={mockupTransformTemplate}
          animate={shouldFloat && !reduceMotion ? { y: [0, -soloFloat, 0] } : { y: 0 }}
          transition={
            shouldFloat && !reduceMotion
              ? SYN_FLOAT_TRANSITION(duration, delay)
              : { duration: 0.35, ease: SYN_MOTION_EASE }
          }
        >
          {phoneInner}
        </Motion.div>
      </div>
    )
  }

  const pos = desktop
  const rotate = pos.fanRotate + (pointerOver ? hoverDeltaDeg : 0)
  const stackZ = pointerOver ? 100 : pos.z

  return (
    <Motion.div
      className={`synergetic-phone-slot pointer-events-auto absolute${isWebFrame ? ' synergetic-web-slot--desktop' : ''}${uniformScreens ? ' synergetic-phone-slot--trust' : ''}${pointerOver ? ' synergetic-phone-slot--active' : ''}`}
      style={{
        left: `${pos.leftPct}%`,
        top: `${pos.topPct}%`,
        zIndex: stackZ,
        ...(isWebFrame ? {} : { width: `${pos.widthRem}rem` }),
        transformOrigin: '50% 85%',
      }}
      initial={false}
      animate={{
        x: '-50%',
        rotate,
      }}
      transition={reduceMotion ? { duration: 0 } : SYN_FAN_ROTATE_TRANSITION}
      transformTemplate={mockupTransformTemplate}
      onMouseEnter={() => setPointerOver(true)}
      onMouseLeave={() => setPointerOver(false)}
    >
      {phoneInner}
    </Motion.div>
  )
}

function LogoFrame({ logo, logoText, name, transparentFrame, transparentTall }) {
  return (
    <div
      className={`synergetic-logo-frame mx-auto min-[900px]:mx-0${transparentFrame ? ' synergetic-logo-frame--transparent' : ''}${transparentFrame && transparentTall ? ' synergetic-logo-frame--transparent-tall' : ''}`}
    >
      <span className="synergetic-logo-frame__corner-tl" />
      <span className="synergetic-logo-frame__corner-br" />
      {logo ? (
        <img src={logo} alt={`${name} logo`} className="synergetic-logo-frame__img" />
      ) : logoText ? (
        <div className="synergetic-logo-text">
          <div className="synergetic-logo-text__mark">{logoText.mark}</div>
          <div className="synergetic-logo-text__sub">{logoText.sub}</div>
        </div>
      ) : (
        <span className="sr-only">{name}</span>
      )}
    </div>
  )
}

function ProductCard({ product, index, total, slideVisible }) {
  const delayMs = 80 + index * 70
  const epiTrustSets =
    product.id === 'epi-trust' &&
    product.screenshotSets?.phone?.length &&
    product.screenshotSets?.web?.length
      ? product.screenshotSets
      : null
  const galleryShots =
    (product.id === 'epi-minded' || product.id === 'epi-well') &&
    Array.isArray(product.screenshots) &&
    product.screenshots.length
      ? product.screenshots
      : null
  const [trustPreview, setTrustPreview] = useState('phone')
  const hasGallery = Boolean(galleryShots || epiTrustSets)
  const stackedTextOnlyLayout = !hasGallery && STACKED_TEXT_ONLY_PRODUCT_IDS.has(product.id)
  const activeGalleryShots = epiTrustSets
    ? trustPreview === 'phone'
      ? epiTrustSets.phone
      : epiTrustSets.web
    : galleryShots
  const galleryFrameKind = epiTrustSets ? trustPreview : 'phone'

  const hideTitleRow =
    product.id === 'epi-minded' ||
    product.id === 'epi-well' ||
    product.id === 'epi-trust' ||
    product.id === 'epi-legalet' ||
    product.id === 'epi-crypt' ||
    product.id === 'epi-quantum' ||
    product.id === 'renaissance-now'
  const galleryCompact =
    product.id === 'epi-well' ||
    product.id === 'epi-minded' ||
    Boolean(epiTrustSets) ||
    stackedTextOnlyLayout
  const isEpiWellCard = product.id === 'epi-well'
  const isStackedCenteredCard =
    isEpiWellCard || product.id === 'epi-minded' || Boolean(epiTrustSets)

  const textColumn = (
    <>
      {hideTitleRow ? (
        <h4 className="sr-only">{product.name}</h4>
      ) : (
        <>
          <h4 className="synergetic-card-title">
            {product.name}
          </h4>
          <div className="synergetic-title-underline mx-auto min-[900px]:mx-0" />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 min-[900px]:justify-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,55,0.25)] bg-[rgba(212,175,55,0.08)] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#e8c95a]">
              <span className="synergetic-pulse-dot" />
              Suite
            </span>
            <span
              className="text-sm italic text-[#a8a39a]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              N° {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
          </div>
        </>
      )}
      <p className={`synergetic-card-description${hideTitleRow ? '' : ' synergetic-card-description--offset'}`}>
        {product.description}
      </p>
      <div className="synergetic-card-cta-wrap">
        <a
          href={product.ctaHref ?? '#CTA'}
          {...(product.ctaHref?.startsWith('http')
            ? { target: '_blank', rel: 'noopener noreferrer' }
            : {})}
          className="synergetic-cta synergetic-card-cta group inline-flex max-w-full items-center font-semibold uppercase text-[#f5f1e8] transition-colors hover:text-[#d4af37]"
        >
          {product.ctaLabel}
          <span className="synergetic-cta-arrow" />
        </a>
      </div>
    </>
  )

  return (
    <div
      id={product.id}
      {...(product.id === 'epi-well'
        ? { 'data-card': 'epi-well' }
        : product.id === 'epi-minded'
          ? { 'data-card': 'epi-minded' }
          : {})}
      className={`synergetic-card rounded-2xl md:rounded-3xl syn-animate-in scroll-mt-28${galleryCompact ? ' synergetic-card--compact' : ''}${
        stackedTextOnlyLayout ? ' synergetic-card--stacked-text-only' : ''
      } ${
        hasGallery
          ? galleryCompact
            ? 'p-3 min-[900px]:p-4'
            : 'p-3.5 min-[900px]:p-5'
          : galleryCompact
            ? 'p-3 min-[900px]:p-4'
            : 'p-5 min-[900px]:p-8'
      }`}
      style={{
        animationPlayState: slideVisible ? 'running' : 'paused',
        animationDelay: slideVisible ? `${delayMs}ms` : '0ms',
      }}
    >
      <div
        className={
          hasGallery
            ? isStackedCenteredCard
              ? 'flex flex-col items-center gap-[2cm] text-center'
              : galleryCompact
              ? 'flex flex-col gap-[2cm] min-[900px]:flex-row min-[900px]:items-stretch min-[900px]:gap-[2cm]'
              : 'flex flex-col gap-3 min-[900px]:flex-row min-[900px]:items-stretch min-[900px]:gap-5 min-[1280px]:gap-[1cm]'
            : stackedTextOnlyLayout
              ? 'flex flex-col items-center gap-[2cm] text-center'
              : 'flex flex-col gap-6 min-[900px]:flex-row min-[900px]:items-stretch min-[900px]:gap-10'
        }
      >
        {hasGallery ? (
          <>
            <div
              className={`synergetic-card-text-column flex min-w-0 w-full flex-col items-center ${
                isStackedCenteredCard
                  ? 'max-w-full gap-2.5'
                  : `flex-1 min-[900px]:shrink-0 min-[900px]:grow-0 min-[900px]:basis-auto min-[900px]:items-start ${
                      galleryCompact
                        ? 'gap-2.5 min-[900px]:max-w-[21rem] min-[900px]:gap-2.5'
                        : 'gap-3 min-[900px]:max-w-[24rem] min-[900px]:gap-3'
                    }`
              }`}
            >
              <LogoFrame
                logo={product.logo}
                logoText={product.logoText}
                name={product.name}
                transparentFrame
                transparentTall={false}
              />
              <div className="synergetic-card-text">{textColumn}</div>
            </div>
            <div
              className={`synergetic-card-gallery-column flex min-w-0 w-full max-w-full flex-col items-center ${
                isStackedCenteredCard
                  ? 'gap-2'
                  : 'min-[900px]:flex-1 min-[900px]:max-w-none min-[900px]:items-end gap-2'
              }`}
            >
              {epiTrustSets ? (
                <EpiTrustPreviewToggle value={trustPreview} onChange={setTrustPreview} />
              ) : null}
              <ProductPhoneFanStack
                key={epiTrustSets ? trustPreview : product.id}
                shots={activeGalleryShots}
                productName={product.name}
                productId={product.id}
                compact={galleryCompact}
                frameKind={galleryFrameKind}
                uniformScreens={Boolean(epiTrustSets && trustPreview === 'phone')}
              />
            </div>
          </>
        ) : stackedTextOnlyLayout ? (
          <>
            <div className="synergetic-card-text-column flex min-w-0 w-full max-w-full flex-col items-center gap-2.5">
              <LogoFrame
                logo={product.logo}
                logoText={product.logoText}
                name={product.name}
                transparentFrame={[
                  'epi-trust',
                  'epi-legalet',
                  'epi-well',
                  'epi-crypt',
                  'epi-quantum',
                  'epi-minded',
                  'renaissance-now',
                ].includes(product.id)}
                transparentTall={product.id === 'renaissance-now'}
              />
              <div className="synergetic-card-text">{textColumn}</div>
            </div>
          </>
        ) : (
          <>
            <LogoFrame
              logo={product.logo}
              logoText={product.logoText}
              name={product.name}
              transparentFrame={[
                'epi-trust',
                'epi-legalet',
                'epi-well',
                'epi-crypt',
                'epi-quantum',
                'epi-minded',
                'renaissance-now',
              ].includes(product.id)}
              transparentTall={product.id === 'renaissance-now'}
            />
            <div className="synergetic-card-text">{textColumn}</div>
          </>
        )}
      </div>
    </div>
  )
}

function DotIndicators({ count, activeIndex }) {
  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`synergetic-dot ${i === activeIndex ? 'synergetic-dot--active' : 'synergetic-dot--inactive'}`}
          aria-hidden
        />
      ))}
    </div>
  )
}

/** Biotech only: no carousel / autoplay; three-tab shell + same transitions as other tabbed categories. */
function BiotechTabbedPanel({ products, isActive }) {
  const reduceMotion = useReducedMotion()
  const well = products.find((p) => p.id === 'epi-well')
  const legalet = products.find((p) => p.id === 'epi-legalet')
  const trust = products.find((p) => p.id === 'epi-trust')
  const [active, setActive] = useState('well')
  const contentRef = useRef(null)

  const tabMap = {
    well: { product: well, index: 1 },
    legalet: { product: legalet, index: 0 },
    trust: { product: trust, index: 2 },
  }

  if (!well || !legalet || !trust) {
    return <CategoryCarousel products={products} isActive={isActive} />
  }

  const { product: current, index } = tabMap[active]

  const transition = {
    duration: reduceMotion ? 0.12 : 0.38,
    ease: [0.22, 1, 0.36, 1],
  }

  const handleTab = (key) => {
    setActive(key)
    requestAnimationFrame(() => {
      if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
        contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    })
  }

  const tabBtn = (key, label) => (
    <button
      type="button"
      role="tab"
      aria-selected={active === key}
      aria-controls="biotech-tab-panel"
      id={`biotech-tab-${key}`}
      className={`synergetic-tabbed-tab ${active === key ? 'synergetic-tabbed-tab--active' : ''}`}
      onClick={() => handleTab(key)}
    >
      {label}
    </button>
  )

  return (
    <div className="synergetic-tabbed-shell">
      <div className="synergetic-tabbed-tabs" role="tablist" aria-label="Biotech and longevity solutions">
        {tabBtn('well', 'Epi Well')}
        {tabBtn('legalet', 'EPI LeGallet')}
        {tabBtn('trust', 'Epi Trust')}
      </div>

      <div
        ref={contentRef}
        id="biotech-tab-panel"
        className="relative z-[1]"
        role="tabpanel"
        aria-labelledby={`biotech-tab-${active}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <Motion.div
            key={active}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? false : { opacity: 0, y: -10 }}
            transition={transition}
          >
            <ProductCard product={current} index={index} total={products.length} slideVisible={isActive} />
          </Motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/** EdTech only: no carousel / autoplay; tabbed premium shell with unchanged product copy. */
function EdTechTabbedPanel({ products, isActive }) {
  const reduceMotion = useReducedMotion()
  const epiminded = products.find((p) => p.id === 'epi-minded')
  const renaissance = products.find((p) => p.id === 'renaissance-now')
  const [active, setActive] = useState('epiminded')
  const contentRef = useRef(null)

  const current = active === 'epiminded' ? epiminded : renaissance
  const index = active === 'epiminded' ? 1 : 0

  if (!epiminded || !renaissance) {
    return <CategoryCarousel products={products} isActive={isActive} />
  }

  const transition = {
    duration: reduceMotion ? 0.12 : 0.38,
    ease: [0.22, 1, 0.36, 1],
  }

  const handleTab = (key) => {
    setActive(key)
    requestAnimationFrame(() => {
      if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
        contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    })
  }

  return (
    <div className="synergetic-tabbed-shell">
      <div
        className="synergetic-tabbed-tabs"
        role="tablist"
        aria-label="EdTech solutions"
      >
        <button
          type="button"
          role="tab"
          aria-selected={active === 'epiminded'}
          aria-controls="edtech-tab-panel"
          id="edtech-tab-epiminded"
          className={`synergetic-tabbed-tab ${active === 'epiminded' ? 'synergetic-tabbed-tab--active' : ''}`}
          onClick={() => handleTab('epiminded')}
        >
          Epiminded
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={active === 'renaissance'}
          aria-controls="edtech-tab-panel"
          id="edtech-tab-renaissance"
          className={`synergetic-tabbed-tab ${active === 'renaissance' ? 'synergetic-tabbed-tab--active' : ''}`}
          onClick={() => handleTab('renaissance')}
        >
          Renaissance Now
        </button>
      </div>

      <div ref={contentRef} id="edtech-tab-panel" className="relative z-[1]" role="tabpanel" aria-labelledby={active === 'epiminded' ? 'edtech-tab-epiminded' : 'edtech-tab-renaissance'}>
        <AnimatePresence mode="wait" initial={false}>
          <Motion.div
            key={active}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? false : { opacity: 0, y: -10 }}
            transition={transition}
          >
            <ProductCard product={current} index={index} total={products.length} slideVisible={isActive} />
          </Motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/** Cybersecurity only: no carousel / autoplay; same tabbed shell + transitions as EdTech. */
function CybersecurityTabbedPanel({ products, isActive }) {
  const reduceMotion = useReducedMotion()
  const quantum = products.find((p) => p.id === 'epi-quantum')
  const crypt = products.find((p) => p.id === 'epi-crypt')
  const [active, setActive] = useState('quantum')
  const contentRef = useRef(null)

  const current = active === 'quantum' ? quantum : crypt
  const index = active === 'quantum' ? 1 : 0

  if (!quantum || !crypt) {
    return <CategoryCarousel products={products} isActive={isActive} />
  }

  const transition = {
    duration: reduceMotion ? 0.12 : 0.38,
    ease: [0.22, 1, 0.36, 1],
  }

  const handleTab = (key) => {
    setActive(key)
    requestAnimationFrame(() => {
      if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
        contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    })
  }

  return (
    <div className="synergetic-tabbed-shell">
      <div className="synergetic-tabbed-tabs" role="tablist" aria-label="Cybersecurity solutions">
        <button
          type="button"
          role="tab"
          aria-selected={active === 'quantum'}
          aria-controls="cyber-tab-panel"
          id="cyber-tab-quantum"
          className={`synergetic-tabbed-tab ${active === 'quantum' ? 'synergetic-tabbed-tab--active' : ''}`}
          onClick={() => handleTab('quantum')}
        >
          EPIquantum
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={active === 'crypt'}
          aria-controls="cyber-tab-panel"
          id="cyber-tab-crypt"
          className={`synergetic-tabbed-tab ${active === 'crypt' ? 'synergetic-tabbed-tab--active' : ''}`}
          onClick={() => handleTab('crypt')}
        >
          EPI Crypt
        </button>
      </div>

      <div
        ref={contentRef}
        id="cyber-tab-panel"
        className="relative z-[1]"
        role="tabpanel"
        aria-labelledby={active === 'quantum' ? 'cyber-tab-quantum' : 'cyber-tab-crypt'}
      >
        <AnimatePresence mode="wait" initial={false}>
          <Motion.div
            key={active}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? false : { opacity: 0, y: -10 }}
            transition={transition}
          >
            <ProductCard product={current} index={index} total={products.length} slideVisible={isActive} />
          </Motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function CategoryCarousel({ products, isActive }) {
  const [api, setApi] = useState()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!api) return
    const onSelect = () => setIndex(api.selectedScrollSnap())
    api.on('select', onSelect)
    onSelect()
    return () => api.off('select', onSelect)
  }, [api])

  const progress = products.length ? ((index + 1) / products.length) * 100 : 0

  return (
    <div>
      <Carousel
        opts={{ align: 'center', loop: true, containScroll: false }}
        setApi={setApi}
        plugins={
          isActive
            ? [
                Autoplay({
                  delay: 4000,
                }),
              ]
            : []
        }
        className="relative w-full"
      >
        <div
          className="relative"
          style={{
            maskImage: 'linear-gradient(to right, rgba(0,0,0,0) 0%, black 8%, black 92%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, rgba(0,0,0,0) 0%, black 8%, black 92%, rgba(0,0,0,0) 100%)',
          }}
        >
          <CarouselContent className="synergetic-embla-slide py-8 pl-0 md:gap-5 md:py-10">
            {products.map((product, idx) => (
              <CarouselItem key={product.id} className="basis-[90%] pl-0 sm:basis-[84%] md:basis-[88%] lg:basis-[86%]">
                <ProductCard product={product} index={idx} total={products.length} slideVisible={isActive} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>

        <div className="synergetic-carousel-controls relative z-20 mx-auto flex w-full max-w-lg shrink-0 justify-center gap-6 py-2 min-[900px]:contents min-[900px]:p-0">
          <CarouselPrevious className="static size-10 shrink-0 translate-y-0 border border-[rgba(212,175,55,0.35)] bg-[#0d0d11]/90 text-[#e8c95a] shadow-lg backdrop-blur-sm hover:bg-[#111114] hover:text-[#d4af37] min-[900px]:absolute min-[900px]:top-1/2 min-[900px]:left-2 min-[900px]:right-auto min-[900px]:size-11 min-[900px]:-translate-y-1/2" />
          <CarouselNext className="static size-10 shrink-0 translate-y-0 border border-[rgba(212,175,55,0.35)] bg-[#0d0d11]/90 text-[#e8c95a] shadow-lg backdrop-blur-sm hover:bg-[#111114] hover:text-[#d4af37] min-[900px]:absolute min-[900px]:top-1/2 min-[900px]:right-2 min-[900px]:left-auto min-[900px]:size-11 min-[900px]:-translate-y-1/2" />
        </div>

        <div className="mx-auto mt-6 hidden max-w-md px-4 min-[600px]:block">
          <div className="synergetic-progress">
            <div className="synergetic-progress__fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="mt-4 hidden items-center justify-center min-[600px]:mt-5 min-[600px]:flex">
          <span className="text-xs tabular-nums text-[#a8a39a]">
            {String(index + 1).padStart(2, '0')} / {String(products.length).padStart(2, '0')}
          </span>
        </div>

        <DotIndicators count={products.length} activeIndex={index} />
      </Carousel>
    </div>
  )
}

function CategoryHeader({ name, tagline, slug }) {
  const Icon = CATEGORY_ICONS[slug] || Brain
  return (
    <div className="synergetic-category-header mb-8 flex min-w-0 items-start gap-4 min-[900px]:mb-10 min-[900px]:items-end min-[900px]:gap-5">
      <div className="synergetic-icon-ring shrink-0">
        <Icon className="h-6 w-6 text-[#07070a]" strokeWidth={1.35} />
      </div>
      <div className="min-w-0 flex-1 pb-0 text-left min-[900px]:pb-1">
          <h3
            className="text-2xl font-semibold tracking-tight text-[#f5f1e8] sm:text-3xl lg:text-4xl"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {name}
          </h3>
          <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-[#a8a39a] min-[900px]:text-base">
            {tagline}
          </p>
      </div>
    </div>
  )
}

function CategoryBlock({ category, animateVisible, delayClass, blockRef }) {
  const [inView, setInView] = useState(false)
  const localRef = useRef(null)
  const ref = blockRef || localRef

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { threshold: 0.35, rootMargin: '-40px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref])

  return (
    <div ref={ref} className={`mb-16 last:mb-0 scroll-animate lg:mb-20 ${delayClass} ${animateVisible ? 'visible' : ''}`}>
      <CategoryHeader name={category.name} tagline={category.tagline} slug={category.slug} />
      {category.slug === 'biotech' ? (
        <BiotechTabbedPanel products={category.products} isActive={inView} />
      ) : category.slug === 'edtech' ? (
        <EdTechTabbedPanel products={category.products} isActive={inView} />
      ) : category.slug === 'cybersecurity' ? (
        <CybersecurityTabbedPanel products={category.products} isActive={inView} />
      ) : (
        <CategoryCarousel products={category.products} isActive={inView} />
      )}
    </div>
  )
}

function SectionHeader({ animateVisible }) {
  return (
    <div
      className={`mb-12 text-left lg:mb-16 scroll-animate scroll-animate-delay-1 ${animateVisible ? 'visible' : ''}`}
    >
      <h2 className="epineon-h2 epineon-section-title mb-4 uppercase text-slate-900 lg:mb-6">
        Our Synergetic Solutions
      </h2>
      <div className="mt-4 w-full max-w-full overflow-x-auto sm:mt-5">
        <p className="epineon-body-large inline-block min-w-0 whitespace-nowrap text-left text-sm leading-relaxed text-[#a8a39a] sm:text-base lg:text-lg">
          Specialized solutions across three key domains: Biotech &amp; Longevity, Cybersecurity &amp; Privacy, and EdTech
        </p>
      </div>
    </div>
  )
}

/**
 * Redesigned "Our Synergetic Solutions" — same Embla carousels, same product copy (7 cards).
 */
export default function SynergeticSolutions({ animateVisible }) {
  const biotechRef = useRef(null)
  const cyberRef = useRef(null)
  const edtechRef = useRef(null)

  const [biotech, cyber, edtech] = synergeticCategories

  return (
    <div className="synergetic-solutions synergetic-solutions--surface relative min-w-0 overflow-x-clip -mx-[max(0px,calc(50vw-50%))] px-[max(0px,calc(50vw-50%))] py-16 sm:py-20 lg:py-24">
      <div className="synergetic-solutions__noise" aria-hidden />
      <div className="synergetic-solutions__inner site-content">
        <SectionHeader animateVisible={animateVisible} />
        <CategoryBlock
          category={biotech}
          animateVisible={animateVisible}
          delayClass="scroll-animate-delay-2"
          blockRef={biotechRef}
        />
        <CategoryBlock
          category={cyber}
          animateVisible={animateVisible}
          delayClass="scroll-animate-delay-3"
          blockRef={cyberRef}
        />
        <CategoryBlock
          category={edtech}
          animateVisible={animateVisible}
          delayClass="scroll-animate-delay-4"
          blockRef={edtechRef}
        />
      </div>
    </div>
  )
}
