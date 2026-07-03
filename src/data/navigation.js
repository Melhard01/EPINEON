/**
 * Corporate-hub navigation structure (single source of truth for the header).
 * Products are NOT here — they live in `ecosystem.js` and render via the mega-menu.
 *
 * Routing rules:
 *  - All top-level nav items resolve to real pages (no anchor-only links).
 *  - External product links live in the mega-menu (ecosystem.js), opened in new tabs.
 */

// Solutions dropdown — organized by job-to-be-done (broad cross-ecosystem outcomes).
export const SOLUTIONS_LINKS = [
  {
    label: 'Trusted AI for regulated industries',
    href: '/solutions/trusted-ai',
    blurb: 'Private, sovereign AI for finance, government, and critical infrastructure.',
  },
  {
    label: 'Precision health intelligence',
    href: '/solutions/precision-health',
    blurb: 'Preventive, data-owned health for clinicians and individuals.',
  },
  {
    label: 'Future of work & learning',
    href: '/solutions/future-of-work',
    blurb: 'Foresight and upskilling for organisations facing AI disruption.',
  },
]

// Industries dropdown — one page per vertical.
export const INDUSTRIES_LINKS = [
  { label: 'Finance & Bank', href: '/industries/finance-banking' },
  { label: 'Healthcare & Clinics', href: '/industries/healthcare' },
  { label: 'Government & Defence', href: '/industries/government-defence' },
  { label: 'Wellness & Coaching', href: '/industries/wellness-coaching' },
  { label: 'Longevity & Personal Health', href: '/industries/longevity' },
  { label: 'Clinics & Organisations', href: '/industries/clinics-organisations' },
  { label: 'Enterprise & Workforce', href: '/industries/enterprise-workforce' },
  { label: 'Influencers & Educators', href: '/industries/influencers-educators' },
  { label: 'Universities & Academics', href: '/industries/universities-academics' },
]

// Company dropdown.
// NOTE: "Vision & Mission" was removed (it's a section of /company/about — avoids two menu
// items opening the same page). Team and Press are hidden for now (routes still exist but
// are unlisted + noindex) until their content is ready.
export const COMPANY_LINKS = [
  { label: 'About', href: '/company/about' },
  { label: 'Venture Studio', href: '/company/venture-studio' },
  { label: 'Careers', href: '/company/careers' },
]

// Utility bar (right-aligned). ("Contact" removed — the Talk to Us CTA already routes to /contact.
// "Trust Center" removed from the top bar; the /trust page still exists and stays indexable.)
export const UTILITY_LINKS = []

export const PRIMARY_CTA = { label: 'Talk to Us', href: '/contact' }

/** Flat list of every internal route the nav points at — used to register routes + sitemap. */
export const NAV_ROUTES = [
  ...SOLUTIONS_LINKS.map((l) => l.href),
  ...INDUSTRIES_LINKS.map((l) => l.href),
  ...COMPANY_LINKS.map((l) => l.href.replace(/#.*$/, '')),
  ...UTILITY_LINKS.map((l) => l.href),
  '/products',
].filter((href, i, arr) => arr.indexOf(href) === i)
