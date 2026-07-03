import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const TRANSITION_MS = 400

/**
 * Industry “Where it gets hard” — title card (left) + switchable challenge copy (right).
 */
export function IndustryChallengesSplit({ challenges }) {
  const items = challenges?.filter(Boolean) ?? []
  const [index, setIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const animTimerRef = useRef(null)
  const count = items.length

  const goTo = useCallback(
    (nextIndex) => {
      if (count === 0 || nextIndex === index || nextIndex < 0 || nextIndex >= count) return
      if (isAnimating) return
      setIsAnimating(true)
      setIndex(nextIndex)
      if (animTimerRef.current) clearTimeout(animTimerRef.current)
      animTimerRef.current = setTimeout(() => {
        setIsAnimating(false)
        animTimerRef.current = null
      }, TRANSITION_MS)
    },
    [count, index, isAnimating],
  )

  useEffect(
    () => () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current)
    },
    [],
  )

  const goPrev = useCallback(() => goTo(index - 1), [goTo, index])
  const goNext = useCallback(() => goTo(index + 1), [goTo, index])

  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, count - 1)))
  }, [count])

  useEffect(() => {
    if (count <= 1) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [count, goPrev, goNext])

  if (count === 0) return null

  const canPrev = index > 0
  const canNext = index < count - 1
  const navDisabled = isAnimating

  return (
    <div
      className="industry-challenges-split"
      role="region"
      aria-label="Where it gets hard"
    >
      <div className="industry-challenges-split__title-card scroll-animate-slide-left epineon-card">
        <h2 className="industry-challenges-split__heading epineon-h2 epineon-section-title text-slate-900">
          Where it gets hard
        </h2>
      </div>

      <div
        className="industry-challenges-split__content-card scroll-animate-slide-right scroll-animate-delay-1 epineon-card"
        role="group"
        aria-roledescription="carousel"
        aria-label="Industry challenges"
      >
        {count > 1 ? (
          <div className="industry-challenges-split__nav">
            <span className="industry-challenges-split__counter" aria-live="polite">
              <span className="sr-only">Challenge </span>
              {index + 1}
              <span aria-hidden> / </span>
              <span className="sr-only"> of </span>
              {count}
            </span>
            <div className="industry-challenges-split__arrows">
              <button
                type="button"
                className="ss-arrow industry-challenges-split__arrow"
                onClick={goPrev}
                disabled={!canPrev || navDisabled}
                aria-label="Previous challenge"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                className="ss-arrow industry-challenges-split__arrow"
                onClick={goNext}
                disabled={!canNext || navDisabled}
                aria-label="Next challenge"
              >
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        ) : null}

        <div className="industry-challenges-split__stage">
          {items.map((text, i) => (
            <div
              key={i}
              className={`industry-challenges-split__slide${i === index ? ' is-active' : ''}`}
              role="tabpanel"
              aria-hidden={i !== index}
              {...(i !== index ? { inert: true } : {})}
            >
              <span className="challenge-card-num industry-challenges-split__num">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="challenge-card-text industry-challenges-split__text">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
