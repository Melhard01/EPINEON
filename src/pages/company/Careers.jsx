import React, { useState } from 'react'
import { PageShell } from '../../components/PageShell'

const BELIEFS = [
  'We build for environments where being wrong isn’t an option — and we hold ourselves to that standard.',
  'Senior people, small teams, real ownership. No layers between you and the work.',
  'Human agency is the point. We build AI that extends judgement, never replaces it.',
  'Three frontiers, one company. Work across security, health and foresight without changing employers.',
]

export default function Careers() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  const onSubmit = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setDone(true) // TODO: wire to a real openings-alert list
  }

  return (
    <PageShell
      title="Careers"
      description="Work on problems that actually matter — private AI, post-quantum security, precision health and foresight."
      path="/company/careers"
    >
      <section className="pt-32 pb-24 lg:pt-40 lg:pb-32">
        <div className="site-content min-w-0">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c9a227]">Careers</p>
            <h1 className="epineon-h2 epineon-section-title mt-3 text-slate-900">
              Work on problems that actually matter.
            </h1>
            <p className="epineon-body-large mt-5 text-white/80 text-lg leading-relaxed">
              We hire deliberately, and rarely. We&apos;re looking for builders who want to work on private AI,
              post-quantum security, precision health and foresight — where the stakes are real and the bar is high.
              Leave your email and we&apos;ll reach out when a role fits.
            </p>

            {done ? (
              <p className="mt-8 text-base text-[#c9a227]">Thanks — we&apos;ll be in touch when something opens.</p>
            ) : (
              <form onSubmit={onSubmit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
                <label htmlFor="careers-email" className="sr-only">Email address</label>
                <input
                  id="careers-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="newsletter-input min-w-0 flex-1 rounded-full px-5 py-3.5 text-sm"
                />
                <button type="submit" className="epineon-btn-primary rounded-full px-7 py-3.5 text-sm font-semibold">
                  Keep me posted
                </button>
              </form>
            )}
          </div>

          <ul className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6">
            {BELIEFS.map((b) => (
              <li key={b} className="epineon-card p-6 text-left">
                <p className="epineon-body text-white/75 text-sm leading-relaxed lg:text-base">{b}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  )
}
