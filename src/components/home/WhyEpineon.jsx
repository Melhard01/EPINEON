import React from 'react'
import { HeartHandshake, Network, ShieldCheck, Rocket, Users } from 'lucide-react'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'

// Corporate-level differentiators only — no product features (Principle 1).
const ITEMS = [
  {
    icon: HeartHandshake,
    label: 'Human agency by design',
    body: 'Every product extends human judgement instead of replacing it — and never trades on extracting your data.',
  },
  {
    icon: Network,
    label: 'One ecosystem, three frontiers',
    body: 'Security, precision health and foresight, engineered to work as one rather than as bolt-ons.',
  },
  {
    icon: ShieldCheck,
    label: 'Privacy in the architecture',
    body: 'Privacy-preserving by default and quantum-ready where the stakes demand it — not as an afterthought.',
  },
  {
    icon: Rocket,
    label: 'Backed by a venture studio',
    body: 'Built and scaled in partnership with leading universities and research institutions.',
  },
  {
    icon: Users,
    label: 'A team that has shipped before',
    body: 'Veteran builders across AI, cybersecurity, quantum and hardware, with decades of combined, hands-on experience.',
  },
]

/** Section 5 — Why Epineon. */
export function WhyEpineon() {
  const [ref, visible] = useScrollAnimation()

  return (
    <section className="border-t border-white/5 py-16 lg:py-24" aria-labelledby="why-epineon">
      <div className="site-content min-w-0">
        <h2 id="why-epineon" className="epineon-h2 epineon-section-title text-slate-900">
          What sets Epineon apart
        </h2>
        <div ref={ref} className={`mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5 scroll-animate ${visible ? 'visible' : ''}`}>
          {ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="why-item">
                <span className="why-item-icon lp-icon-chip" aria-hidden>
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="why-item-label mt-4 text-slate-900">{item.label}</h3>
                <p className="epineon-body mt-2 text-slate-700 text-sm leading-relaxed">{item.body}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
