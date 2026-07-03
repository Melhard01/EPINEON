import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const TRANSITION_MS = 520

/**
 * Single visible product card with prev/next controls (/products — Enterprise AI, Health & Wellness).
 */
export function ProductCarousel({ products, renderCard, ariaLabel = 'Products' }) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)
  const animTimerRef = useRef(null)
  const count = products.length
  const active = products[index]

  const goTo = useCallback(
    (nextIndex) => {
      if (nextIndex === index || nextIndex < 0 || nextIndex >= count) return
      if (isAnimating) return

      setDirection(nextIndex > index ? 1 : -1)
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

  const goPrev = useCallback(() => {
    goTo(index - 1)
  }, [goTo, index])

  const goNext = useCallback(() => {
    goTo(index + 1)
  }, [goTo, index])

  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, count - 1)))
  }, [count])

  useEffect(
    () => () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current)
    },
    [],
  )

  useEffect(() => {
    if (count <= 1) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goPrev()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        goNext()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [count, goPrev, goNext])

  if (!active) return null

  const canPrev = index > 0
  const canNext = index < count - 1
  const navDisabled = isAnimating

  return (
    <div
      className="product-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      data-direction={direction > 0 ? 'next' : 'prev'}
    >
      <div className="product-carousel__stage">
        {products.map((product, i) => (
          <div
            key={product.id}
            id={`product-carousel-slide-${product.id}`}
            className={`product-carousel__slide${i === index ? ' is-active' : ''}`}
            role="tabpanel"
            aria-hidden={i !== index}
            {...(i !== index ? { inert: true } : {})}
          >
            {renderCard(product)}
          </div>
        ))}
      </div>

      {count > 1 ? (
        <div className="product-carousel__nav">
          <button
            type="button"
            className="ss-arrow product-carousel__arrow"
            onClick={goPrev}
            disabled={!canPrev || navDisabled}
            aria-label="Previous product"
            aria-controls={`product-carousel-slide-${active.id}`}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <p className="product-carousel__status" aria-live="polite">
            <span className="sr-only">Product </span>
            {index + 1} <span aria-hidden> / </span>
            <span className="sr-only"> of </span>
            {count}
          </p>
          <button
            type="button"
            className="ss-arrow product-carousel__arrow"
            onClick={goNext}
            disabled={!canNext || navDisabled}
            aria-label="Next product"
            aria-controls={`product-carousel-slide-${active.id}`}
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  )
}
