import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { PageShell } from '../components/PageShell'
import { LandingSection } from '../components/home/LandingSection'
import { ProductPhoneFan } from '../components/ProductPhoneFan'
import { ProductPreviewToggle } from '../components/ProductPreviewToggle'
import { ScreenshotCarousel } from '../components/ScreenshotCarousel'
import { ECOSYSTEMS } from '../data/ecosystem.js'
import { synergeticCategories } from '../data/synergeticSolutionsData.js'
import { ProductCarousel } from '../components/products/ProductCarousel.jsx'

const CAROUSEL_ECOSYSTEM_IDS = new Set(['enterprise-ai', 'health-wellness'])

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
  const usePhoneFan =
    (product.id === 'epiwell' || product.id === 'epiminded' || product.id === 'epitrust') &&
    phone.length >= 4
  const audienceTags = (product.audience || '').split('·').map((t) => t.trim()).filter(Boolean)
  const isEpitrust = product.id === 'epitrust'
  const showTrustPreviewToggle = isEpitrust && hasBoth
  const [trustPreview, setTrustPreview] = useState('phone')
  const showPhoneShots = phone.length > 0 && (!showTrustPreviewToggle || trustPreview === 'phone')
  const showWebShots = web.length > 0 && (!showTrustPreviewToggle || trustPreview === 'web')

  const productBrand = (
    <>
      <span className={`product-status product-detail-status ${isLive ? 'product-status--live' : 'product-status--soon'}`}>
        {isLive ? 'Live' : 'Coming Soon'}
      </span>
      {product.logo ? (
        <img
          src={product.logo}
          alt={`${product.name} logo`}
          width={200}
          height={200}
          className="product-card-logo product-detail-logo"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span className="product-card-wordmark product-detail-wordmark">{product.name}</span>
      )}
    </>
  )

  return (
    <div
      id={product.id}
      className={`product-detail epineon-card${hasShots ? ' product-detail--media' : ''}${usePhoneFan ? ' product-detail--fan' : ''}${showTrustPreviewToggle ? ' product-detail--trust-toggle' : ''}${product.id === 'epi-legallet' ? ' product-detail--epiwell-parity' : ''}`}
      style={{ '--product-accent': product.accent }}
    >
      <div className="product-detail-body">
        <div className="product-detail-header">
          {product.id === 'epi-legallet' ? (
            <div className="product-detail-brand">{productBrand}</div>
          ) : (
            productBrand
          )}

          <p className="product-detail-desc">{description}</p>

          {audienceTags.length > 0 && (
            <div className="product-detail-tags">
              {audienceTags.map((tag) => (
                <span key={tag} className="product-audience-tag">{tag}</span>
              ))}
            </div>
          )}

          <div className="product-detail-actions">
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
            {showTrustPreviewToggle ? (
              <ProductPreviewToggle value={trustPreview} onChange={setTrustPreview} />
            ) : null}
            {showPhoneShots ? (
              usePhoneFan ? (
                <ProductPhoneFan
                  shots={phone}
                  label={showTrustPreviewToggle ? null : hasBoth ? 'Patient app' : null}
                  screenAltPrefix={product.name}
                />
              ) : (
                <ScreenshotCarousel
                  shots={phone}
                  kind="phone"
                  label={showTrustPreviewToggle ? null : hasBoth ? 'Patient app' : null}
                  centered
                />
              )
            ) : null}
            {showWebShots ? (
              <ScreenshotCarousel
                shots={web}
                kind="web"
                label={showTrustPreviewToggle ? null : hasBoth ? 'Practitioner portal' : null}
                centered
              />
            ) : null}
          </div>
        ) : null}
      </div>
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
      <LandingSection
        withMeshBackground={false}
        className="products-page-hero landing-hero-section pt-36 pb-24 lg:pt-44 lg:pb-32"
      >
        <div className="landing-hero-section__bg" aria-hidden>
          <div className="landing-hero-section__grid" />
          <div className="landing-hero-section__glow" />
        </div>
        <div className="relative z-10">
          <div className="site-content min-w-0">
            <div className="mx-auto max-w-3xl text-center">
              <p className="epineon-eyebrow-pill">Products</p>
              <h1 className="epineon-h2 epineon-section-title mt-6 text-slate-900">Three ecosystems. Every frontier.</h1>
              <p className="epineon-body-large mx-auto mt-10 max-w-2xl text-balance text-center text-white/80 text-lg leading-relaxed">
                Each product lives on its own platform. Visit a live site, or join the waitlist for what&apos;s coming.
              </p>
            </div>
          </div>
        </div>
      </LandingSection>

      {ECOSYSTEMS.map((eco) => (
        <LandingSection
          key={eco.id}
          className="products-ecosystem-section border-t border-white/5 py-12 lg:py-16"
          style={{ '--eco-accent': eco.accent }}
        >
          <div className="site-content min-w-0">
            <h2 className="epineon-h3 epineon-section-subtitle mb-8 text-slate-900">{eco.name}</h2>
            {CAROUSEL_ECOSYSTEM_IDS.has(eco.id) ? (
              <ProductCarousel
                products={eco.products}
                ariaLabel={`${eco.name} products`}
                renderCard={(product) => <ProductDetail product={product} />}
              />
            ) : (
              <div className="flex flex-col gap-6 lg:gap-8">
                {eco.products.map((product) => (
                  <ProductDetail key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </LandingSection>
      ))}
    </PageShell>
  )
}
