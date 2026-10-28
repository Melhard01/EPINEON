import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { AppRoutes } from './AppRoutes.jsx'
import { SeoCollectorContext } from './seo/seoMeta.js'

export { PRERENDER_PATHS } from './routes.js'
export { buildStructuredData } from './seo/structuredData.js'

export function render(url) {
  const seo = {}
  const html = renderToString(
    <StrictMode>
      <SeoCollectorContext.Provider value={seo}>
        <StaticRouter location={url}>
          <AppRoutes />
        </StaticRouter>
      </SeoCollectorContext.Provider>
    </StrictMode>,
  )
  return { html, seo }
}
