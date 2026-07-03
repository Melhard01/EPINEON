import React from 'react'
import { ShieldCheck, Users, HeartHandshake, Layers, Sparkles } from 'lucide-react'
import { PageShell } from '../../components/PageShell'
import { FinalCTA } from '../../components/home/FinalCTA'

const BELIEF_ITEMS = [
  {
    icon: ShieldCheck,
    lead: 'We build for environments where being wrong isn’t an option',
    body: '— and we hold ourselves to that standard.',
  },
  {
    icon: Users,
    lead: 'Senior people, small teams, real ownership.',
    body: 'No layers between you and the work.',
  },
  {
    icon: HeartHandshake,
    lead: 'Human agency is the point.',
    body: 'We build AI that extends judgement, never replaces it.',
  },
  {
    icon: Layers,
    lead: 'Three frontiers, one company.',
    body: 'Work across security, health and foresight without changing employers.',
  },
]

export default function Careers() {
  return (
    <PageShell
      title="Careers"
      description="Work on problems that actually matter — private AI, post-quantum security, precision health and foresight."
      path="/company/careers"
    >
      <section className="careers-section relative overflow-x-clip pt-32 pb-24 lg:pt-40 lg:pb-32">
        <div className="careers-section__bg" aria-hidden>
          <div className="careers-section__glow careers-section__glow--left" />
          <div className="careers-section__glow careers-section__glow--right" />
        </div>

        <div className="site-content relative z-10 min-w-0">
          <header className="careers-hero mx-auto max-w-3xl scroll-animate text-center">
            <span className="careers-hero__mark" aria-hidden>
              <Sparkles className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <p className="careers-hero__eyebrow text-sm font-semibold uppercase tracking-[0.22em] text-[#c9a227]">Careers</p>
            <h1 className="careers-hero__title epineon-section-lead mt-3 text-balance">
              <span className="careers-hero__emph">Work on problems</span>{' '}
              <span className="careers-hero__muted">that actually matter.</span>
            </h1>
            <p className="careers-hero__lead epineon-body-large text-center">
              We hire deliberately, and rarely. We&apos;re looking for builders who want to work on private AI,
              post-quantum security, precision health and foresight — where the stakes are real and the bar is high.
            </p>
          </header>

          <div className="careers-beliefs-grid mx-auto mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-12 lg:mt-24 lg:gap-x-14 lg:gap-y-16">
            {BELIEF_ITEMS.map((item, i) => {
              const Icon = item.icon
              return (
                <article
                  key={item.lead}
                  className={`careers-belief-item scroll-animate scroll-animate-delay-${i + 1}`}
                >
                  <span className="careers-belief-item__icon" aria-hidden>
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <h2 className="careers-belief-item__lead">{item.lead}</h2>
                  <p className="careers-belief-item__body">{item.body}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <FinalCTA />
    </PageShell>
  )
}
