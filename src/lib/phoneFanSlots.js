/** Desktop fan layout metadata for overlapping phone mockups. */
export function buildPhoneFanSlots(count, screenAltPrefix, phoneWDesktop) {
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
  if (count === 5) {
    return [
      {
        alt: titles[0],
        floatPx: 18,
        duration: 5.35,
        delay: 0,
        hoverDeltaDeg: -2,
        desktop: { leftPct: 12, topPct: 11, fanRotate: -9, z: 2, widthRem: phoneWDesktop },
      },
      {
        alt: titles[1],
        floatPx: 15,
        duration: 5.05,
        delay: 0.35,
        hoverDeltaDeg: 1,
        desktop: { leftPct: 28, topPct: 4, fanRotate: -5, z: 10, widthRem: phoneWDesktop },
      },
      {
        alt: titles[2],
        floatPx: 12,
        duration: 5.55,
        delay: 0.65,
        hoverDeltaDeg: 1,
        desktop: { leftPct: 44, topPct: 0, fanRotate: 0, z: 14, widthRem: phoneWDesktop },
      },
      {
        alt: titles[3],
        floatPx: 14,
        duration: 5.15,
        delay: 0.28,
        hoverDeltaDeg: -1,
        desktop: { leftPct: 60, topPct: 4, fanRotate: 5, z: 11, widthRem: phoneWDesktop },
      },
      {
        alt: titles[4],
        floatPx: 16,
        duration: 5.08,
        delay: 0.12,
        hoverDeltaDeg: -2,
        desktop: { leftPct: 76, topPct: 11, fanRotate: 9, z: 3, widthRem: phoneWDesktop },
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
