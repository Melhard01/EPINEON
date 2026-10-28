import { useContext, useEffect } from 'react'
import { SeoCollectorContext, resolveSeo } from '../seo/seoMeta.js'

/**
 * Per-page document metadata — a tiny head manager (no dependency).
 *
 * Prerendering: every route's tags are baked into its static HTML by scripts/prerender.mjs,
 * which reads the values this component publishes through SeoCollectorContext.
 * Browser: the effect UPDATES those same tags in place on client-side navigation, so a page
 * never accumulates duplicate title/description/canonical tags.
 */
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

export function Seo({ title, description, path = '/', image, type, noindex = false }) {
  const collector = useContext(SeoCollectorContext)
  if (collector) Object.assign(collector, resolveSeo({ title, description, path, image, type, noindex }))

  useEffect(() => {
    const seo = resolveSeo({ title, description, path, image, type, noindex })

    document.title = seo.title
    upsertMeta('name', 'description', seo.description)
    upsertLink('canonical', seo.url)

    upsertMeta('property', 'og:type', seo.type)
    upsertMeta('property', 'og:site_name', 'Epineon')
    upsertMeta('property', 'og:title', seo.title)
    upsertMeta('property', 'og:description', seo.description)
    upsertMeta('property', 'og:url', seo.url)
    upsertMeta('property', 'og:image', seo.image)

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', seo.title)
    upsertMeta('name', 'twitter:description', seo.description)
    upsertMeta('name', 'twitter:image', seo.image)

    let robots = document.head.querySelector('meta[name="robots"]')
    if (seo.noindex) {
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
