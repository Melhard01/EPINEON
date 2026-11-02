import React from 'react'
import { ShieldCheck, Lock, HeartHandshake, ScrollText } from 'lucide-react'
import { PageShell } from '../components/PageShell'
import '../trust.css'

// Frameworks: describe RELEVANCE per the brief. We do NOT assert certification status here —
// enterprises request current reports via security@epineon.ai.
// TODO: once confirmed, add a real status (e.g. "Certified", "In progress", "Aligned") per item.
const FRAMEWORKS = [
  { name: 'SOC 2', relevance: 'Controls for security, availability, and confidentiality of customer data.' },
  { name: 'HIPAA', relevance: 'Protected health information handling across our health & wellness products.' },
  { name: 'GDPR', relevance: 'Lawful processing, data minimization, and user rights across the EU and beyond.' },
  { name: 'ISO 27001', relevance: 'A systematic framework for managing information-security risk.' },
]

const PRINCIPLES = [
  { icon: HeartHandshake, title: 'Human agency first', body: 'Products are built around the person — we design for control, not data extraction.' },
  { icon: Lock, title: 'Privacy by default', body: 'Data minimization and strong encryption are the default, not an upgrade.' },
  { icon: ShieldCheck, title: 'Quantum-ready security', body: 'We prepare for post-quantum threats where the data’s lifespan demands it.' },
  { icon: ScrollText, title: 'Transparency', body: 'Clear documentation of how each system uses data, available to the people it affects.' },
]

const HERO_TITLE = 'Trust, by architecture.'

/**
 * Ambient depth layer: a masked grid plus two drifting gold orbs. src/trust.css
 * repositions the orbs per section, so each block is lit differently while the
 * field stays continuous down the page.
 */
function TrustAmbience() {
  return (
    <div className="trust-ambience" aria-hidden>
      <div className="trust-ambience__grid" />
      <div className="trust-orb trust-orb--a" />
      <div className="trust-orb trust-orb--b" />
    </div>
  )
}

/**
 * The seam between two sections: a hairline that draws downward as the section
 * arrives, a light running through it, and a node where it lands. This is the
 * connective device that makes the scroll read as one continuous story.
 */
function TrustSeam() {
  return (
    <div className="trust-seam" aria-hidden>
      <span className="trust-seam__line" />
      <span className="trust-seam__pulse" />
      <span className="trust-seam__node" />
    </div>
  )
}

/**
 * Security posture figure — layered perimeter. Three boundaries draw outward in
 * sequence around a lock that closes last, with a satellite held inside the
 * outer ring: the section's own claim that sensitive data stays inside
 * customer-controlled boundaries. Decorative only.
 */
function PerimeterFigure() {
  return (
    <div className="trust-perimeter" aria-hidden>
      <span className="trust-perimeter__halo" />
      <svg className="trust-perimeter__rings" viewBox="0 0 200 200" fill="none" focusable="false">
        {/* pathLength="1" normalises the dash maths so one keyframe draws every radius. */}
        <circle className="trust-perimeter__ring" style={{ '--i': 0 }} cx="100" cy="100" r="92" pathLength="1" />
        <circle className="trust-perimeter__ring" style={{ '--i': 1 }} cx="100" cy="100" r="70" pathLength="1" />
        <circle className="trust-perimeter__ring" style={{ '--i': 2 }} cx="100" cy="100" r="48" pathLength="1" />
      </svg>
      <span className="trust-perimeter__orbit">
        <span className="trust-perimeter__sat" />
      </span>
      <span className="trust-perimeter__core">
        <span className="why-item-icon lp-icon-chip">
          <Lock className="h-5 w-5" />
        </span>
      </span>
    </div>
  )
}

export default function Trust() {
  return (
    <PageShell
      title="Trust Center"
      description="Epineon’s security posture, data-privacy architecture, AI ethics principles, and compliance frameworks."
      path="/trust"
    >
      {/*
        Everything is wrapped in .trust-page so src/trust.css can restyle shared
        primitives (.scroll-animate, .lp-icon-chip) without reaching any other
        route. Reveals come from the shared IntersectionObserver in PageShell:
        it adds .page-section--active to each <section> and .visible to the
        .scroll-animate elements inside it. `--i` places an element in its
        section's sequence, the way a Remotion <Sequence> offsets a child.

        Every string, heading, label and type class below is the original —
        only layout, ornament and motion changed.
      */}
      <div className="trust-page">
        {/* ── 1 · Hero — cinematic entrance: the gold wash lifts, the grid
               settles, then the headline rises word by word. ── */}
        <section className="trust-section trust-hero">
          <div className="trust-hero__bg" aria-hidden>
            <div className="trust-hero__glow" />
            <div className="trust-hero__grid" />
          </div>
          <div className="trust-section__inner">
            <div className="site-content min-w-0">
              <div className="trust-hero__content mx-auto max-w-3xl text-center">
                <p
                  className="trust-hero__eyebrow scroll-animate text-sm font-semibold uppercase tracking-[0.22em] text-[#c9a227]"
                  style={{ '--i': 0 }}
                >
                  Trust Center
                </p>
                <h1 className="epineon-h2 epineon-section-title trust-hero__title text-reveal mt-5 text-slate-900">
                  {/* One span per word so the line rises in sequence. The trailing
                      space lives inside the span (white-space: pre in trust.css)
                      so the heading's text content stays byte-identical. */}
                  {HERO_TITLE.split(' ').map((word, index, words) => (
                    <span key={`${word}-${index}`}>{index < words.length - 1 ? `${word} ` : word}</span>
                  ))}
                </h1>
                <span className="trust-hero__rule scroll-animate" style={{ '--i': 4 }} aria-hidden />
                <p
                  className="epineon-body-large trust-hero__lead scroll-animate mx-auto max-w-2xl text-white/80 text-lg leading-relaxed"
                  style={{ '--i': 5 }}
                >
                  Security and privacy aren’t features we add — they’re how the ecosystem is built. Here’s our posture,
                  our principles, and the frameworks we hold ourselves to.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2 · Security posture — asymmetric: copy behind a gold boundary rule,
               perimeter figure to the right. ── */}
        <section className="trust-section trust-posture py-14 lg:py-24">
          <TrustSeam />
          <TrustAmbience />
          <div className="trust-section__inner">
            <div className="site-content min-w-0">
              <div className="trust-split trust-posture__split">
                <div className="trust-copy">
                  <h2
                    className="epineon-h2 epineon-section-title scroll-animate text-slate-900"
                    style={{ '--i': 0 }}
                  >
                    Security posture
                  </h2>
                  <p
                    className="epineon-body-large scroll-animate mt-6 text-white/75 text-base leading-relaxed lg:text-lg"
                    style={{ '--i': 1 }}
                  >
                    We design for environments that can’t afford to be wrong. That means keeping sensitive data inside
                    customer-controlled boundaries, encrypting data in transit and at rest, and adopting quantum-aware
                    cryptography where the data’s lifespan demands it.
                  </p>
                  <p
                    className="epineon-body-large scroll-animate mt-5 text-white/75 text-base leading-relaxed lg:text-lg"
                    style={{ '--i': 2 }}
                  >
                    For current certification status, audit reports, and security questionnaires, contact{' '}
                    <a href="mailto:security@epineon.ai" className="trust-link text-[#c9a227]">security@epineon.ai</a>.
                  </p>
                </div>
                <div className="trust-posture__figure scroll-animate" style={{ '--i': 1 }}>
                  <PerimeterFigure />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3 · Compliance frameworks — one certification ledger instead of four
               tiles: rows reveal in sequence, each seal's ring draws a full turn
               before its mark lands. ── */}
        <section className="trust-section trust-compliance py-14 lg:py-24">
          <TrustSeam />
          <TrustAmbience />
          <div className="trust-section__inner">
            <div className="site-content min-w-0">
              <h2 className="epineon-h2 epineon-section-title scroll-animate text-slate-900" style={{ '--i': 0 }}>
                Compliance frameworks
              </h2>
              <div className="trust-glass trust-ledger scroll-animate mt-9 lg:mt-11" style={{ '--i': 1 }}>
                {FRAMEWORKS.map((f, index) => (
                  <div key={f.name} className="trust-ledger__row" style={{ '--i': index + 2 }}>
                    <span className="trust-ledger__seal" aria-hidden>
                      <svg viewBox="0 0 24 24" fill="none" focusable="false">
                        <circle className="trust-ledger__ring" cx="12" cy="12" r="10.5" pathLength="1" />
                      </svg>
                      <span className="trust-ledger__mark" />
                    </span>
                    <h3 className="why-item-label trust-ledger__name text-slate-900">{f.name}</h3>
                    <p className="epineon-body trust-ledger__body text-white/70 text-sm leading-relaxed">
                      {f.relevance}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 4 · Data privacy — no figure here: the block is offset to the right
               at desktop, mirroring the posture copy on the left. ── */}
        <section className="trust-section trust-privacy py-14 lg:py-24">
          <TrustSeam />
          <TrustAmbience />
          <div className="trust-section__inner">
            <div className="site-content min-w-0">
              <div className="trust-privacy__offset">
                <div className="trust-copy">
                  <h2
                    className="epineon-h2 epineon-section-title scroll-animate text-slate-900"
                    style={{ '--i': 0 }}
                  >
                    Data privacy
                  </h2>
                  <p
                    className="epineon-body-large scroll-animate mt-6 text-white/75 text-base leading-relaxed lg:text-lg"
                    style={{ '--i': 1 }}
                  >
                    Personal data stays with the person it belongs to. We collect only what a product needs to function,
                    keep it encrypted, and give users clear control over it. Each product documents how it handles data
                    within its own privacy notice.
                  </p>
                  {/* TODO: add per-product data-handling summaries (EPIWELL, Epitrust, SoulChain). */}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5 · AI ethics principles — a connected rail instead of four cards:
               the line draws across, then each chip lands on it. ── */}
        <section className="trust-section trust-ethics py-14 lg:py-24">
          <TrustSeam />
          <TrustAmbience />
          <div className="trust-section__inner">
            <div className="site-content min-w-0">
              <h2 className="epineon-h2 epineon-section-title scroll-animate text-slate-900" style={{ '--i': 0 }}>
                AI ethics principles
              </h2>
              <div className="trust-rail mt-10 lg:mt-14">
                <span className="trust-rail__line" aria-hidden />
                {PRINCIPLES.map((p, index) => {
                  const Icon = p.icon
                  return (
                    <div
                      key={p.title}
                      className="trust-rail__item scroll-animate"
                      style={{ '--i': index + 2, '--drop': index % 2 }}
                    >
                      <span className="why-item-icon lp-icon-chip trust-rail__chip" aria-hidden>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="trust-rail__tick" aria-hidden />
                      <h3 className="why-item-label trust-rail__title text-slate-900">{p.title}</h3>
                      <p className="epineon-body trust-rail__body text-white/70 text-sm leading-relaxed">{p.body}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
