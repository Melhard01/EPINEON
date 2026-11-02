import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { PageShell } from '../components/PageShell'
import { ContactFormSelect } from '../components/contact/ContactFormSelect'
import CursorGrid from '../components/visuals/CursorGrid'
import { ALL_PRODUCTS } from '../data/ecosystem.js'

// Same-origin Vercel function by default. VITE_API_BASE_URL still overrides it so a
// separate backend can be pointed at during development.
const CONTACT_SUBMIT_URL = (() => {
  const base =
    typeof import.meta.env.VITE_API_BASE_URL === 'string'
      ? import.meta.env.VITE_API_BASE_URL.trim().replace(/\/+$/, '')
      : ''
  return base ? `${base}/api/contact` : '/api/contact'
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
      {
        name: 'product',
        label: 'Product of interest',
        type: 'select',
        required: true,
        options: PRODUCT_OPTIONS,
        placeholder: 'Select a product',
      },
      { name: 'useCase', label: 'Use case', type: 'select', required: true, options: USE_CASES, placeholder: 'Select…' },
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

const inputClass = 'contact-form-field contact-input'

// The cursor grid only has meaning with a pointer, and it only has room inside
// the split card, so it is not mounted at all below the two-column breakpoint.
const CURSOR_GRID_MIN = 1024

function useMinWidth(px) {
  const [matches, setMatches] = useState(
    () => (typeof window !== 'undefined' ? window.matchMedia(`(min-width: ${px}px)`).matches : false),
  )

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${px}px)`)
    const onChange = () => setMatches(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [px])

  return matches
}

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
  const showCursorGrid = useMinWidth(CURSOR_GRID_MIN)
  // Abuse checks the visitor never sees: a field bots fill in, and how long the
  // form was open. Both are validated server-side.
  const [honeypot, setHoneypot] = useState('')
  const formStartedAt = useRef(Date.now())

  useEffect(() => {
    const next = resolveFromHash(hash)
    setMode(next.mode)
    setInquireId(next.inquireId)
  }, [hash])

  useEffect(() => {
    if (!productParam || !PRODUCT_OPTIONS.includes(productParam)) return
    setValues((v) => ({ ...v, product: productParam }))
    if (hash === '#sales') {
      setMode('inquire')
      setInquireId('sales')
    } else {
      setMode('demo')
    }
  }, [productParam, hash])

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
  const onSelectChange = (name, value) => setValues((v) => ({ ...v, [name]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (status.submitting) return

    const missingRequired = tab.fields.some(
      (f) => f.required && !String(values[f.name] ?? '').trim(),
    )
    if (missingRequired) {
      setStatus({
        submitting: false,
        submitted: false,
        error: 'Please complete all required fields.',
      })
      return
    }

    const url = CONTACT_SUBMIT_URL
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http://')) {
      setStatus({ submitting: false, submitted: false, error: 'The contact API URL is not secure. Email contact@epineon.ai.' })
      return
    }

    // Compose a single message body from this tab's fields (backend takes name/email/message).
    const name = (values.name || '').trim()
    const email = (values.email || '').trim()
    // Sent as its own field as well as inside the body, so the dashboard can
    // show it as a column. The partnerships tab calls this "Organization".
    const company = (values.company || values.organization || '').trim()
    const extraLines = tab.fields
      .filter((f) => !['name', 'email'].includes(f.name))
      .map((f) => `${f.label}: ${(values[f.name] || '').trim() || '—'}`)
    const message = `[${tab.label}]\n${extraLines.join('\n')}`

    setStatus({ submitting: true, submitted: false, error: null })
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          subject: tab.label,
          message,
          company,
          // Which form this is. The id only — the server looks the display name
          // up in its own registry (api/_lib/forms.js) and ignores any name
          // sent from here, so this cannot decide where the message files.
          formId: tab.id,
          companyWebsite: honeypot,
          formStartedAt: formStartedAt.current,
          sourcePath: '/contact',
        }),
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
    <PageShell
      title="Contact Epineon"
      description="Request a product demo, or talk to Epineon's sales and partnerships teams."
      path="/contact"
    >
      <section className="careers-section contact-page--refined relative overflow-x-clip pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="careers-section__bg" aria-hidden>
          <div className="careers-section__glow careers-section__glow--left" />
          <div className="careers-section__glow careers-section__glow--right" />
        </div>
        <div className="site-content relative z-10 min-w-0">
          {/* Form on the left, narrative on the right (lg+). DOM order stays
              heading → path → form so reading and tab order follow the task. */}
          <div className="contact-layout">
            <div className="contact-intro">
              {showCursorGrid ? (
                <div className="contact-intro__grid" aria-hidden>
                  <CursorGrid
                    cellSize={58}
                    color="#c9a227"
                    gridColor="#ffffff"
                    gridStyle="lines"
                    radius={150}
                    falloff="smooth"
                    holdTime={380}
                    fadeDuration={900}
                    maxOpacity={0.55}
                    fillOpacity={0.05}
                    gridOpacity={0.055}
                    spotlight={0.5}
                    edgeFade={0.28}
                  />
                </div>
              ) : null}
              <p className="contact-intro__eyebrow">Contact</p>
              <h1 className="epineon-h2 epineon-section-title contact-intro__title text-slate-900">Talk to Us</h1>
              <p className="epineon-body-large contact-intro__lead">
                Choose the path that fits, and the right team will get back within 24 hours.
              </p>

              {/* Primary CTAs: Demo vs Inquire */}
              <div className="contact-tabs" role="tablist" aria-label="Contact paths">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'demo'}
                  onClick={() => switchMode('demo')}
                  className={`contact-tab${mode === 'demo' ? ' is-active' : ''}`}
                >
                  Demo
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'inquire'}
                  onClick={() => switchMode('inquire')}
                  className={`contact-tab${mode === 'inquire' ? ' is-active' : ''}`}
                >
                  Inquire
                </button>
              </div>

              {/* Secondary tabs under Inquire */}
              {mode === 'inquire' ? (
                <div className="contact-tabs contact-tabs--sub" role="tablist" aria-label="Inquiry type">
                  {INQUIRE_TABS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={t.id === inquireId}
                      onClick={() => switchInquire(t.id)}
                      className={`contact-tab contact-tab--sub${t.id === inquireId ? ' is-active' : ''}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              ) : null}

              <p className="contact-intro__blurb">{tab.blurb}</p>
            </div>

            <div className="contact-formcol">
              <div className="contact-panel">
                {status.submitted ? (
                  <div className="contact-success">
                    <CheckCircle className="contact-success__icon" aria-hidden />
                    <h3 className="epineon-h3 contact-success__title">Sent.</h3>
                    <p className="contact-success__body">
                      The right team will be in touch within 24 hours.
                    </p>
                    <Button
                      onClick={() => setStatus({ submitting: false, submitted: false, error: null })}
                      className="contact-submit contact-submit--quiet"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="contact-form" noValidate={false}>
                    {status.error && (
                      <div className="contact-alert" role="alert">
                        <AlertCircle className="contact-alert__icon" aria-hidden />
                        <p className="contact-alert__text">{status.error}</p>
                      </div>
                    )}

                    {/* Honeypot: off-screen, not tabbable, hidden from assistive tech. */}
                    <div className="contact-hp" aria-hidden>
                      <label htmlFor="company-website">Company website</label>
                      <input
                        id="company-website"
                        name="company_website"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                      />
                    </div>

                    {tab.fields.map((f) => (
                      <div key={f.name} className="contact-field">
                        <label htmlFor={`f-${f.name}`} className="contact-field__label">
                          {f.label}
                          {!f.required ? <span className="contact-field__optional"> (optional)</span> : null}
                        </label>
                        {f.type === 'textarea' ? (
                          <textarea
                            id={`f-${f.name}`}
                            name={f.name}
                            rows={4}
                            value={values[f.name] || ''}
                            onChange={onChange}
                            required={f.required}
                            disabled={status.submitting}
                            placeholder={f.placeholder || ''}
                            className={`${inputClass} contact-input--area`}
                          />
                        ) : f.type === 'select' ? (
                          <ContactFormSelect
                            id={`f-${f.name}`}
                            name={f.name}
                            value={values[f.name] || ''}
                            options={f.options}
                            placeholder={f.placeholder || 'Select…'}
                            required={f.required}
                            disabled={status.submitting}
                            onChange={onSelectChange}
                          />
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
                        {f.help ? <p className="contact-field__help">{f.help}</p> : null}
                      </div>
                    ))}

                    <Button type="submit" className="contact-submit" disabled={status.submitting}>
                      {status.submitting ? 'Sending…' : mode === 'demo' ? 'Request my demo' : 'Send enquiry'}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
