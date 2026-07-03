import React from 'react'
import { HeartHandshake, Network, ShieldCheck, Rocket, Users } from 'lucide-react'
import { LandingSection } from './LandingSection'

// Partner/client wordmarks. TODO: replace text wordmarks with real logo assets (grayscale).
const CLIENTS = ['Chargea', 'Avenis', 'NeuroLab Institute', 'BioSync Research', 'Meridian Academic Center']

// Static, source-anchored metrics. TODO: verify each figure with a real source before launch.
const METRICS = [
  { value: '30+', label: 'Years of combined R&D', footnote: 'across our founding teams' },
  { value: '100+', label: 'Research partnerships', footnote: 'with universities and institutes' },
  { value: '7', label: 'Products shipping', footnote: 'across three ecosystems' },
]

// Corporate-level differentiators only — no product features (Principle 1).
const ITEMS = [
  {
    icon: HeartHandshake,
    label: 'Human agency by design',
    titleLines: ['Human agency', 'by design'],
    body: 'Every product extends human judgement instead of replacing it — and never trades on extracting your data.',
  },
  {
    icon: Network,
    label: 'One ecosystem, three frontiers',
    titleLines: ['One ecosystem,', 'three frontiers'],
    body: 'Security, precision health and foresight, engineered to work as one rather than as bolt-ons.',
  },
  {
    icon: ShieldCheck,
    label: 'Privacy in the architecture',
    titleLines: ['Privacy in the', 'architecture'],
    body: 'Privacy-preserving by default and quantum-ready where the stakes demand it — not as an afterthought.',
  },
  {
    icon: Rocket,
    label: 'Backed by a venture studio',
    titleLines: ['Backed by a', 'venture studio'],
    body: 'Built and scaled in partnership with leading universities and research institutions.',
  },
  {
    icon: Users,
    label: 'A team that has shipped before',
    titleLines: ['A team that has', 'shipped before'],
    body: 'Veteran builders across AI, cybersecurity, quantum and hardware, with decades of combined, hands-on experience.',
  },
]

/** Section 5 — Why Epineon. */
export function WhyEpineon() {
  return (
    <LandingSection className="border-t border-white/5 py-16 lg:py-24" aria-labelledby="why-epineon">
      <div className="site-content min-w-0">
        <h2 id="why-epineon" className="epineon-h2 epineon-section-title text-slate-900 scroll-animate">
          What sets Epineon apart
        </h2>
        <div className="why-apart-grid mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          {ITEMS.map((item, index) => {
            const Icon = item.icon
            return (
              <article
                key={item.label}
                className={`why-apart-card flex h-full flex-col scroll-animate scroll-animate-delay-${index + 1}`}
              >
                <div className="why-apart-card__header">
                  <span className="why-item-icon lp-icon-chip shrink-0" aria-hidden>
                    <Icon className="why-item-icon__svg" />
                  </span>
                  <h3 className="why-item-label why-apart-card__title min-w-0">
                    {item.titleLines.map((line) => (
                      <span key={line} className="why-apart-card__title-line">
                        {line}
                      </span>
                    ))}
                  </h3>
                </div>
                <p className="why-apart-card__body epineon-body mt-3 flex-1 text-sm leading-relaxed text-slate-700">
                  {item.body}
                </p>
              </article>
            )
          })}
        </div>

        <p className="mt-24 text-center text-sm uppercase tracking-[0.18em] text-white/55 scroll-animate lg:mt-32">
          Trusted by organizations building what comes next.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 scroll-animate scroll-animate-delay-1 lg:mt-12">
          {CLIENTS.map((name) => (
            <span key={name} className="social-logo">
              {name}
            </span>
          ))}
        </div>

        <div className="mt-24 grid grid-cols-1 gap-10 text-center sm:grid-cols-3 scroll-animate scroll-animate-delay-2 lg:mt-32 lg:gap-12">
          {METRICS.map((m, i) => (
            <div key={m.label} className={`min-w-0 scroll-animate scroll-animate-delay-${i + 2}`}>
              <div className="epineon-stat-number text-slate-900 text-3xl sm:text-4xl lg:text-5xl">{m.value}</div>
              <div className="epineon-stat-label mt-1 text-white/75 text-sm sm:text-base">{m.label}</div>
              <div className="mt-1 text-xs text-white/40">{m.footnote}</div>
            </div>
          ))}
        </div>
      </div>
    </LandingSection>
  )
}
