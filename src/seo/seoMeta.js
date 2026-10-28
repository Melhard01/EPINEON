import { createContext } from 'react'

/**
 * Shared SEO values and the resolver used by BOTH rendering paths: <Seo> applies them to
 * document.head in the browser, and scripts/prerender.mjs bakes them into each route's
 * static HTML at build time. Kept out of Seo.jsx so that file only exports a component.
 */
export const SITE_URL = 'https://epineon.ai'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/favicon/favicon-512x512.png`
export const DEFAULT_TITLE = 'Epineon — Human-centred AI, Built on Trust | Precision Life Science'
export const DEFAULT_DESCRIPTION =
  'Epineon builds trusted, human-centred AI across enterprise security, health & wellness, and future intelligence. Explore our ecosystems.'

/** Non-null only while prerendering, where <Seo> writes the page's resolved metadata into it. */
export const SeoCollectorContext = createContext(null)

export function resolveSeo({
  title,
  description,
  path = '/',
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  noindex = false,
}) {
  let fullTitle = DEFAULT_TITLE
  if (title) fullTitle = /epineon/i.test(title) ? title : `${title} | Epineon`
  return {
    pageTitle: title || 'Epineon',
    title: fullTitle,
    description: description || DEFAULT_DESCRIPTION,
    path,
    url: `${SITE_URL}${path}`,
    image,
    type,
    noindex,
  }
}
