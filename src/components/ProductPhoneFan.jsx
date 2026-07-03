import React, { useEffect, useMemo, useState } from 'react'
import { buildPhoneFanSlots } from '../lib/phoneFanSlots.js'
import { getPhoneScreenshotAttrs } from '../lib/phoneScreenshot.js'
import { ScreenshotCarousel } from './ScreenshotCarousel.jsx'

const DESKTOP_FAN_MIN = 1024
const PHONE_W_DESKTOP = 11

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

function FanSlot({ shot, slot, screenIndex }) {
  const [hover, setHover] = useState(false)
  const { desktop, hoverDeltaDeg, alt } = slot
  const rotate = desktop.fanRotate + (hover ? hoverDeltaDeg : 0)
  const attrs = getPhoneScreenshotAttrs(shot, {
    layout: 'desktop',
    widthRem: desktop.widthRem ?? PHONE_W_DESKTOP,
  })

  return (
    <div
      className="product-phone-fan__slot"
      style={{
        zIndex: hover ? 100 : desktop.z,
        transform: `translateX(-50%) rotate(${rotate}deg)`,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="product-phone-fan__frame">
        <div className="product-phone-fan__screen">
          <img
            {...attrs}
            alt={alt}
            className="product-phone-fan__shot"
            loading={screenIndex <= 1 ? 'eager' : 'lazy'}
            decoding="async"
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Phone fan (bases aligned at bottom) for Epi Well, Epi Trust, and Epi Minded on /products desktop.
 * Falls back to framed swipe carousel below DESKTOP_FAN_MIN.
 */
export function ProductPhoneFan({ shots, label, screenAltPrefix = 'Product' }) {
  const isDesktopFan = useMinWidth(DESKTOP_FAN_MIN)
  const slots = useMemo(
    () => (shots?.length ? buildPhoneFanSlots(shots.length, screenAltPrefix, PHONE_W_DESKTOP) : []),
    [shots?.length, screenAltPrefix],
  )

  if (!shots || shots.length === 0) return null

  if (!isDesktopFan) {
    return (
      <ScreenshotCarousel shots={shots} kind="phone" label={label} centered framed expandOnDesktop={false} />
    )
  }

  return (
    <div className="ss-carousel product-phone-fan">
      {label ? <p className="shot-group-label">{label}</p> : null}
      <div className="product-phone-fan__stage" data-fan-count={shots.length}>
        {shots.map((shot, i) => (
          <FanSlot key={i} shot={shot} slot={slots[i]} screenIndex={i + 1} />
        ))}
      </div>
    </div>
  )
}
