import { useEffect, useRef, useState } from 'react'

/**
 * Solution "The challenge" panel: a labelled icon list beside the problem copy.
 *
 * Labels come from `challengeKeywords` in solutions.js; the icons here are purely
 * presentational and keyed by label, so a keyword without a matching icon still
 * renders its text. Paragraphs are `sol.problem`, unchanged.
 */
const ICONS = {
  /* —— Trusted AI —————————————————————————————————————————————— */
  /* Post-quantum — electron orbits around a nucleus */
  'Post-quantum': (
    <svg viewBox="0 0 24 24" className="ch-anim-scatter">
      <ellipse className="draw" style={{ '--len': 44 }} cx="12" cy="12" rx="9.2" ry="3.8" />
      <ellipse className="draw" style={{ '--len': 44 }} cx="12" cy="12" rx="9.2" ry="3.8" transform="rotate(60 12 12)" />
      <ellipse className="draw" style={{ '--len': 44 }} cx="12" cy="12" rx="9.2" ry="3.8" transform="rotate(120 12 12)" />
      <circle className="draw node" style={{ '--len': 10 }} cx="12" cy="12" r="1.7" />
    </svg>
  ),
  /* Security — padlock */
  Security: (
    <svg viewBox="0 0 24 24" className="ch-anim-key">
      <rect className="draw" style={{ '--len': 46 }} x="4.2" y="10.4" width="15.6" height="10.4" rx="2.2" />
      <path className="draw" style={{ '--len': 26 }} d="M8.1 10.4V7.6a3.9 3.9 0 0 1 7.8 0v2.8" />
      <circle className="draw keyhole" style={{ '--len': 10 }} cx="12" cy="15" r="1.5" />
      <path className="draw" style={{ '--len': 6 }} d="M12 16.5v2.1" />
    </svg>
  ),
  /* Data-sovereignty — a bounded globe */
  'Data-sovereignty': (
    <svg viewBox="0 0 24 24" className="ch-anim-shield">
      <circle className="draw" style={{ '--len': 54 }} cx="12" cy="12" r="8.6" />
      <path className="draw" style={{ '--len': 18 }} d="M3.4 12h17.2" />
      <path className="draw" style={{ '--len': 36 }} d="M12 3.4c2.2 2.4 3.3 5.4 3.3 8.6s-1.1 6.2-3.3 8.6c-2.2-2.4-3.3-5.4-3.3-8.6S9.8 5.8 12 3.4z" />
      <circle className="draw heart" style={{ '--len': 10 }} cx="12" cy="12" r="1.8" />
    </svg>
  ),
  /* AI-adoption — a chip with a rising signal */
  'AI-adoption': (
    <svg viewBox="0 0 24 24" className="ch-anim-alert">
      <rect className="draw" style={{ '--len': 44 }} x="6" y="6" width="12" height="12" rx="2.6" />
      <path className="draw" style={{ '--len': 26 }} d="M9.2 2.8v3.2M14.8 2.8v3.2M9.2 18v3.2M14.8 18v3.2" />
      <path className="draw" style={{ '--len': 26 }} d="M2.8 9.2h3.2M2.8 14.8h3.2M18 9.2h3.2M18 14.8h3.2" />
      <path className="beat" d="M8.8 14.4l2.3-2.8 1.8 1.6 2.3-3" />
    </svg>
  ),

  /* —— Future of Work ——————————————————————————————————————————— */
  /* Organisational adaptation — a team structure rearranging */
  'Organisational adaptation': (
    <svg viewBox="0 0 24 24" className="ch-anim-scatter">
      <rect className="draw node" style={{ '--len': 22 }} x="9" y="2.4" width="6" height="5" rx="1.5" />
      <rect className="draw node" style={{ '--len': 22 }} x="2.4" y="16.2" width="6" height="5" rx="1.5" />
      <rect className="draw node" style={{ '--len': 22 }} x="15.6" y="16.2" width="6" height="5" rx="1.5" />
      <path className="draw" style={{ '--len': 24 }} d="M12 7.4v4.2M5.4 16.2v-4.6h13.2v4.6" />
    </svg>
  ),
  /* Generic training — one identical module for everyone */
  'Generic training': (
    <svg viewBox="0 0 24 24" className="ch-anim-key">
      <rect className="draw" style={{ '--len': 46 }} x="3.4" y="6.6" width="17.2" height="11.6" rx="2.2" />
      <path className="draw" style={{ '--len': 18 }} d="M3.4 10.6h17.2" />
      <circle className="draw keyhole" style={{ '--len': 10 }} cx="7.8" cy="14.4" r="1.4" />
      <path className="draw" style={{ '--len': 14 }} d="M11.2 14.4h6" />
    </svg>
  ),
  /* Skills gap — two levels with a break between them */
  'Skills gap': (
    <svg viewBox="0 0 24 24" className="ch-anim-scatter">
      <path className="draw node" style={{ '--len': 22 }} d="M2.6 20.4v-6.2h5.6v6.2" />
      <path className="draw node" style={{ '--len': 26 }} d="M15.8 20.4V7.2h5.6v13.2" />
      <path className="draw" style={{ '--len': 10 }} d="M9.6 13.8h1.8M12.6 13.8h1.8" />
      <path className="draw" style={{ '--len': 10 }} d="M12 10.6V8.4" />
    </svg>
  ),
  /* Foresight — seeing what is coming */
  Foresight: (
    <svg viewBox="0 0 24 24" className="ch-anim-key">
      <path className="draw" style={{ '--len': 48 }} d="M2.2 12s3.7-6.1 9.8-6.1S21.8 12 21.8 12s-3.7 6.1-9.8 6.1S2.2 12 2.2 12z" />
      <circle className="draw keyhole" style={{ '--len': 16 }} cx="12" cy="12" r="2.6" />
    </svg>
  ),
  /* Personalised learning — a path shaped to one person */
  'Personalised learning': (
    <svg viewBox="0 0 24 24" className="ch-anim-shield">
      <path className="draw" style={{ '--len': 46 }} d="M3.6 20.2v-9.4l7-3.6 7 3.6v9.4" />
      <path className="draw" style={{ '--len': 16 }} d="M3.6 10.8h14" />
      <circle className="draw" style={{ '--len': 14 }} cx="10.6" cy="14.4" r="2" />
      <path className="draw heart" style={{ '--len': 18 }} d="M19.4 3.4l.8 1.8 1.8.8-1.8.8-.8 1.8-.8-1.8-1.8-.8 1.8-.8z" />
    </svg>
  ),

  /* Fragmented data — disconnected nodes with broken links */
  'Fragmented data': (
    <svg viewBox="0 0 24 24" className="ch-anim-scatter">
      <rect className="draw node" style={{ '--len': 24 }} x="3" y="3" width="6" height="6" rx="1.5" />
      <rect className="draw node" style={{ '--len': 24 }} x="15" y="4.5" width="6" height="6" rx="1.5" />
      <rect className="draw node" style={{ '--len': 24 }} x="7.5" y="15" width="6" height="6" rx="1.5" />
      <path className="draw" style={{ '--len': 8 }} d="M9.5 6.5h1.6M13 7h1.5" />
      <path className="draw" style={{ '--len': 8 }} d="M7 10.5l.8 1.6M9.4 13.2l.4.9" />
    </svg>
  ),
  /* Data ownership — a personal record with a key */
  'Data ownership': (
    <svg viewBox="0 0 24 24" className="ch-anim-key">
      <circle className="draw" style={{ '--len': 20 }} cx="9" cy="8" r="3.2" />
      <path className="draw" style={{ '--len': 22 }} d="M3 20c.6-3.4 3.1-5.6 6-5.6 1.3 0 2.5.4 3.4 1.1" />
      <circle className="draw keyhole" style={{ '--len': 12 }} cx="17" cy="14.5" r="2" />
      <path className="draw" style={{ '--len': 12 }} d="M17 16.5V21M17 19h1.8" />
    </svg>
  ),
  /* Reactive care — a heartbeat triggered by an alert */
  'Reactive care': (
    <svg viewBox="0 0 24 24" className="ch-anim-alert">
      <path className="draw" style={{ '--len': 46 }} d="M2 13h4l2-5 3 10 2.5-7 1.5 2h7" />
      <path className="beat" d="M2 13h4l2-5 3 10 2.5-7 1.5 2h7" strokeOpacity=".9" />
      <path className="draw" style={{ '--len': 6 }} d="M19 3.5v3" />
      <circle cx="19" cy="9" r=".4" style={{ fill: 'currentColor' }} />
    </svg>
  ),
  /* Preventive care — a shield protecting a heart */
  'Preventive care': (
    <svg viewBox="0 0 24 24" className="ch-anim-shield">
      <path className="draw" style={{ '--len': 56 }} d="M12 2.8l7.5 3v5.6c0 4.8-3.2 8.2-7.5 9.8-4.3-1.6-7.5-5-7.5-9.8V5.8z" />
      <path className="draw heart" style={{ '--len': 24 }} d="M12 15.8s-3.6-2.2-3.6-4.6c0-1.2.9-2.1 2-2.1.7 0 1.3.4 1.6.9.3-.5.9-.9 1.6-.9 1.1 0 2 .9 2 2.1 0 2.4-3.6 4.6-3.6 4.6z" />
    </svg>
  ),
  /* Compliance — a verified document */
  Compliance: (
    <svg viewBox="0 0 24 24" className="ch-anim-check">
      <path className="draw" style={{ '--len': 60 }} d="M14 2.8H7a2 2 0 0 0-2 2v14.4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7.8z" />
      <path className="draw" style={{ '--len': 12 }} d="M14 2.8v5h5" />
      <path className="draw" style={{ '--len': 8 }} d="M8.5 11h4" />
      <path className="tick" d="M8.8 15.6l2 2 4.2-4.4" />
    </svg>
  ),
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function ChallengePanel({ heading, keywords = [], paragraphs = [] }) {
  const ref = useRef(null)
  // Armed only once JS runs, so the content is fully visible without it.
  const [phase, setPhase] = useState('')

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      setPhase('is-visible')
      return undefined
    }

    setPhase('is-armed')
    let seen = false
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          seen = true
          setPhase('is-visible')
        } else if (seen) {
          // Idle icon loops pause while the section is off-screen.
          setPhase('is-visible is-offscreen')
        }
      },
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section ref={ref} className={`challenge${phase ? ` ${phase}` : ''}`} aria-labelledby="challenge-title">
      <div className="challenge__grid">
        <div className="challenge__frame">
          <span className="challenge__corner challenge__corner--tl" aria-hidden="true" />
          <span className="challenge__corner challenge__corner--br" aria-hidden="true" />

          <div className="challenge__visual">
            <span className="challenge__ring" aria-hidden="true" />

            <h2 className="challenge__title" id="challenge-title">
              {heading}
            </h2>

            <ul className="challenge__list">
              {keywords.map((label, i) => (
                <li key={label} className="challenge__item" style={{ '--i': i }}>
                  {ICONS[label] ? (
                    <span className="challenge__icon" aria-hidden="true">
                      {ICONS[label]}
                    </span>
                  ) : null}
                  <span className="challenge__label">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="challenge__copy">
          {paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </div>
      </div>
    </section>
  )
}
