/**
 * Retina-ready phone screenshot sources for synergetic product fans.
 * @typedef {{ src: string, src2x?: string, width?: number, height?: number }} PhoneScreenshot
 */

/**
 * @param {string} standard
 * @param {string} [retina]
 * @param {{ width?: number, height?: number }} [meta]
 */
export function phoneShot(standard, retina, meta = {}) {
  const width = meta.width ?? 460
  const height = meta.height ?? Math.round((width * 1024) / 460)
  return { src: standard, src2x: retina, width, height }
}

/**
 * @param {PhoneScreenshot | string} shot
 * @param {{ widthRem?: number, layout?: 'desktop' | 'solo' | 'pair' | 'web' }} [opts]
 */
export function getPhoneScreenshotAttrs(shot, opts = {}) {
  const src = typeof shot === 'string' ? shot : shot.src
  const src2x = typeof shot === 'object' && shot.src2x ? shot.src2x : null
  const widthRem = opts.widthRem ?? 12
  const intrinsicW = typeof shot === 'object' && shot.width ? shot.width : 460
  const intrinsicH = typeof shot === 'object' && shot.height ? shot.height : Math.round((intrinsicW * 1024) / 460)

  const attrs = {
    src,
    width: intrinsicW,
    height: intrinsicH,
    decoding: 'async',
  }

  if (src2x) {
    attrs.srcSet = `${src} 1x, ${src2x} 2x`
    if (opts.layout === 'desktop') {
      attrs.sizes = `(min-width: 1280px) min(13rem, 100vw), ${widthRem}rem`
    } else if (opts.layout === 'web') {
      attrs.sizes =
        '(max-width: 899px) min(92vw, 22.5rem), (max-width: 1279px) min(78vw, 20rem), min(26rem, 38vw)'
    } else if (opts.layout === 'pair') {
      attrs.sizes = `(max-width: 1279px) ${widthRem}rem`
    } else {
      attrs.sizes = `(max-width: 899px) ${widthRem}rem, ${widthRem}rem`
    }
  }

  return attrs
}
