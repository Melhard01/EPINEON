import React, { useEffect, useState } from 'react'

const WIDE_QUERY = '(min-width: 768px)'
const MOTION_QUERY = '(prefers-reduced-motion: no-preference)'

const SOURCES = {
  wide: { src: '/assets/matrix-rain-hero.mp4', poster: '/assets/matrix-rain-hero-poster.jpg' },
  narrow: {
    src: '/assets/matrix-rain-hero-mobile.mp4',
    poster: '/assets/matrix-rain-hero-mobile-poster.jpg',
  },
}

/**
 * Whether to play, and which encode to use.
 *
 * Both start false so the prerendered HTML and the first client render agree — otherwise React
 * reports a hydration mismatch. The real answer arrives in the effect, after mount.
 */
function useHeroVideo() {
  const [state, setState] = useState({ play: false, wide: false })

  useEffect(() => {
    const motion = window.matchMedia(MOTION_QUERY)
    const wide = window.matchMedia(WIDE_QUERY)
    const update = () => setState({ play: motion.matches, wide: wide.matches })
    update()
    motion.addEventListener('change', update)
    wide.addEventListener('change', update)
    return () => {
      motion.removeEventListener('change', update)
      wide.removeEventListener('change', update)
    }
  }, [])

  return state
}

/**
 * Looping "matrix rain" video behind the home hero.
 *
 * Every screen gets the rain, but the file is cut to fit the screen:
 * - ≥768px: 1920x1080, ~3.5MB.
 * - <768px: 540x960 PORTRAIT, ~356kB. A phone hero is taller than it is wide, so a landscape
 *   encode would spend most of its pixels on columns object-fit: cover throws away. Cropping
 *   at encode time instead keeps every pixel on screen: the same bytes look ~1.8x sharper.
 * - Reduced motion: the poster only, never a video, at any width.
 *
 * Each encode has its own poster (frame 0 of that file), so the still already on screen and
 * the first video frame match and the fade-in has nothing to jump over. The poster is also
 * painted by CSS on the wrapper, so it appears before this component has even mounted.
 */
export function HeroBackgroundVideo() {
  const { play, wide } = useHeroVideo()
  const [ready, setReady] = useState(false)
  const cut = wide ? SOURCES.wide : SOURCES.narrow

  return (
    <div className="landing-hero-section__video" aria-hidden>
      {play ? (
        <video
          // Remount when the breakpoint is crossed: swapping a <source> on a live
          // <video> does not reload it, so without this a phone rotated to landscape
          // would keep the small encode.
          key={wide ? 'wide' : 'narrow'}
          className={`landing-hero-section__video-el${ready ? ' is-ready' : ''}`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={cut.poster}
          onCanPlay={() => setReady(true)}
          tabIndex={-1}
        >
          <source src={cut.src} type="video/mp4" />
        </video>
      ) : null}
      <div className="landing-hero-section__video-scrim" />
    </div>
  )
}
