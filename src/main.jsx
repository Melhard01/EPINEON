import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import { ScrollToTop } from './components/ScrollToTop.jsx'
import App from './App.jsx'
import PrivacyPolicy from './pages/privacy.jsx'
import TermsAndConditions from './pages/terms.jsx'
import CookiePolicy from './pages/cookie.jsx'
import Contact from './pages/Contact.jsx'
import SolutionPage from './pages/SolutionPage.jsx'
import IndustryPage from './pages/IndustryPage.jsx'
import Products from './pages/Products.jsx'
import About from './pages/company/About.jsx'
import Team from './pages/company/Team.jsx'
import VentureStudio from './pages/company/VentureStudio.jsx'
import Careers from './pages/company/Careers.jsx'
import Press from './pages/company/Press.jsx'
import Trust from './pages/Trust.jsx'
import NotFound from './pages/NotFound.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/products" element={<Products />} />
        <Route path="/solutions/:slug" element={<SolutionPage />} />
        <Route path="/industries/:slug" element={<IndustryPage />} />
        <Route path="/company/about" element={<About />} />
        <Route path="/company/team" element={<Team />} />
        <Route path="/company/venture-studio" element={<VentureStudio />} />
        <Route path="/company/careers" element={<Careers />} />
        <Route path="/company/press" element={<Press />} />
        <Route path="/trust" element={<Trust />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  </StrictMode>,
)
