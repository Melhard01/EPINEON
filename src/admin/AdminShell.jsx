import { Link, useLocation } from 'react-router-dom'
import './admin.css'
import { Seo } from '../components/Seo'
import { useAdminAuth } from './useAdminAuth.js'

const NAV = [
  { to: '/admin', label: 'Overview' },
  { to: '/admin/messages', label: 'Messages' },
  { to: '/admin/team', label: 'Team access' },
]

/**
 * Chrome for the admin area. Deliberately separate from PageShell so the
 * dashboard does not inherit the marketing header, footer or scroll
 * animations — but it still renders <Seo noindex> so the prerender step bakes
 * `noindex,nofollow` into the static HTML.
 */
export function AdminShell({ title, heading, children, actions }) {
  const { email, signOut, status } = useAdminAuth()
  const { pathname } = useLocation()

  return (
    <div className="admin-root">
      <Seo title={`${title} — Epineon Admin`} description="Epineon internal dashboard." path={pathname} noindex />
      <header className="admin-topbar">
        <div className="admin-topbar__inner">
          <Link to="/admin" className="admin-brand">
            Epineon <span>Admin</span>
          </Link>
          {status === 'authorised' ? (
            <nav className="admin-nav" aria-label="Admin sections">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`admin-nav__link${pathname === item.to ? ' is-active' : ''}`}
                  aria-current={pathname === item.to ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}
          {email ? (
            <div className="admin-account">
              <span className="admin-account__email">{email}</span>
              <button type="button" className="admin-btn admin-btn--quiet" onClick={signOut}>
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-container">
          <div className="admin-page-head">
            <h1 className="admin-h1">{heading}</h1>
            {actions ? <div className="admin-page-actions">{actions}</div> : null}
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
