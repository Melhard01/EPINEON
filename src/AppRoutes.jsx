import { Routes, Route } from 'react-router-dom'
import SolutionPage from './pages/SolutionPage.jsx'
import IndustryPage from './pages/IndustryPage.jsx'
import NotFound from './pages/NotFound.jsx'
import { STATIC_PAGES } from './routes.js'

export function AppRoutes() {
  return (
    <Routes>
      {STATIC_PAGES.map((page) => {
        const Component = page.Component
        return <Route key={page.path} path={page.path} element={<Component />} />
      })}
      <Route path="/solutions/:slug" element={<SolutionPage />} />
      <Route path="/industries/:slug" element={<IndustryPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
