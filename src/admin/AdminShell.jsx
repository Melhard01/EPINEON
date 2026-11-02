import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Inbox, Users, LogOut, Search } from 'lucide-react'
import './admin.css'
import epineonWordmarkLogo from '../assets/epineon_logo_wordmark.png'
import { Seo } from '../components/Seo'
import { useAdminAuth } from './useAdminAuth.js'
import { adminDisplayName, adminInitial } from './identity.js'

const NAV = [
  { to: '/admin', label: 'Overview', Icon: LayoutDashboard },
  { to: '/admin/messages', label: 'Messages', Icon: Inbox },
  { to: '/admin/team', label: 'Team access', Icon: Users },
]

/** /admin matches only itself; the others also own their sub-routes. */
const isActive = (pathname, to) =>
  to === '/admin' ? pathname === to : pathname === to || pathname.startsWith(`${to}/`)

/**
 * Chrome for the admin area: a fixed left rail plus the page's own header.
 *
 * Deliberately separate from PageShell so the dashboard inherits none of the
 * marketing header, footer or scroll animations — but it still renders
 * <Seo noindex> so the prerender bakes `noindex,nofollow` into the static HTML.
 *
 * Below 1024px the rail becomes a horizontal bar at the top: a drawer would
 * need focus trapping and an overlay for a tool that is overwhelmingly used on
 * a desktop.
 */
export function AdminShell({ title, heading, eyebrow, children, actions }) {
  const { email, signOut, status } = useAdminAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const signedIn = status === 'authorised'

  const onSearch = (event) => {
    event.preventDefault()
    const q = query.trim()
    navigate(q ? `/admin/messages?q=${encodeURIComponent(q)}` : '/admin/messages')
  }

  return (
    <div className="admin-root">
      <Seo title={`${title} — Epineon Admin`} description="Epineon internal dashboard." path={pathname} noindex />

      <div className="admin-shell">
        <aside className="admin-rail">
          <Link to="/admin" className="admin-brand">
            {/* The same wordmark asset the public site header and footer use. */}
            <span className="admin-brand__mark">
              <img src={epineonWordmarkLogo} alt="Epineon" />
            </span>
            <span className="admin-brand__label">Admin</span>
          </Link>

          {signedIn ? (
            <nav className="admin-rail__nav" aria-label="Admin sections">
              {NAV.map((item) => {
                // Assigned to a local rather than destructured in the
                // parameter list: eslint's base no-unused-vars does not see
                // JSX usage, and only `vars` (not args) are covered by the
                // project's ^[A-Z_] ignore pattern. Same shape as About.jsx.
                const Icon = item.Icon
                const active = isActive(pathname, item.to)
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`admin-rail__link${active ? ' is-active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="admin-rail__icon" aria-hidden />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          ) : null}

          {email ? (
            <div className="admin-rail__foot">
              <div className="admin-who">
                <span className="admin-who__disc" aria-hidden>{adminInitial(email)}</span>
                <span className="admin-who__text">
                  <span className="admin-who__name">{adminDisplayName(email)}</span>
                  <span className="admin-who__email">{email}</span>
                </span>
              </div>
              <button type="button" className="admin-btn admin-btn--quiet admin-who__out" onClick={signOut}>
                <LogOut className="admin-rail__icon" aria-hidden />
                Sign out
              </button>
            </div>
          ) : null}
        </aside>

        <div className="admin-canvas">
          <div className="admin-canvas__glow" aria-hidden />
          <div className="admin-container">
            <header className="admin-head">
              <div className="admin-head__titles">
                {eyebrow ? <p className="admin-head__eyebrow">{eyebrow}</p> : null}
                <h1 className="admin-h1">{heading}</h1>
              </div>
              <div className="admin-head__tools">
                {signedIn ? (
                  <form className="admin-headsearch" onSubmit={onSearch} role="search">
                    <Search className="admin-headsearch__icon" aria-hidden />
                    <input
                      className="admin-headsearch__input"
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search submissions"
                      aria-label="Search submissions"
                    />
                  </form>
                ) : null}
                {actions}
              </div>
            </header>

            <main className="admin-main">{children}</main>
          </div>
        </div>
      </div>
    </div>
  )
}
