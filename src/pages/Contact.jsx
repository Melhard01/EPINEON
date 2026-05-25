import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { PageShell } from '../components/PageShell'
import { ALL_PRODUCTS } from '../data/ecosystem.js'

const CONTACT_SUBMIT_URL = (() => {
  const base =
    typeof import.meta.env.VITE_API_BASE_URL === 'string'
      ? import.meta.env.VITE_API_BASE_URL.trim().replace(/\/+$/, '')
      : ''
  return base ? `${base}/api/submit` : '/api/submit'
})()

const USE_CASES = [
  'Enterprise AI security',
  'Health & wellness',
  'Future intelligence / upskilling',
  'Multiple ecosystems',
  'Other',
]

const PRODUCT_OPTIONS = [...ALL_PRODUCTS.map((p) => p.name), 'Multiple products', 'Not sure yet']

// Demo path — a tailored product demo. Product can be prefilled via ?product=<name>.
const DEMO_FORM = {
  id: 'demo',
  label: 'Demo request',
  blurb: 'See Epineon in action. Tell us which product you’d like to explore and we’ll set up a tailored demo.',
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'Work email', type: 'email', required: true, help: 'We’ll only use this to reply to your request.' },
    { name: 'company', label: 'Company or organisation', type: 'text', required: true },
    { name: 'role', label: 'Role', type: 'text', required: false },
    { name: 'product', label: 'Product of interest', type: 'select', required: true, options: PRODUCT_OPTIONS, placeholder: 'Select a product' },
    {
      name: 'message',
      label: 'What would you like to see?',
      type: 'textarea',
      required: false,
      placeholder: 'Tell us which product or use case you’d like to explore, and any constraints we should know about (data residency, sector, timeline).',
    },
  ],
}

// Inquire sub-paths: which fields show + how to label the composed enquiry.
const INQUIRE_TABS = [
  {
    id: 'sales',
    label: 'Sales & Enterprise',
    blurb: 'For enterprises and institutions evaluating Epineon.',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'email', label: 'Work email', type: 'email', required: true },
      { name: 'company', label: 'Company', type: 'text', required: true },
      { name: 'role', label: 'Role', type: 'text', required: false },
      { name: 'useCase', label: 'Use case', type: 'select', required: true, options: USE_CASES },
      { name: 'message', label: 'Message', type: 'textarea', required: true },
    ],
  },
  {
    id: 'partnerships',
    label: 'Partnerships & Ventures',
    blurb: 'For founders, universities, and research partners.',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'organization', label: 'Organization', type: 'text', required: true },
      { name: 'nature', label: 'Nature of partnership', type: 'textarea', required: true },
    ],
  },
]

function resolveFromHash(hash) {
  if (hash === '#sales') return { mode: 'inquire', inquireId: 'sales' }
  if (hash === '#partnerships') return { mode: 'inquire', inquireId: 'partnerships' }
  return { mode: 'demo', inquireId: 'sales' }
}

const inputClass =
  'w-full px-3 lg:px-4 py-3.5 lg:py-4 min-h-[3rem] bg-slate-100 border border-neutral-300 rounded-lg text-slate-800 focus:border-black focus:outline-none text-sm lg:text-base'

export default function Contact() {
  const { hash, search } = useLocation()
  const productParam = new URLSearchParams(search).get('product') || ''

  const initial = resolveFromHash(hash)
  const [mode, setMode] = useState(initial.mode) // 'demo' | 'inquire'
  const [inquireId, setInquireId] = useState(initial.inquireId) // 'sales' | 'partnerships'
  const [values, setValues] = useState(() =>
    productParam && PRODUCT_OPTIONS.includes(productParam) ? { product: productParam } : {},
  )
  const [status, setStatus] = useState({ submitting: false, submitted: false, error: null })

  useEffect(() => {
    const next = resolveFromHash(hash)
    setMode(next.mode)
    setInquireId(next.inquireId)
  }, [hash])

  useEffect(() => {
    if (productParam) {
      setMode('demo')
      if (PRODUCT_OPTIONS.includes(productParam)) {
        setValues((v) => ({ ...v, product: productParam }))
      }
    }
  }, [productParam])

  const tab = mode === 'demo' ? DEMO_FORM : INQUIRE_TABS.find((t) => t.id === inquireId)

  const resetStatus = () => setStatus({ submitting: false, submitted: false, error: null })
  const setHash = (h) => {
    if (typeof window !== 'undefined') window.history.replaceState(null, '', h)
  }

  const switchMode = (m) => {
    setMode(m)
    resetStatus()
    setHash(m === 'demo' ? '#demo' : `#${inquireId}`)
  }

  const switchInquire = (id) => {
    setMode('inquire')
    setInquireId(id)
    resetStatus()
    setHash(`#${id}`)
  }

  const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (status.submitting) return

    const url = CONTACT_SUBMIT_URL
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http://')) {
      setStatus({ submitting: false, submitted: false, error: 'The contact API URL is not secure. Email contact@epineon.ai.' })
      return
    }

    // Compose a single message body from this tab's fields (backend takes name/email/message).
    const name = (values.name || '').trim()
    const email = (values.email || '').trim()
    const extraLines = tab.fields
      .filter((f) => !['name', 'email'].includes(f.name))
      .map((f) => `${f.label}: ${(values[f.name] || '').trim() || '—'}`)
    const message = `[${tab.label}]\n${extraLines.join('\n')}`

    setStatus({ submitting: true, submitted: false, error: null })
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: name, lastName: '', email, message }),
      })
      if (res.ok) {
        setStatus({ submitting: false, submitted: true, error: null })
        setValues({})
        return
      }
      const text = await res.text()
      let msg = ''
      try {
        msg = JSON.parse(text)?.error || ''
      } catch {
        msg = ''
      }
      setStatus({
        submitting: false,
        submitted: false,
        error: msg || 'Something went wrong. Please try again or email us directly at hello@epineon.ai.',
      })
    } catch {
      setStatus({
        submitting: false,
        submitted: false,
        error: 'Something went wrong. Please try again or email us directly at hello@epineon.ai.',
      })
    }
  }

  return (
    <PageShell title="Contact Epineon" description="Talk to our sales or partnerships teams." path="/contact">
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="site-content min-w-0">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c9a227]">Contact</p>
            <h1 className="epineon-h2 epineon-section-title mt-3 text-slate-900">Talk to Us</h1>
            <p className="epineon-body-large mt-5 text-white/75 text-base leading-relaxed lg:text-lg">
              Choose the path that fits, and the right team will get back within 24 hours.
            </p>
          </div>

          {/* Primary CTAs: Demo vs Inquire */}
          <div className="mt-8 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Contact paths">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'demo'}
              onClick={() => switchMode('demo')}
              className={`customers-filter${mode === 'demo' ? ' is-active' : ''}`}
            >
              Demo
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'inquire'}
              onClick={() => switchMode('inquire')}
              className={`customers-filter${mode === 'inquire' ? ' is-active' : ''}`}
            >
              Inquire
            </button>
          </div>

          {/* Secondary tabs under Inquire */}
          {mode === 'inquire' ? (
            <div className="mt-3 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Inquiry type">
              {INQUIRE_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={t.id === inquireId}
                  onClick={() => switchInquire(t.id)}
                  className={`customers-filter${t.id === inquireId ? ' is-active' : ''}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-6 mx-auto max-w-2xl">
            <p className="text-sm text-white/55 text-center">{tab.blurb}</p>
            <Card className="epineon-card mt-4 bg-[#fefefe] text-slate-800 shadow-lg border border-black/10">
              <CardContent className="p-6 sm:p-7 lg:p-9">
                {status.submitted ? (
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 lg:w-16 lg:h-16 text-green-600 mx-auto mb-3 lg:mb-4" />
                    <h3 className="epineon-h3 text-green-600 mb-3 text-lg lg:text-xl">Sent.</h3>
                    <p className="epineon-body text-slate-700 text-sm lg:text-base leading-relaxed">
                      The right team will be in touch within 24 hours.
                    </p>
                    <Button
                      onClick={() => setStatus({ submitting: false, submitted: false, error: null })}
                      className="epineon-btn-primary mt-4 lg:mt-6 w-full sm:w-auto"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
                    {status.error && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 lg:p-4 flex items-center">
                        <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5 text-red-600 mr-2 flex-shrink-0" />
                        <p className="text-red-600 text-sm lg:text-base">{status.error}</p>
                      </div>
                    )}

                    {tab.fields.map((f) => (
                      <div key={f.name}>
                        <label htmlFor={`f-${f.name}`} className="block text-slate-700 mb-2 text-sm lg:text-base">
                          {f.label}
                          {!f.required ? <span className="text-slate-400"> (optional)</span> : null}
                        </label>
                        {f.type === 'textarea' ? (
                          <textarea
                            id={`f-${f.name}`}
                            name={f.name}
                            rows={5}
                            value={values[f.name] || ''}
                            onChange={onChange}
                            required={f.required}
                            disabled={status.submitting}
                            placeholder={f.placeholder || ''}
                            className={`${inputClass} min-h-[8rem] resize-none leading-relaxed`}
                          />
                        ) : f.type === 'select' ? (
                          <select
                            id={`f-${f.name}`}
                            name={f.name}
                            value={values[f.name] || ''}
                            onChange={onChange}
                            required={f.required}
                            disabled={status.submitting}
                            className={inputClass}
                          >
                            <option value="" disabled>{f.placeholder || 'Select…'}</option>
                            {f.options.map((o) => (
                              <option key={o} value={o}>{o}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            id={`f-${f.name}`}
                            type={f.type}
                            name={f.name}
                            value={values[f.name] || ''}
                            onChange={onChange}
                            required={f.required}
                            disabled={status.submitting}
                            placeholder={f.placeholder || ''}
                            className={inputClass}
                          />
                        )}
                        {f.help ? <p className="mt-1.5 text-xs text-slate-500">{f.help}</p> : null}
                      </div>
                    ))}

                    <Button
                      type="submit"
                      className="epineon-btn-primary w-full text-base lg:text-lg py-4 min-h-[3.25rem]"
                      disabled={status.submitting}
                    >
                      {status.submitting ? 'Sending…' : mode === 'demo' ? 'Request my demo' : 'Send enquiry'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            <p className="mt-8 text-sm text-white/45">
              We work across time zones — wherever you are, the right team will reply within one business day.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
