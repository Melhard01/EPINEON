import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from './useAdminAuth.js'
import { AdminShell } from './AdminShell.jsx'

/**
 * Route guard. This is a convenience for the operator, NOT the security
 * boundary — the real enforcement is RLS on the database and requireAdmin() on
 * every /api/admin/* call. Removing this component would change what the page
 * looks like, not what data it can reach.
 */
export function RequireAdmin({ children }) {
  const { status } = useAdminAuth()
  const location = useLocation()

  if (status === 'unconfigured') {
    return (
      <AdminShell title="Setup" heading="Dashboard not configured">
        <p className="admin-empty">
          Supabase is not configured for this build. Set <code>VITE_SUPABASE_URL</code> and{' '}
          <code>VITE_SUPABASE_ANON_KEY</code>, then rebuild. See <code>docs/ADMIN_SETUP.md</code>.
        </p>
      </AdminShell>
    )
  }

  if (status === 'loading') {
    return (
      <AdminShell title="Loading" heading="Loading">
        <p className="admin-empty" role="status">Checking your access…</p>
      </AdminShell>
    )
  }

  if (status === 'signed-out') {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  if (status === 'unauthorised') {
    return (
      <AdminShell title="No access" heading="No access">
        <p className="admin-empty">
          Your account is signed in but is not an approved Epineon administrator. Ask an existing
          administrator to invite you from the Team access page.
        </p>
      </AdminShell>
    )
  }

  return children
}
