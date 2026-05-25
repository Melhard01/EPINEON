import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { PageShell } from '../components/PageShell'
import { ScreenshotCarousel } from '../components/ScreenshotCarousel'
import { ECOSYSTEMS } from '../data/ecosystem.js'
import { synergeticCategories } from '../data/synergeticSolutionsData.js'

// Map the ecosystem product ids to the original (v1) Synergetic data ids, so /products can
// show the richer descriptions + app screenshots (instead of repeating the mega-menu blurbs).
const SYN_ID = {
  epicrypt: 'epi-crypt',
  epiquantum: 'epi-quantum',
  epiwell: 'epi-well',
  'epi-legallet': 'epi-legalet',
  epitrust: 'epi-trust',
  epiminded: 'epi-minded',
}

const SYN_BY_ID = Object.fromEntries(
  synergeticCategories.flatMap((c) => c.products).map((p) => [p.id, p]),
)

function getShotSets(syn) {
  if (!syn) return { phone: [], web: [] }
  if (syn.screenshotSets) {
    return { phone: syn.screenshotSets.phone || [], web: syn.screenshotSets.web || [] }
  }
  if (Array.isArray(syn.screenshots)) return { phone: syn.screenshots, web: [] }
  return { phone: [], web: [] }
}

function ProductDetail({ product }) {
  const syn = SYN_BY_ID[SYN_ID[product.id]]
  const description = syn?.description || product.description || product.positioning
  const { phone, web } = getShotSets(syn)
  const isLive = product.status === 'live'
  const hasShots = phone.length > 0 || web.length > 0
  const hasBoth = phone.length > 0 && web.length > 0
  const audienceTags = (product.audience || '').split('·').map((t) => t.trim()).filter(Boolean)

  return (
    <div
      id={product.id}
      className={`product-detail epineon-card${hasShots ? ' product-detail--media' : ''}`}
      style={{ '--product-accent': product.accent }}
    >
      <div className="product-detail-text">
        <div className="flex items-start justify-between gap-3">
          {product.logo ? (
            <img src={product.logo} alt={`${product.name} logo`} width={144} height={144} className="product-card-logo" loading="lazy" decoding="async" />
          ) : (
            <span className="product-card-wordmark">{product.name}</span>
          )}
          <span className={`product-status ${isLive ? 'product-status--live' : 'product-status--soon'}`}>
            {isLive ? 'Live' : 'Coming Soon'}
          </span>
        </div>

        <h3 className="product-card-name mt-4">{product.name}</h3>
        <p className="product-detail-desc mt-3">{description}</p>

        {audienceTags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {audienceTags.map((tag) => (
              <span key={tag} className="product-audience-tag">{tag}</span>
            ))}
          </div>
        )}

        <div className="mt-6">
          {product.demoHref ? (
            <Link to={product.demoHref} className="product-card-cta product-card-cta--primary product-card-cta--inline">
              Request a demo
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : isLive ? (
            <a href={product.href} target="_blank" rel="noopener noreferrer" className="product-card-cta product-card-cta--primary product-card-cta--inline">
              Visit site
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          ) : (
            <Link to="/contact#sales" className="product-card-cta product-card-cta--ghost product-card-cta--inline">
              Join waitlist
            </Link>
          )}
        </div>
      </div>

      {hasShots ? (
        <div className="product-detail-media">
          {phone.length > 0 ? (
            <ScreenshotCarousel shots={phone} kind="phone" label={hasBoth ? 'Patient app' : null} />
          ) : null}
          {web.length > 0 ? (
            <ScreenshotCarousel shots={web} kind="web" label={hasBoth ? 'Practitioner portal' : null} />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default function Products() {
  return (
    <PageShell
      title="The Epineon Product Portfolio"
      description="Every Epineon product across enterprise security, health & wellness, and future intelligence."
      path="/products"
    >
      <section className="pt-32 pb-6 lg:pt-40 lg:pb-8">
        <div className="site-content min-w-0">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c9a227]">Products</p>
            <h1 className="epineon-h2 epineon-section-title mt-3 text-slate-900">Three ecosystems. Every frontier.</h1>
            <p className="epineon-body-large mt-5 text-white/80 text-lg leading-relaxed">
              Each product lives on its own platform. Visit a live site, or join the waitlist for what&apos;s coming.
            </p>
          </div>
        </div>
      </section>

      {ECOSYSTEMS.map((eco) => (
        <section key={eco.id} className="border-t border-white/5 py-12 lg:py-16" style={{ '--eco-accent': eco.accent }}>
          <div className="site-content min-w-0">
            <div className="mb-8 flex flex-col gap-1">
              <span className="ecosystem-card-label">{eco.categoryLabel}</span>
              <h2 className="epineon-h3 epineon-section-subtitle text-slate-900">{eco.name}</h2>
            </div>
            <div className="flex flex-col gap-6 lg:gap-8">
              {eco.products.map((product) => (
                <ProductDetail key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </PageShell>
  )
}
