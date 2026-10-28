import App from './App.jsx'
import PrivacyPolicy from './pages/privacy.jsx'
import TermsAndConditions from './pages/terms.jsx'
import CookiePolicy from './pages/cookie.jsx'
import Contact from './pages/Contact.jsx'
import Products from './pages/Products.jsx'
import About from './pages/company/About.jsx'
import Team from './pages/company/Team.jsx'
import VentureStudio from './pages/company/VentureStudio.jsx'
import Careers from './pages/company/Careers.jsx'
import Press from './pages/company/Press.jsx'
import Trust from './pages/Trust.jsx'
import { SOLUTIONS } from './data/solutions.js'
import { INDUSTRIES } from './data/industries.js'

/** Fixed-path routes. The dynamic /solutions/:slug and /industries/:slug live in AppRoutes. */
export const STATIC_PAGES = [
  { path: '/', Component: App },
  { path: '/privacy', Component: PrivacyPolicy },
  { path: '/terms', Component: TermsAndConditions },
  { path: '/cookie-policy', Component: CookiePolicy },
  { path: '/contact', Component: Contact },
  { path: '/products', Component: Products },
  { path: '/company/about', Component: About },
  { path: '/company/team', Component: Team },
  { path: '/company/venture-studio', Component: VentureStudio },
  { path: '/company/careers', Component: Careers },
  { path: '/company/press', Component: Press },
  { path: '/trust', Component: Trust },
]

// Every URL that gets a static HTML file at build time. There is no SPA fallback in
// production, so a route missing from this list is a hard 404.
export const PRERENDER_PATHS = [
  ...STATIC_PAGES.map((page) => page.path),
  ...Object.keys(SOLUTIONS).map((slug) => `/solutions/${slug}`),
  ...Object.keys(INDUSTRIES).map((slug) => `/industries/${slug}`),
]
