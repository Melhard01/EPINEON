import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { PageShell } from '../components/PageShell'

export default function NotFound() {
  return (
    <PageShell title="Page not found" description="This page doesn't exist." path="/404" noindex>
      <section className="pt-32 pb-24 lg:pt-44 lg:pb-32">
        <div className="site-content min-w-0">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c9a227]">Not found</p>
            <h1 className="epineon-h2 epineon-section-title mt-3 text-7xl text-slate-900 lg:text-8xl">404</h1>
            <p className="epineon-body-large mt-5 text-white/75 text-base leading-relaxed lg:text-lg">
              This page doesn&apos;t exist.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4">
              <Button asChild className="epineon-btn-primary rounded-full px-9 py-4 text-base">
                <Link to="/">Go to homepage →</Link>
              </Button>
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-6">
                <Link to="/products" className="text-sm font-medium text-[#c9a227] hover:text-[#e8c95a]">
                  Browse our products →
                </Link>
                <Link to="/contact#sales" className="text-sm font-medium text-[#c9a227] hover:text-[#e8c95a]">
                  Talk to us →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
