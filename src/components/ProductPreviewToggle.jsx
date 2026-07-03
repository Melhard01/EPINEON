import React from 'react'

/**
 * Switch between phone and web screenshot previews (Epi Trust on /products).
 */
export function ProductPreviewToggle({ value, onChange }) {
  return (
    <div
      role="group"
      aria-label="Preview type"
      className="product-preview-toggle"
    >
      <button
        type="button"
        className="product-preview-toggle__btn"
        aria-pressed={value === 'phone'}
        onClick={() => onChange('phone')}
      >
        Mobile app
      </button>
      <button
        type="button"
        className="product-preview-toggle__btn"
        aria-pressed={value === 'web'}
        onClick={() => onChange('web')}
      >
        Web portal
      </button>
    </div>
  )
}
