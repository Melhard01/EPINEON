import { Routes, Route } from 'react-router-dom'
import SolutionPage from './pages/SolutionPage.jsx'
import IndustryPage from './pages/IndustryPage.jsx'
import NotFound from './pages/NotFound.jsx'
import AdminMessages from './pages/admin/Messages.jsx'
import { RequireAdmin } from './admin/RequireAdmin.jsx'
import { STATIC_PAGES } from './routes.jsx'

export function AppRoutes() {
  return (
    <Routes>
      {STATIC_PAGES.map((page) => {
        const Component = page.Component
        return <Route key={page.path} path={page.path} element={<Component />} />
      })}
      {/* One section per website form. Guarded like every other admin route;
          the concrete paths are listed in PRERENDER_PATHS so each one ships as
          a real HTML file and a refresh resolves instead of 404ing. */}
      <Route
        path="/admin/messages/:formId"
        element={
          <RequireAdmin>
            <AdminMessages />
          </RequireAdmin>
        }
      />
      <Route path="/solutions/:slug" element={<SolutionPage />} />
      <Route path="/industries/:slug" element={<IndustryPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
