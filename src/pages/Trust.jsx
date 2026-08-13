import React from 'react'
import { ShieldCheck, Lock, HeartHandshake, ScrollText } from 'lucide-react'
import { PageShell } from '../components/PageShell'

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

export default function Trust() {
  return (
    <PageShell
      title="Trust Center"
      description="Epineon’s security posture, data-privacy architecture, AI ethics principles, and compliance frameworks."
      path="/trust"
    >
      {/* Hero */}
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16">
        <div className="site-content min-w-0">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c9a227]">Trust Center</p>
            <h1 className="epineon-h2 epineon-section-title mt-3 text-slate-900">Trust, by architecture.</h1>
            <p className="epineon-body-large mt-5 text-white/80 text-lg leading-relaxed">
              Security and privacy aren’t features we add — they’re how the ecosystem is built. Here’s our posture,
              our principles, and the frameworks we hold ourselves to.
            </p>
          </div>
        </div>
      </section>

      {/* Security posture */}
      <section className="border-t border-white/5 py-14 lg:py-20">
        <div className="site-content min-w-0">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-14">
            <h2 className="epineon-h2 epineon-section-title shrink-0 text-slate-900 lg:w-72">Security posture</h2>
            <div className="min-w-0 flex-1 space-y-5">
              <p className="epineon-body-large text-white/75 text-base leading-relaxed lg:text-lg">
                We design for environments that can’t afford to be wrong. That means keeping sensitive data inside
                customer-controlled boundaries, encrypting data in transit and at rest, and adopting quantum-aware
                cryptography where the data’s lifespan demands it.
              </p>
              <p className="epineon-body-large text-white/75 text-base leading-relaxed lg:text-lg">
                For current certification status, audit reports, and security questionnaires, contact{' '}
                <a href="mailto:security@epineon.ai" className="text-[#c9a227] hover:underline">security@epineon.ai</a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance frameworks */}
      <section className="border-t border-white/5 py-14 lg:py-20">
        <div className="site-content min-w-0">
          <h2 className="epineon-h2 epineon-section-title text-slate-900">Compliance frameworks</h2>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6">
            {FRAMEWORKS.map((f) => (
              <div key={f.name} className="epineon-card p-6">
                <h3 className="why-item-label text-slate-900">{f.name}</h3>
                <p className="epineon-body mt-2 text-white/70 text-sm leading-relaxed">{f.relevance}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data privacy architecture */}
      <section className="border-t border-white/5 py-14 lg:py-20">
        <div className="site-content min-w-0">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-14">
            <h2 className="epineon-h2 epineon-section-title shrink-0 text-slate-900 lg:w-72">Data privacy</h2>
            <div className="min-w-0 flex-1 space-y-5">
              <p className="epineon-body-large text-white/75 text-base leading-relaxed lg:text-lg">
                Personal data stays with the person it belongs to. We collect only what a product needs to function,
                keep it encrypted, and give users clear control over it. Each product documents how it handles data
                within its own privacy notice.
              </p>
              {/* TODO: add per-product data-handling summaries (Qaegis, EPIWELL, Epitrust, SoulChain). */}
            </div>
          </div>
        </div>
      </section>

      {/* AI ethics principles */}
      <section className="border-t border-white/5 py-14 lg:py-20">
        <div className="site-content min-w-0">
          <h2 className="epineon-h2 epineon-section-title text-slate-900">AI ethics principles</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
            {PRINCIPLES.map((p) => {
              const Icon = p.icon
              return (
                <div key={p.title} className="why-item">
                  <span className="why-item-icon lp-icon-chip" aria-hidden>
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="why-item-label mt-4 text-slate-900">{p.title}</h3>
                  <p className="epineon-body mt-2 text-white/70 text-sm leading-relaxed">{p.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

    </PageShell>
  )
}
