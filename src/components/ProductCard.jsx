import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

/**
 * Reusable product card for /products and the solution pages.
 * Live products → "Visit site" (external, new tab). Coming-soon → "Join waitlist" (→ /contact).
 * Keeps descriptions short (hub-level, ≤ ~20 words) — deep detail lives on the product site.
 */
export function ProductCard({ product }) {
  const isLive = product.status === 'live'
  const audienceTags = (product.audience || '').split('·').map((t) => t.trim()).filter(Boolean)

  return (
    <div className="product-card epineon-card flex flex-col p-6 lg:p-7" style={{ '--product-accent': product.accent }}>
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

      <h3 className="product-card-name mt-5">{product.name}</h3>
      <p className="product-card-desc mt-2">{product.positioning}</p>

      {audienceTags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {audienceTags.map((tag) => (
            <span key={tag} className="product-audience-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto pt-6">
        {product.demoHref ? (
          <Link to={product.demoHref} className="product-card-cta product-card-cta--primary">
            Request a demo
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : isLive ? (
          <a
            href={product.href}
            target="_blank"
            rel="noopener noreferrer"
            className="product-card-cta product-card-cta--primary"
          >
            Visit site
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>
        ) : (
          <Link to="/contact#waitlist" className="product-card-cta product-card-cta--ghost">
            Join waitlist
          </Link>
        )}
      </div>
    </div>
  )
}
