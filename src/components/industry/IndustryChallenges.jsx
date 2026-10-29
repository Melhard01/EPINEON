import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/**
 * Industry "Where it gets hard" — a stepped list beside a media panel.
 *
 * The active row expands to its full text and carries the progress bar that times the card;
 * when the bar fills, the next row opens and the media panel cross-dissolves to match.
 * Collapsed rows stay on one line so the list keeps a steady rhythm.
 *
 * A challenge is either a string or `{ text, video, poster }`; with no `video` the panel
 * falls back to the industry still from `industryMedia.js`.
 */
const CARD_HOLD_MS = 7000

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function IndustryChallenges({ challenges, fallbackImage, fallbackAlt = '', fallbackDisplay }) {
  const items = useMemo(
    () =>
      (challenges ?? [])
        .filter(Boolean)
        .map((c) => (typeof c === 'string' ? { text: c } : c))
        .filter((c) => c.text),
    [challenges],
  )

  const count = items.length
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(prefersReducedMotion)
  // Holds the step while someone is reading or tabbing through it. Kept separate from
  // `paused` so it can't clobber the reduced-motion / background-tab pause.
  const [held, setHeld] = useState(false)
  const isPaused = paused || held

  const goTo = useCallback(
    (next) => {
      if (count === 0) return
      setIndex(((next % count) + count) % count)
    },
    [count],
  )

  // Never let a row expire while the tab is in the background.
  useEffect(() => {
    const onVisibility = () => document.hidden && setPaused(true)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  if (count === 0) return null

  const active = items[index]

  return (
    <>
      <h2 className="epineon-h2 epineon-section-title scroll-animate text-slate-900">
        Where it gets hard
      </h2>

      <div
        className="challenges-panel scroll-animate scroll-animate-delay-1"
        onMouseEnter={() => setHeld(true)}
        onMouseLeave={() => setHeld(false)}
        onFocus={() => setHeld(true)}
        onBlur={() => setHeld(false)}
      >
        <div className="challenges-panel__list" role="tablist" aria-label="Industry challenges">
          {items.map((item, i) => {
            const isActive = i === index
            return (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`challenges-row${isActive ? ' is-active' : ''}`}
                onClick={() => goTo(i)}
              >
                <span className="challenges-row__main">
                  <span className="challenges-row__num" aria-hidden>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="challenges-row__text">{item.text}</span>
                  <span className="challenges-row__mark" aria-hidden />
                </span>

                <span className="challenges-row__bar" aria-hidden>
                  <span
                    className="challenges-row__fill"
                    // Remounting per row restarts the bar; its end opens the next row.
                    key={isActive ? `run-${index}` : 'idle'}
                    style={
                      isActive
                        ? {
                            animationDuration: `${CARD_HOLD_MS}ms`,
                            animationPlayState: isPaused ? 'paused' : 'running',
                          }
                        : undefined
                    }
                    onAnimationEnd={isActive ? () => goTo(index + 1) : undefined}
                  />
                </span>
              </button>
            )
          })}
        </div>

        <div
          className={`challenges-panel__media${fallbackDisplay?.ratio ? ' challenges-panel__media--fit' : ''}`}
          style={fallbackDisplay?.ratio ? { '--challenges-media-ratio': fallbackDisplay.ratio } : undefined}
        >
          <div className="challenges-media">
            {items.map((item, i) => (
              <MediaLayer
                key={i}
                item={item}
                fallbackImage={fallbackImage}
                fallbackAlt={fallbackAlt}
                fallbackDisplay={fallbackDisplay}
                isActive={i === index}
                isNext={i === (index + 1) % count}
                paused={isPaused}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {active.text}
      </p>
    </>
  )
}

function MediaLayer({ item, fallbackImage, fallbackAlt, fallbackDisplay, isActive, isNext, paused }) {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (isActive && !paused) {
      video.play().catch(() => {})
    } else {
      video.pause()
      if (!isActive) video.currentTime = 0
    }
  }, [isActive, paused])

  const className = `challenges-media__layer${isActive ? ' is-active' : ''}`

  if (item.video) {
    return (
      <video
        ref={videoRef}
        className={className}
        src={isActive || isNext ? item.video : undefined}
        poster={item.poster}
        muted
        loop
        playsInline
        preload={isActive ? 'auto' : isNext ? 'metadata' : 'none'}
      />
    )
  }

  if (!fallbackImage) return <div className={className} />

  return (
    <img
      className={`${className}${fallbackDisplay?.contain ? ' challenges-media__layer--contain' : ''}`}
      src={fallbackImage}
      alt={fallbackAlt}
      loading="lazy"
      decoding="async"
    />
  )
}
