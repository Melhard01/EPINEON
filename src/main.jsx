import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import './index.css'
import { ScrollToTop } from './components/ScrollToTop.jsx'
import { AppRoutes } from './AppRoutes.jsx'

// The prerendered markup in #root is for crawlers and first paint; createRoot replaces it
// with a fresh client render, so client behaviour is identical to the pre-SSR build.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <ScrollToTop />
      <AppRoutes />
    </Router>
  </StrictMode>,
)
