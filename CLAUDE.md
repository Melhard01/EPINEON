# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Layout note

The git repo and all code live in `epineon-website-corporate-version/` — a subdirectory of the
usual working directory of the same name. Run every command from that inner directory.

## Commands

```bash
npm install          # package-lock.json is the checked-in lockfile (package.json also names pnpm)
npm run dev          # Vite dev server
npm run build        # production build → dist/ (Vercel's buildCommand)
npm run preview      # serve the built dist/
npm run lint         # eslint over the repo (dist/ ignored)
```

There is no test framework, no TypeScript, and no formatter config — the codebase is plain
JSX + ESLint only. Don't add test commands to docs unless a suite is actually introduced.

The dev server proxies `/submit` and `/api/submit` to `http://127.0.0.1:3003` (see
[vite.config.js](vite.config.js)); the backend that serves them is **not** in this repo.
Set `VITE_API_BASE_URL` (origin only, no path) in `.env.local` to point the contact form at a
remote API instead — see [.env.example](.env.example).

## Architecture

A React 19 + Vite SPA: the Epineon corporate **hub**. Its job is to explain the company and
route visitors outbound to individual product sites (Qaegis, EPICRYPT, EpiTrust, …) — the
products themselves are not hosted here.

### Routing and page shells

All routes are declared flat in [src/main.jsx](src/main.jsx) (`BrowserRouter`, no lazy loading,
no nested layout routes). Three shells exist, all rendering the same chrome
(`SiteHeader` + `<main class="page-sections">` + `SiteFooter`) inside a `.landing-page-dark` root:

- [src/App.jsx](src/App.jsx) — the `/` landing page only. Composes the `src/components/home/*`
  sections and adds scroll-snap (`landing-scroll-snap` on `<html>`, `page-sections--snap`).
- [src/components/PageShell.jsx](src/components/PageShell.jsx) — every ordinary page. Wraps
  children, scroll-restores on navigation, and forwards SEO props to `<Seo>`.
- [src/components/LegalDocLayout.jsx](src/components/LegalDocLayout.jsx) — `/privacy`, `/terms`,
  `/cookie-policy` only. Adds the grid background, a `lastUpdated`/`effectiveDate` header and the
  sticky TOC (`tocItems` → [LegalDocTocSidebar](src/components/LegalDocTocSidebar.jsx)), plus
  `src/legal-doc.css`. It does *not* take `PageShell`'s props — SEO description is derived from
  `title`.

New page → add a route in `main.jsx`, wrap the page in `PageShell`, and add the URL to
[public/sitemap.xml](public/sitemap.xml) (or pass `noindex` to `PageShell`, as
`/company/team` and `/company/press` do — they exist but are unlisted).

Deployment is Vercel: [vercel.json](vercel.json) rewrites everything to `/index.html` and holds
the permanent redirects for renamed slugs. Renaming a solution/industry slug means updating the
data file, the sitemap, **and** adding a redirect there. `public/_headers` and `public/_routes.json`
are Cloudflare Pages artifacts from an earlier host.

### Content lives in data modules, not in JSX

`src/data/` is the single source of truth; pages are generic renderers over it.

- [ecosystem.js](src/data/ecosystem.js) — the ecosystem → product map, and `ALL_PRODUCTS`.
  Each product carries `id`, outbound `href`, `status` (`live`/`soon`), `accent`, logo import.
  **Adding a product is one entry here** — the homepage, mega-menu, solution and industry
  pages all pick it up by `id`.
- [solutions.js](src/data/solutions.js) / [industries.js](src/data/industries.js) — keyed by
  URL slug, rendered by the single dynamic
  [SolutionPage.jsx](src/pages/SolutionPage.jsx) / [IndustryPage.jsx](src/pages/IndustryPage.jsx).
  Both reference products via `productIds` and cross-link to each other. An unknown slug renders
  a `noindex` "not found" shell rather than 404ing.
- [navigation.js](src/data/navigation.js) — header nav structure. Products are deliberately
  absent (they come from `ecosystem.js` via the mega-menu).
- [synergeticSolutionsData.js](src/data/synergeticSolutionsData.js) — a *separate*, richer product
  record (logo, copy, phone screenshots via `lib/phoneScreenshot.js`) used by
  [SynergeticSolutions.jsx](src/components/synergetic-solutions/SynergeticSolutions.jsx) and
  `/products`. It overlaps `ecosystem.js` but is not derived from it: a product shown in both
  places must be edited in both.
- [customers.js](src/data/customers.js) / [team.js](src/data/team.js) — customer stories and
  leadership. Both mix real entries with placeholders.

Copy in these files is positioning; `caseStudy`, `customers.js` and `team.js` entries carry `TODO`
markers where facts are unverified — don't present them as confirmed, and don't invent titles,
bios or metrics for real people or companies to fill them in.

### SEO

[src/components/Seo.jsx](src/components/Seo.jsx) is a dependency-free head manager that
**updates the tags already present in `index.html` in place** (title, description, canonical, OG,
Twitter, robots) instead of appending, so sub-pages never emit duplicates. `index.html` holds the
home-page values and doubles as the fallback for non-JS scrapers — per-page social cards would
need prerendering, which does not exist yet.

### Styling

Tailwind v4 via `@tailwindcss/vite` (no `tailwind.config.js`; theme tokens are `@theme inline`
CSS variables in `src/App.css`). Three global stylesheets, imported by both shells:

- [src/index.css](src/index.css) — html/body overflow guards (sections are full-bleed and
  transform-heavy; horizontal scroll regressions come from here).
- [src/App.css](src/App.css) — ~6.5k lines: design tokens plus the `epineon-*`, `site-content`,
  `page-sections` and animation classes used throughout.
- [src/theme-landing-dark.css](src/theme-landing-dark.css) — the dark theme, scoped to
  `.landing-page-dark` with heavy `!important` overrides. All three shells set that class on their
  root div; anything rendered outside it (e.g. portalled UI) will not be themed.
- [src/legal-doc.css](src/legal-doc.css) — imported by `LegalDocLayout` only (`epineon-legal-doc-*`,
  grid background, TOC).

shadcn/ui components live in `src/components/ui/` (new-york style, JSX not TSX, `@/` alias →
`src/`, configured in [components.json](components.json)). Treat them as vendored: prefer
composing above them over editing them.

`package.json` is not a guide to what the site uses — it carries the full shadcn dependency set
plus leftovers (`lenis`, `ogl`, `recharts`, `next-themes`, most `@radix-ui/*`) that no file under
`src/` imports. Grep before assuming a library is wired up; scroll behaviour is plain CSS +
`IntersectionObserver`, not a smooth-scroll library.

### Scroll animations

[usePageSectionAnimations](src/hooks/usePageSectionAnimations.js) is the shared mechanism, called
once per shell. It `IntersectionObserver`s every `<section>` under `<main>` and toggles
`page-section--active` plus `.visible` on descendant `.scroll-animate*` / `.text-reveal`
elements; CSS in `App.css` does the rest. Consequences worth knowing:

- Animation opt-out is per-section via `data-no-section-animate`; non-`<section>` blocks opt in
  via `data-animate-section`.
- Sections start hidden, so a section that never intersects stays invisible.
- `prefers-reduced-motion` activates everything immediately.

### Contact form

[src/pages/Contact.jsx](src/pages/Contact.jsx) drives every path (demo request + inquiry tabs)
from field arrays defined at the top of the file, then flattens all non-name/email fields into a
single `message` string before POSTing `{firstName, lastName, email, message}` to
`${VITE_API_BASE_URL}/api/submit` (or same-origin `/api/submit`). Adding a field means adding it
to the tab's `fields` array only — the backend contract stays fixed.

Cookie consent is homegrown: [lib/cookieUtils.js](src/lib/cookieUtils.js) stores preferences
under the `epineon-cookie-consent` localStorage key, with `canUseAnalytics/Marketing/Functional`
helpers to gate any script you add.
