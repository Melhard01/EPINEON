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
import AdminLogin from './pages/admin/Login.jsx'
import AdminSignup from './pages/admin/Signup.jsx'
import AdminDashboard from './pages/admin/Dashboard.jsx'
import AdminMessages from './pages/admin/Messages.jsx'
import AdminTeam from './pages/admin/Team.jsx'
import { RequireAdmin } from './admin/RequireAdmin.jsx'
import { FORMS } from '../api/_lib/forms.js'
import { SOLUTIONS } from './data/solutions.js'
import { INDUSTRIES } from './data/industries.js'

/** Wraps an admin page in the client-side guard. */
function guarded(Component) {
  const Guarded = () => (
    <RequireAdmin>
      <Component />
    </RequireAdmin>
  )
  Guarded.displayName = `Guarded(${Component.name || 'Admin'})`
  return Guarded
}

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

  // Admin area. Prerendered like any other route so a refresh on /admin/messages
  // resolves to a real HTML file instead of a hard 404 — there is no SPA
  // fallback in production. The shells carry noindex; they render no data until
  // the client has a session, and the data itself is gated by RLS.
  { path: '/admin/login', Component: AdminLogin },
  // Unguarded by design: an invitee has no session yet. The page shows no form
  // without a token, and /api/admin/signup re-verifies the token server-side.
  { path: '/admin/signup', Component: AdminSignup },
  { path: '/admin', Component: guarded(AdminDashboard) },
  // The per-form sections are one dynamic route, /admin/messages/:formId,
  // declared in AppRoutes beside the other dynamic ones — a literal path per
  // form would leave useParams() empty and every section would render as "All".
  { path: '/admin/messages', Component: guarded(AdminMessages) },
  { path: '/admin/team', Component: guarded(AdminTeam) },
]

// Every URL that gets a static HTML file at build time. There is no SPA fallback in
// production, so a route missing from this list is a hard 404.
export const PRERENDER_PATHS = [
  ...STATIC_PAGES.map((page) => page.path),
  // One static file per form section, so a refresh on /admin/messages/demo
  // resolves instead of 404ing. The set is closed: /api/contact only ever
  // writes a form_id that came from this same registry.
  ...FORMS.map((form) => `/admin/messages/${form.id}`),
  ...Object.keys(SOLUTIONS).map((slug) => `/solutions/${slug}`),
  ...Object.keys(INDUSTRIES).map((slug) => `/industries/${slug}`),
]
