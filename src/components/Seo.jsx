import { useEffect } from 'react'

/**
 * Per-page document metadata — a tiny imperative head manager (no dependency).
 *
 * It UPDATES the existing tags from index.html in place (title, description, canonical,
 * Open Graph, Twitter) rather than appending, so sub-pages never produce duplicate
 * <title>/<meta>/<canonical> tags. index.html holds the home-page + non-JS-scraper
 * fallback values; each route overwrites them on mount.
 *
 * NOTE: this is a client-rendered SPA. These tags are correct for browsers and JS-capable
 * SEO crawlers, but social scrapers (LinkedIn/Twitter) that do NOT run JS read only the
 * static index.html tags. True per-page social cards require prerendering (follow-up).
 */
export const SITE_URL = 'https://epineon.ai'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png` // TODO: add a 1200x630 image at client/public/og-image.png
const DEFAULT_TITLE = 'Epineon — One AI Ecosystem, Built on Trust | Precision Life Science'
const DEFAULT_DESCRIPTION =
  'Epineon builds trusted, human-centered AI across enterprise security, health & wellness, and future intelligence. Explore our ecosystem.'

function upsertMeta(attr, key, content) {
  if (content == null) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export function Seo({
  title,
  description,
  path = '/',
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  noindex = false,
}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | Epineon` : DEFAULT_TITLE
    const desc = description || DEFAULT_DESCRIPTION
    const url = `${SITE_URL}${path}`

    document.title = fullTitle
    upsertMeta('name', 'description', desc)
    upsertLink('canonical', url)

    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:site_name', 'Epineon')
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', desc)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:image', image)

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', desc)
    upsertMeta('name', 'twitter:image', image)

    let robots = document.head.querySelector('meta[name="robots"]')
    if (noindex) {
      if (!robots) {
        robots = document.createElement('meta')
        robots.setAttribute('name', 'robots')
        document.head.appendChild(robots)
      }
      robots.setAttribute('content', 'noindex,nofollow')
    } else if (robots) {
      robots.remove()
    }
  }, [title, description, path, image, type, noindex])

  return null
}
