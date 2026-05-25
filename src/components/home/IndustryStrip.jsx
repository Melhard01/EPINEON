import React from 'react'
import { Link } from 'react-router-dom'
import { Landmark, Stethoscope, ShieldCheck, HeartPulse, Briefcase, Megaphone, School, Activity, Building2, ArrowRight } from 'lucide-react'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'

// Audience entry paths (Principle 2 — multiple entry vectors, by role/industry).
const PATHS = [
  { icon: Landmark, label: "I work in finance or banking", href: '/industries/finance-banking' },
  { icon: Stethoscope, label: "I'm a clinician or care provider", href: '/industries/healthcare' },
  { icon: ShieldCheck, label: 'I work in government or defence', href: '/industries/government-defence' },
  { icon: HeartPulse, label: "I'm a wellness coach", href: '/industries/wellness-coaching' },
  { icon: Activity, label: "I'm optimising my own health", href: '/industries/longevity' },
  { icon: Building2, label: 'I run a clinic or health programme', href: '/industries/clinics-organisations' },
  { icon: Briefcase, label: "I lead a company", href: '/industries/enterprise-workforce' },
  { icon: Megaphone, label: "I'm an educator or influencer", href: '/industries/influencers-educators' },
  { icon: School, label: "I work in higher education", href: '/industries/universities-academics' },
]

/** Section 3 — Industry Entry Strip. */
export function IndustryStrip() {
  const [ref, visible] = useScrollAnimation()

  return (
    <section id="industries" className="border-t border-white/5 py-16 lg:py-20" aria-labelledby="find-your-path">
      <div className="site-content min-w-0">
        <h2 id="find-your-path" className="epineon-h2 epineon-section-title text-slate-900">
          Find your path.
        </h2>
        <div ref={ref} className={`mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4 scroll-animate ${visible ? 'visible' : ''}`}>
          {PATHS.map((path) => {
            const Icon = path.icon
            return (
              <Link key={path.label} to={path.href} className="industry-pill group">
                <Icon className="industry-pill-icon" aria-hidden />
                <span className="industry-pill-label">{path.label}</span>
                <ArrowRight className="industry-pill-arrow" aria-hidden />
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
