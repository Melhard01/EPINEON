import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getPhoneScreenshotAttrs } from '../lib/phoneScreenshot.js'

/**
 * Swipeable screenshot carousel (Embla) — restores the v1 carousel behavior.
 * `kind` = 'phone' (tall portrait) | 'web' (wide landscape).
 */
export function ScreenshotCarousel({ shots, kind = 'phone', label }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', containScroll: 'trimSnaps', loop: false })
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
    if (!emblaApi) return
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
  }, [emblaApi, onSelect])

  if (!shots || shots.length === 0) return null

  return (
    <div className="ss-carousel">
      {label ? <p className="shot-group-label">{label}</p> : null}
      <div className="ss-carousel__viewport" ref={emblaRef}>
        <div className="ss-carousel__container">
          {shots.map((shot, i) => {
            const attrs = getPhoneScreenshotAttrs(shot, {
              layout: kind === 'web' ? 'web' : undefined,
              widthRem: kind === 'web' ? 26 : 11,
            })
            return (
              <div className={`ss-slide ss-slide--${kind}`} key={i}>
                <img
                  {...attrs}
                  alt={label ? `${label} — screen ${i + 1}` : `Product screen ${i + 1}`}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className={`product-shot product-shot--${kind}`}
                />
              </div>
            )
          })}
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
