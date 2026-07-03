import React from 'react'
import { PageShell } from '../../components/PageShell'

export default function Press() {
  return (
    <PageShell
      title="Press & Media"
      description="News, announcements, and media resources from Epineon."
      path="/company/press"
      noindex
    >
      <section className="pt-32 pb-24 lg:pt-40 lg:pb-32">
        <div className="site-content min-w-0">
          <div className="max-w-3xl">
            <p className="epineon-eyebrow-pill">Company</p>
            <h1 className="epineon-h2 epineon-section-title mt-3 text-slate-900">Press &amp; Media</h1>
            <p className="epineon-body-large mt-5 text-white/80 text-base leading-relaxed lg:text-lg">
              Announcements and media resources will be published here. For interviews, assets, or media enquiries,
              reach our team directly.
            </p>
            <p className="epineon-body mt-6 text-white/70 text-sm">
              Media enquiries:{' '}
              <a href="mailto:press@epineon.ai" className="text-[#c9a227] hover:underline">press@epineon.ai</a>
            </p>
            {/* TODO: add press releases, coverage links, and a downloadable press kit. */}
          </div>
        </div>
      </section>
    </PageShell>
  )
}
