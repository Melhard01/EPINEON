import React from 'react'

/**
 * Semantic section wrapper for the landing page. Section animations are applied
 * globally via usePageSectionAnimations in App.jsx / PageShell.
 */
export function LandingSection({ id, className = '', withMeshBackground = true, children, ...rest }) {
  return (
    <section
      id={id}
      className={`landing-section relative overflow-x-clip${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {withMeshBackground ? (
        <>
          <div className="landing-section__bg" aria-hidden>
            <div className="landing-section__grid" />
            <div className="landing-section__orb landing-section__orb--amber" />
            <div className="landing-section__orb landing-section__orb--gold" />
          </div>
          <div className="landing-section__content relative z-10">{children}</div>
        </>
      ) : (
        children
      )}
    </section>
  )
}

/** @deprecated Use page-level section animations; kept for import compatibility. */
export function useSectionActive() {
  return true
}
