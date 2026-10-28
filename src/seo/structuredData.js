/**
 * Schema.org JSON-LD for each prerendered page, built only from the site's own data modules.
 *
 * Brand architecture: Epineon (Organization) → three ecosystems → product brands (Brand) →
 * solutions (Service) → industries (WebPage audience). Products are modelled as Brand, not
 * Product: the site publishes no prices, offers or ratings, and Product markup without them is
 * invalid for Google's product results.
 */
import { SITE_URL } from './seoMeta.js'
import { ECOSYSTEMS, ALL_PRODUCTS } from '../data/ecosystem.js'
import { SOLUTIONS } from '../data/solutions.js'
import { INDUSTRIES } from '../data/industries.js'

const ORG_ID = `${SITE_URL}/#organization`
const WEBSITE_ID = `${SITE_URL}/#website`
const LOGO_URL = `${SITE_URL}/favicon/favicon-512x512.png`
const ORG_DESCRIPTION =
  'Epineon builds private, human-centred AI for organisations and people operating where trust, privacy and foresight are non-negotiable.'
const SOCIAL_PROFILES = ['https://www.instagram.com/epineon.now/', 'https://www.linkedin.com/company/epineonn']

const PAGE_TYPES = {
  '/products': 'CollectionPage',
  '/company/about': 'AboutPage',
  '/contact': 'ContactPage',
}

const abs = (path) => `${SITE_URL}${path}`
const ref = (id) => ({ '@id': id })
const brandId = (productId) => `${SITE_URL}/products#${productId}`
const serviceId = (solutionPath) => `${abs(solutionPath)}#service`

function absoluteAsset(src) {
  if (!src || src.startsWith('data:')) return undefined
  return new URL(src, SITE_URL).href
}

function brandNode(product) {
  return {
    '@type': 'Brand',
    '@id': brandId(product.id),
    name: product.name,
    description: product.positioning,
    url: product.external ? product.href : brandId(product.id),
    logo: absoluteAsset(product.logo),
  }
}

function organizationNode() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'Epineon',
    url: `${SITE_URL}/`,
    logo: { '@type': 'ImageObject', url: LOGO_URL, width: 512, height: 512 },
    description: ORG_DESCRIPTION,
    email: 'contact@epineon.ai',
    sameAs: SOCIAL_PROFILES,
    brand: ALL_PRODUCTS.map((p) => ref(brandId(p.id))),
  }
}

function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: 'Epineon',
    inLanguage: 'en',
    publisher: ref(ORG_ID),
  }
}

function breadcrumbNode(seo) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${seo.url}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: seo.pageTitle, item: seo.url },
    ],
  }
}

function serviceNode(slug) {
  const sol = SOLUTIONS[slug]
  const ecosystem = ECOSYSTEMS.find((eco) => eco.solutionHref === sol.path)
  return {
    '@type': 'Service',
    '@id': serviceId(sol.path),
    name: sol.title,
    description: sol.seoDescription,
    url: abs(sol.path),
    provider: ref(ORG_ID),
    category: ecosystem?.name,
    brand: sol.productIds.map((id) => ref(brandId(id))),
  }
}

function ecosystemsList() {
  return {
    '@type': 'ItemList',
    '@id': `${SITE_URL}/products#ecosystems`,
    name: 'Epineon ecosystems',
    numberOfItems: ECOSYSTEMS.length,
    itemListElement: ECOSYSTEMS.map((eco, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'ItemList',
        '@id': `${SITE_URL}/products#ecosystem-${eco.id}`,
        name: eco.name,
        url: abs(eco.solutionHref),
        numberOfItems: eco.products.length,
        itemListElement: eco.products.map((p, j) => ({
          '@type': 'ListItem',
          position: j + 1,
          item: ref(brandId(p.id)),
        })),
      },
    })),
  }
}

/** Returns the JSON-LD object for a page, or null for noindex pages. */
export function buildStructuredData(seo) {
  if (seo.noindex) return null

  const { path } = seo
  const isHome = path === '/'
  const graph = [organizationNode(), websiteNode(), ...ALL_PRODUCTS.map(brandNode)]

  const page = {
    '@type': PAGE_TYPES[path] || 'WebPage',
    '@id': `${seo.url}#webpage`,
    url: seo.url,
    name: seo.title,
    description: seo.description,
    isPartOf: ref(WEBSITE_ID),
    inLanguage: 'en',
  }
  if (isHome) page.about = ref(ORG_ID)
  else {
    page.breadcrumb = ref(`${seo.url}#breadcrumb`)
    graph.push(breadcrumbNode(seo))
  }

  const solutionSlug = path.startsWith('/solutions/') ? path.slice('/solutions/'.length) : null
  const industrySlug = path.startsWith('/industries/') ? path.slice('/industries/'.length) : null

  if (path === '/products') {
    const list = ecosystemsList()
    page.mainEntity = ref(list['@id'])
    graph.push(list)
  } else if (solutionSlug && SOLUTIONS[solutionSlug]) {
    const service = serviceNode(solutionSlug)
    page.mainEntity = ref(service['@id'])
    graph.push(service)
  } else if (industrySlug && INDUSTRIES[industrySlug]) {
    const ind = INDUSTRIES[industrySlug]
    page.audience = { '@type': 'Audience', audienceType: ind.title }
    page.mentions = ind.productIds.map((id) => ref(brandId(id)))
    const relatedSlug = ind.relatedSolution?.split('/').pop()
    if (relatedSlug && SOLUTIONS[relatedSlug]) {
      const service = serviceNode(relatedSlug)
      page.about = ref(service['@id'])
      graph.push(service)
    }
  }

  graph.push(page)
  return { '@context': 'https://schema.org', '@graph': graph }
}
