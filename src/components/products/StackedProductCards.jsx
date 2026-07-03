import React from 'react'
import { useStackedProductScroll } from '../../hooks/useStackedProductScroll.js'

/**
 * Stacked product rows on /products (Enterprise AI, Health & Wellness).
 * Motion only — visual styles remain on `.product-detail`.
 */
export function StackedProductCards({ products, renderCard }) {
  const {
    trackRef,
    setCardRef,
    transformsY,
    pinHeight,
    trackHeightPx,
    stickyTopPx,
    enabled,
  } = useStackedProductScroll(products.length)

  if (!enabled) {
    return (
      <div className="flex flex-col gap-6 lg:gap-8">
        {products.map((product) => (
          <React.Fragment key={product.id}>{renderCard(product)}</React.Fragment>
        ))}
      </div>
    )
  }

  return (
    <div
      ref={trackRef}
      className="product-stack-scroll"
      style={{ height: trackHeightPx > 0 ? `${trackHeightPx}px` : undefined }}
    >
      <div
        className="product-stack-scroll__pin"
        style={{
          top: stickyTopPx,
          height: pinHeight > 0 ? `${pinHeight}px` : undefined,
        }}
      >
        {products.map((product, index) => (
          <div
            key={product.id}
            ref={setCardRef(index)}
            className="product-stack-scroll__layer"
            style={{
              zIndex: index + 1,
              transform: `translate3d(0, ${transformsY[index] ?? 0}px, 0)`,
            }}
          >
            {renderCard(product)}
          </div>
        ))}
      </div>
    </div>
  )
}
