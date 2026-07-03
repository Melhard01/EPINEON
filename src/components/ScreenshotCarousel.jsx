import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getPhoneScreenshotAttrs } from '../lib/phoneScreenshot.js'

const DESKTOP_GALLERY_MIN = 1024

function useMinWidth(px) {
  const [matches, setMatches] = useState(
    () => (typeof window !== 'undefined' ? window.matchMedia(`(min-width: ${px}px)`).matches : false),
  )

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${px}px)`)
    const onChange = () => setMatches(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [px])

  return matches
}

function CarouselSlide({ shot, index, kind, label, framed }) {
  const attrs = getPhoneScreenshotAttrs(shot, {
    layout: kind === 'web' ? 'web' : framed ? 'solo' : undefined,
    widthRem: kind === 'web' ? 26 : 11,
  })
  const alt = label ? `${label} — screen ${index + 1}` : `Product screen ${index + 1}`

  if (framed && kind === 'phone') {
    return (
      <div className="ss-slide ss-slide--phone ss-slide--framed">
        <div className="product-phone-fan__frame">
          <div className="product-phone-fan__screen">
            <img
              {...attrs}
              alt={alt}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className="product-phone-fan__shot"
            />
          </div>
        </div>
      </div>
    )
  }

  if (kind === 'web') {
    return (
      <div className="ss-slide ss-slide--web">
        <div className="product-web-frame">
          <div className="product-web-frame__screen">
            <img
              {...attrs}
              alt={alt}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className="product-web-shot"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`ss-slide ss-slide--${kind}`}>
      <img
        {...attrs}
        alt={alt}
        loading={index === 0 ? 'eager' : 'lazy'}
        decoding="async"
        className={`product-shot product-shot--${kind}`}
      />
    </div>
  )
}

/**
 * Swipeable screenshot carousel (Embla) on mobile; all screenshots visible on large screens.
 * `kind` = 'phone' (tall portrait) | 'web' (wide landscape).
 */
export function ScreenshotCarousel({
  shots,
  kind = 'phone',
  label,
  centered = false,
  expandOnDesktop = true,
  framed = false,
}) {
  const isDesktopGallery = useMinWidth(DESKTOP_GALLERY_MIN) && expandOnDesktop && kind !== 'web'

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: centered ? 'center' : 'start',
    containScroll: 'trimSnaps',
    loop: false,
  })
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)
  const [selected, setSelected] = useState(0)
  const [snaps, setSnaps] = useState([])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanPrev(emblaApi.canScrollPrev())
    setCanNext(emblaApi.canScrollNext())
    setSelected(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi || isDesktopGallery) return
    const refresh = () => {
      setSnaps(emblaApi.scrollSnapList())
      onSelect()
    }
    refresh()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', refresh)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', refresh)
    }
  }, [emblaApi, onSelect, isDesktopGallery])

  if (!shots || shots.length === 0) return null

  const carouselClass = `ss-carousel ss-carousel--${kind}${isDesktopGallery ? ' ss-carousel--gallery' : ' ss-carousel--mobile'}${framed ? ' ss-carousel--framed' : ''}`

  if (isDesktopGallery) {
    return (
      <div className={carouselClass}>
        {label ? <p className="shot-group-label">{label}</p> : null}
        <div className="ss-carousel__gallery">
          {shots.map((shot, i) => (
            <CarouselSlide key={i} shot={shot} index={i} kind={kind} label={label} framed={framed} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={carouselClass}>
      {label ? <p className="shot-group-label">{label}</p> : null}
      <div className="ss-carousel__viewport" ref={emblaRef}>
        <div className="ss-carousel__container">
          {shots.map((shot, i) => (
            <CarouselSlide key={i} shot={shot} index={i} kind={kind} label={label} framed={framed} />
          ))}
        </div>
      </div>

      {snaps.length > 1 ? (
        <div className="ss-carousel__controls">
          <button type="button" className="ss-arrow" onClick={() => emblaApi?.scrollPrev()} disabled={!canPrev} aria-label="Previous screenshot">
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <div className="ss-dots">
            {snaps.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`ss-dot${i === selected ? ' is-active' : ''}`}
                onClick={() => emblaApi?.scrollTo(i)}
                aria-label={`Go to screenshot ${i + 1}`}
              />
            ))}
          </div>
          <button type="button" className="ss-arrow" onClick={() => emblaApi?.scrollNext()} disabled={!canNext} aria-label="Next screenshot">
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  )
}
