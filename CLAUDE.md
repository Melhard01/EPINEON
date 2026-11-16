# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Layout note

The git repo and all code live in `epineon-website-corporate-version/` — a subdirectory of the
usual working directory of the same name. Run every command from that inner directory.

## Commands

```bash
npm install          # package-lock.json is the checked-in lockfile (package.json also names pnpm)
npm run dev          # Vite dev server
npm run build        # 3 steps: client build → SSR build → prerender (see below)
npm run preview      # serve the built dist/ (no clean-URL rewriting — see Prerendering)
npm run lint         # eslint over the repo (dist/ ignored); 16 pre-existing problems
npm test             # node --test tests/ — 142 tests, no framework

node --test tests/forms.test.js                      # one file
node --test --test-name-pattern="never says" tests/  # one test by name
```

`npm run build` runs `vite build` (client → `dist/`), then `vite build --ssr src/entry-server.jsx`
(→ `.ssr-build/`, gitignored), then [scripts/prerender.mjs](scripts/prerender.mjs), which writes
one static `.html` per route plus `dist/sitemap.xml` and deletes `.ssr-build/`.

There is no TypeScript and no formatter config. Tests are Node's built-in runner over plain
`.test.js` files — no Jest, no Vitest. `tests/fakeSupabase.mjs` is a stand-in for the Supabase
REST and Auth APIs (PostgREST filters, `?select=` projection, filtered PATCH, and a
`missingTables` option that answers as an unapplied migration would), so the real handlers run
unmodified without a live project.

**`dist/` is committed to git.** Every `npm run build` rewrites all 34 pages, so any commit that
runs a build touches them all — and a build made with throwaway env values will commit those
values. Check `dist/` before staging.

The dev server still proxies `/submit` and `/api/submit` to `http://127.0.0.1:3003` (see
[vite.config.js](vite.config.js)), but that is **vestigial** — the contact form now posts to
`/api/contact` in this repo and is not proxied. `VITE_API_BASE_URL` (origin only, no path) still
redirects the form to another origin during development — see [.env.example](.env.example).

## Architecture

A React 19 + Vite SPA: the Epineon corporate **hub**. Its job is to explain the company and
route visitors outbound to individual product sites (EPICRYPT, EpiTrust, …) — the
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

Routes are declared once in [src/routes.js](src/routes.js) (`STATIC_PAGES`, plus the derived
`PRERENDER_PATHS`) and rendered by [src/AppRoutes.jsx](src/AppRoutes.jsx), which both
`main.jsx` (browser, `BrowserRouter`) and `entry-server.jsx` (build, `StaticRouter`) use.

New page → add it to `STATIC_PAGES`, wrap the page in `PageShell` (pass `noindex` for unlisted
pages, as `/company/team` and `/company/press` do). The sitemap needs no edit — it is generated
from the routes that render as indexable. **A route missing from `STATIC_PAGES` is a hard 404 in
production**: there is no SPA fallback any more.

### Prerendering (do not break these invariants)

Every route ships as real HTML so crawlers and AI bots that don't run JavaScript get full
content. Consequences:

- Page components must render on the server: no `window`/`document`/`localStorage` **during
  render**. Effects are fine (they don't run in SSR); guard lazy initial state with
  `typeof window !== 'undefined'`, as `useMinWidth` does.
- `dist/index.html` is the prerendered **home page**, not a shell. `index.html` at the repo root
  is the template, and prerender replaces its `<!--seo:start--> … <!--seo:end-->` block per route.
- Output is `<route>.html` (e.g. `dist/solutions/trusted-ai.html`), served at the extensionless
  URL by Vercel (`cleanUrls`) and Cloudflare Pages alike. `dist/404.html` makes unknown URLs
  return a real 404 on both hosts.
- The build fails loudly if a page renders no `<Seo>`, has no `<h1>`, or has a canonical that
  disagrees with its own URL.
- `npm run preview` serves raw files, so extensionless URLs 404 there; that is a preview-only
  artifact, not a production bug.

Deployment is Vercel ([vercel.json](vercel.json): `cleanUrls`, `trailingSlash: false`, the
`www` → apex redirect and the permanent redirects for renamed slugs). Renaming a
solution/industry slug means updating the data file **and** adding a redirect in both
`vercel.json` and [public/_redirects](public/_redirects) (Cloudflare Pages format).
`public/_headers` and `public/_routes.json` are Cloudflare Pages artifacts.

**The epineon.ai domain does not serve this repo** (as of 2026-09) — it points at an older
Cloudflare-hosted Epineon site. This repo deploys to `epineon-website-corporate-version.vercel.app`.

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

Metadata has two rendering paths that share [src/seo/seoMeta.js](src/seo/seoMeta.js)
(`resolveSeo`, the defaults, and `SeoCollectorContext`):

- **Build**: `<Seo>` publishes each page's resolved values through `SeoCollectorContext`;
  `scripts/prerender.mjs` bakes them — plus JSON-LD from
  [src/seo/structuredData.js](src/seo/structuredData.js) — into that route's static HTML.
- **Browser**: [src/components/Seo.jsx](src/components/Seo.jsx) updates those same tags in place
  on client-side navigation, so a page never accumulates duplicates.

`structuredData.js` encodes the brand architecture (Epineon `Organization` → ecosystems →
product `Brand`s → solution `Service`s → industry audiences) strictly from `src/data/`. Products
are `Brand`, not `Product`: the site publishes no prices, offers or ratings, and `Product`
without them is invalid for Google's product results. Never add ratings, reviews, prices or
`sameAs` entries that the site itself does not state.

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
single `message` string (`[Demo request]\nCompany: …`) before POSTing to `/api/contact`:

```js
{ name, email, subject, message, company, formId,
  companyWebsite /* honeypot */, formStartedAt, sourcePath }
```

Adding a field means adding it to the tab's `fields` array — but if you add or rename a **tab**,
or rename a field **label**, you must also update the registry in
[api/_lib/forms.js](api/_lib/forms.js). `npm test` fails if the two disagree: the drift guards
read the tabs and labels straight out of `Contact.jsx`. That coupling exists because the server
splits the flattened body back apart using those labels.

The active tab comes from `?tab=`/`?sub=` first, then the legacy `#hash` that links across the
site still use — see [src/lib/contactTabs.js](src/lib/contactTabs.js).

Cookie consent is homegrown: [lib/cookieUtils.js](src/lib/cookieUtils.js) stores preferences
under the `epineon-cookie-consent` localStorage key, with `canUseAnalytics/Marketing/Functional`
helpers to gate any script you add.

## Admin dashboard, API and database

A private operations console at `/admin` for reading contact submissions and managing who can
see them. Three subsystems the rest of this file does not touch:

- [api/](api/) — Vercel serverless functions, Node ESM, no framework. Three endpoints:
  `/api/contact` (public intake), `/api/admin/team`, `/api/admin/signup`.
- [supabase/migrations/](supabase/migrations/) — four tables (`contact_messages`, `admin_users`,
  `admin_invitations`, `rate_limits`), `is_admin()`, `bump_rate_limit()`, RLS on everything.
- [src/admin/](src/admin/) — the dashboard: its own shell, hooks and `admin.css`. It shares the
  repo with the marketing site but inherits none of its layout, and `admin.css` is scoped under
  `.admin-root` so the two cannot leak into each other.

### The invariant worth protecting

**Authorisation lives in Postgres, not in the application.** `is_admin()` plus RLS decides what
any authenticated user can touch; `requireAdmin()` re-checks it server-side on every
`/api/admin/*` call. [RequireAdmin.jsx](src/admin/RequireAdmin.jsx) is a convenience for the
operator, *not* the boundary — deleting it changes what the page looks like, not what data it
can reach.

Consequences when changing anything here:

- The admin UI reads and writes Supabase **directly** from the browser with the user's JWT. Only
  go through an endpoint for something the user is not allowed to do themselves (insert a
  submission, write the allowlist, create an auth user). Don't add a read API; RLS already
  enforces what it would.
- `contact_messages` has **no insert policy** and `admin_users`/`admin_invitations` have no
  insert or update policy for `authenticated`. Those absences are the design — they are what
  stop a signed-in user granting themselves access. Don't "fix" them by adding policies.
- **Anything prefixed `VITE_` is inlined into the public browser bundle.**
  `SUPABASE_SERVICE_ROLE_KEY` is deliberately un-prefixed and
  [api/_lib/supabaseAdmin.js](api/_lib/supabaseAdmin.js) must never be imported from `src/`.
- Supabase writes from the browser must call `.select()`. PostgREST returns neither an error nor
  a row count when RLS filters the target out, so a blocked write otherwise looks successful —
  see `setStatus` in [useMessages.js](src/admin/useMessages.js).

### api/_lib

Split deliberately into **pure rules** (`validation`, `invitations`, `forms`) and **I/O**
(`auth`, `supabaseAdmin`, `rateLimit`). That split is why most of the 142 tests run without a
database. [http.js](api/_lib/http.js) also classifies failures: `isSchemaError` (an unapplied
migration) and `isCredentialError` (a rejected service-role key) produce different, named
messages for admin callers, each with a `ref` matching a log line.

### Migrations

Three files, applied in filename order; each is idempotent. The build does **not** apply them.
`useMessages` selects `form_id`, `form_name` and `company`, so a project missing migration 3
fails every dashboard query rather than degrading — and a project missing migration 2 lets the
team page load while every invitation fails. Verify with:

```sql
select table_name from information_schema.tables where table_schema = 'public' order by 1;
```

### Admin routing gotcha

Admin routes are prerendered as `noindex` shells like any other route, because there is no SPA
fallback. The per-form sections are **one dynamic route** (`/admin/messages/:formId`, declared in
[AppRoutes.jsx](src/AppRoutes.jsx)) with their concrete paths enumerated in `PRERENDER_PATHS`. A
literal route per form leaves `useParams()` empty and every section renders as "All".
# Development Documentation Rules

I am a beginner programmer and I want to understand everything we build together.

Whenever you implement, modify, or add a feature, you must update the project's technical documentation.

For every new feature or significant code change, document:

1. **What was built:** Explain the feature and its purpose.
2. **Architecture:** Explain how the feature fits into the existing project.
3. **Libraries and technologies:** Explain which libraries, frameworks and tools were used and why.
4. **Algorithms and logic:** Explain the logic, algorithms, functions and important decisions behind the implementation.
5. **Data flow:** Explain how data moves between the frontend, API, backend and database.
6. **Backend:** Explain the API endpoints, server-side operations, database queries and how data is stored, retrieved or updated.
7. **Security:** Explain authentication, authorization, validation and security measures involved.
8. **Code references:** Mention the important files, functions and code locations.

### Documentation requirements

- Maintain a file named `docs/DEVELOPMENT_GUIDE.md`.
- Update it whenever a significant feature is implemented or modified.
- Keep previous documentation and update it rather than replacing everything.
- Use simple English suitable for a beginner.
- Include diagrams and practical code examples when useful.
- Explain WHY decisions were made, not just WHAT was implemented.
- Clearly distinguish existing functionality from newly implemented functionality.
- Never claim something works unless you have verified it.

### Important working rule

After completing each development task:

1. Summarize what you changed.
2. Explain how it works technically.
3. Update `docs/DEVELOPMENT_GUIDE.md`.
4. Tell me which documentation sections were updated.

Do not modify application code just to create documentation.

My goal is not only to build applications using AI but also to understand how to develop them independently.