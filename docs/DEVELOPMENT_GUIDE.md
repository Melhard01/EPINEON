# Epineon — Development Guide

Orientation for a developer joining this codebase. Everything here was read out of the source
on 4 November 2026.

Two companion documents, deliberately not duplicated here:

- [CLAUDE.md](../CLAUDE.md) — terse operating rules and the invariants not to break.
- [docs/ADMIN_SETUP.md](ADMIN_SETUP.md) — the step-by-step runbook for standing up Supabase,
  Vercel and the first administrator.

This guide is the "why it is shaped this way" layer between them.

**Part I (sections 1–14) is reference** — look things up here. **[Part II](#part-ii--learning-book)
is a learning book**: lesson-by-lesson walkthroughs of this project written for someone learning
to program, with glossaries, diagrams and self-test questions. Part II grows over time and never
replaces Part I.

---

## 1. What this project is

Two things in one repository:

1. **A public marketing site** — the Epineon corporate hub. Its job is to explain the company
   and route visitors outbound to individual product sites (EPICRYPT, EpiTrust, …). The products
   themselves are not hosted here. Every route ships as prerendered static HTML.
2. **A private admin console** at `/admin` — reads contact submissions, manages who on the team
   can see them. Invitation-only.

They share a repository, a build and a deployment, but almost nothing else: different layout,
different CSS system, different data access pattern.

### Stack

| Layer | Choice |
|---|---|
| Framework | React 19.1, Vite 6.3.5, React Router 7 |
| Rendering | SPA + build-time prerender to static HTML per route |
| Styling | Tailwind v4 (public site), hand-written scoped CSS (admin) |
| Backend | Vercel serverless functions, Node ESM, no framework |
| Database | Supabase Postgres 17 |
| Auth | Supabase Auth (GoTrue), email + password |
| Hosting | Vercel |
| Tests | Node's built-in test runner |

---

## 2. Repository layout

```text
api/                  serverless functions (see §5)
  _lib/               shared: pure rules vs I/O, split deliberately
supabase/migrations/  three SQL files, applied in filename order
scripts/
  prerender.mjs       build step 3: static HTML per route
  bootstrap-admin.mjs creates the first administrator
src/
  admin/              the dashboard module: shell, hooks, scoped CSS
  components/         public site components
    ui/               vendored shadcn — see §6, most are unused
  data/               content source of truth (see §4)
  hooks/              shared hooks (scroll animations, viewport)
  lib/                small utilities (cookies, contact tabs)
  pages/              route components
    admin/            the five admin screens
  seo/                metadata resolution + JSON-LD
tests/                8 files, 142 tests
dist/                 BUILT OUTPUT, COMMITTED TO GIT
```

`dist/` being tracked is the single most surprising thing about this repo. Every build rewrites
all 34 pages, so any commit that follows a build touches them all — and a build run with
throwaway environment values will commit those values.

---

## 3. Build and rendering

```bash
npm run build
# 1. vite build                            -> dist/            (client bundle)
# 2. vite build --ssr src/entry-server.jsx -> .ssr-build/      (gitignored)
# 3. node scripts/prerender.mjs            -> one .html per route + sitemap.xml
```

Every route ships as real HTML so crawlers and AI bots that do not run JavaScript get full
content. Consequences you must respect:

- **Page components must render on the server.** No `window`, `document` or `localStorage`
  *during render*. Effects are fine — they do not run in SSR. Guard lazy initial state with
  `typeof window !== 'undefined'`.
- `dist/index.html` is the prerendered **home page**, not a shell.
- Output is `<route>.html`, served extensionless by Vercel's `cleanUrls`.
- **The build fails loudly** if a page renders no `<Seo>`, has no `<h1>`, or has a canonical that
  disagrees with its own URL.
- **There is no SPA fallback.** A route missing from `STATIC_PAGES` in
  [src/routes.jsx](../src/routes.jsx) is a hard 404 in production.
- `npm run preview` serves raw files, so extensionless URLs 404 there. That is a preview
  artefact, not a bug.

---

## 4. Frontend — public site

### Shells and routing

Routes are declared flat in [src/routes.jsx](../src/routes.jsx) and rendered by
[src/AppRoutes.jsx](../src/AppRoutes.jsx), which both `main.jsx` (browser, `BrowserRouter`) and
`entry-server.jsx` (build, `StaticRouter`) use. Three shells, all rendering the same chrome
inside a `.landing-page-dark` root:

| Shell | Used by |
|---|---|
| `App.jsx` | `/` only — adds scroll-snap |
| `PageShell.jsx` | every ordinary page; forwards SEO props |
| `LegalDocLayout.jsx` | `/privacy`, `/terms`, `/cookie-policy` — adds the sticky TOC |

### Content lives in data modules, not JSX

[src/data/](../src/data/) is the single source of truth; pages are generic renderers over it.
`solutions.js` and `industries.js` are keyed by URL slug and rendered by one dynamic page each.
Adding a product is one entry in `ecosystem.js` — the homepage, mega-menu, solution and industry
pages all pick it up by `id`.

Note the overlap: `synergeticSolutionsData.js` is a *separate*, richer product record used by
`/products`. A product shown in both places must be edited in both.

### SEO

Metadata has two paths sharing [src/seo/seoMeta.js](../src/seo/seoMeta.js). At build time `<Seo>`
publishes resolved values through a context that `prerender.mjs` bakes into the static HTML,
along with JSON-LD from `structuredData.js`. In the browser, `Seo.jsx` updates the same tags in
place on navigation so a page never accumulates duplicates.

### Styling

Tailwind v4 via `@tailwindcss/vite` — **no `tailwind.config.js`**; theme tokens are `@theme
inline` CSS variables in `src/App.css`. Three global stylesheets plus two scoped ones:

- `index.css` — html/body overflow guards. Sections are full-bleed and transform-heavy, so
  horizontal-scroll regressions usually originate here. Note `overflow-x: clip` *hides* overflow
  rather than preventing it, which means a `scrollWidth` check will not detect it.
- `App.css` — ~6.5k lines: tokens plus the `epineon-*` classes used throughout.
- `theme-landing-dark.css` — the dark theme, scoped to `.landing-page-dark`, heavy `!important`.
- `legal-doc.css`, `admin.css` — imported by one layout each.

Typography is fluid (`clamp()`), not breakpoint-stepped. Display font is Cinzel via
`--epineon-font-display`; body is Poppins.

### Scroll animations

[usePageSectionAnimations](../src/hooks/usePageSectionAnimations.js) is the shared mechanism,
called once per shell. It observes every `<section>` under `<main>` and toggles
`page-section--active` plus `.visible` on descendant `.scroll-animate*` elements; CSS does the
rest. Sections start hidden, so a section that never intersects stays invisible.
`prefers-reduced-motion` activates everything immediately.

---

## 5. Frontend — admin console

Self-contained in [src/admin/](../src/admin/). No state library: each page mounts a hook,
fetches on mount, holds the result in `useState`.

| Module | Role |
|---|---|
| `AdminShell.jsx` | Sticky left rail + page header; collapses to a top bar below 1024px |
| `RequireAdmin.jsx` | Route guard — **convenience, not the security boundary** |
| `supabaseClient.js` | Lazy browser client + `adminFetch` (attaches the Bearer token) |
| `useAdminAuth.js` | Session + an authorisation probe answered by the database |
| `useMessages.js` | Submission read/mutate, plus per-form counts |
| `useTeam.js` | Allowlist read |
| `dashboardStats.js` | Pure derivations — bucketing, growth, summaries |
| `MessageFlowChart.jsx` | Hand-rolled SVG chart and sparkline |
| `admin.css` | 827 lines, everything scoped under `.admin-root` |

Two implementation details that will bite if changed carelessly:

- **The Supabase client is created lazily.** At module scope it would be constructed during the
  prerender, where `supabase-js` builds a Realtime transport needing a global `WebSocket` —
  absent on Node 20.
- **The per-form sections are one dynamic route**, `/admin/messages/:formId`, declared in
  `AppRoutes.jsx` with concrete paths enumerated for the prerender. A literal route per form
  leaves `useParams()` empty and every section renders as "All".

---

## 6. Libraries — what is actually used

`package.json` is **not** a guide to what this project uses. Measured against the source:

| | Count |
|---|---|
| Declared dependencies | 54 |
| Imported by at least one file | 47 |
| Never imported anywhere | 7 |

The six never imported: `@hookform/resolvers`, `date-fns`, `lenis`, `ogl`,
`react-cookie-consent`, `zod`. (`tailwindcss` also looks unimported to a JS scan, but it is
pulled in through `@import "tailwindcss"` in `App.css` and the Vite plugin — so it counts as
used.)

That understates it. Of the 47, most are reached **only** by vendored shadcn components in
`src/components/ui/` — and of those 46 components, the application imports just **four**:

```text
button, card, carousel, select        <- reached by app code
42 others                             <- vendored, never imported
```

**33 packages are reachable only through those 42 unused components** — 24 Radix packages plus
`cmdk`, `input-otp`, `next-themes`, `react-day-picker`, `react-hook-form`,
`react-resizable-panels`, `recharts`, `sonner` and `vaul`. **None of them are in the bundle**:
Vite tree-shakes anything the entry graph never imports, confirmed by grepping the built assets
for each. They cost install time and audit surface, not bytes shipped.

Genuinely load-bearing at runtime:

| Package | Where |
|---|---|
| `react`, `react-dom`, `react-router-dom` | everywhere |
| `@supabase/supabase-js` | admin client + both server clients |
| `lucide-react` | icons, 41 files |
| `framer-motion` | three animated public components |
| `embla-carousel-react` / `-autoplay` | product carousels |
| `clsx`, `tailwind-merge`, `class-variance-authority`, `@radix-ui/react-slot` | the four live `ui/` components |

**Grep before assuming a library is wired up.** Scroll behaviour is plain CSS plus
`IntersectionObserver`, not a smooth-scroll library — `lenis` is installed and unused. The admin
chart is hand-rolled SVG, not `recharts`, because this app ships as a single bundle with no route
splitting: anything imported for the dashboard is also downloaded by every visitor to the
marketing site.

---

## 7. Backend and APIs

Three serverless functions. No framework, no router — one default-exported handler per file.

| Endpoint | Methods | Auth | Rate limit |
|---|---|---|---|
| `/api/contact` | POST | none | 3 / 10 min and 20 / day per IP |
| `/api/admin/team` | GET, POST, PATCH | Bearer JWT + active allowlist row | 20 / 10 min per user |
| `/api/admin/signup` | GET, POST | invitation token | GET 30, POST 10 per 10 min per IP |

### api/_lib — the split that makes testing possible

**Pure rules** (no I/O, no Supabase import): `validation.js`, `invitations.js`, `forms.js`.
**I/O**: `auth.js`, `supabaseAdmin.js`, `rateLimit.js`. `http.js` is the shared response layer.

That separation is why most of the 142 tests run with no database.

### Error handling

`http.js` classifies failures rather than flattening them:

- `isSchemaError` — `42P01`, `42703`, `PGRST204`, `PGRST205`. Means a migration was not applied.
- `isCredentialError` — `PGRST301`, `42501`, 401/403, "Invalid API key". Means the service-role
  key is wrong, rotated, or from a different project.

Admin endpoints **name** the fault, because those callers are operators who can act on it; the
public endpoint stays generic. `logError` prints code, message, details, hint and stack behind a
short `ref` that is also returned to the caller, so a reported error maps to one log line.
Logging only `.message` is what originally hid a missing table behind a generic 500.

### The contact form contract

`src/pages/Contact.jsx` flattens every answer except name and email into one `message` string,
prefixed with the tab label, and POSTs:

```js
{ name, email, subject, message, company, formId,
  companyWebsite /* honeypot */, formStartedAt, sourcePath }
```

The server splits that body back apart using the field labels held in
[api/_lib/forms.js](../api/_lib/forms.js). **That registry and `Contact.jsx` must agree**, and
`npm test` fails if they drift — the guards read tabs and labels straight out of the page.

If you are building something similar from scratch: do not flatten. Store fields as columns.
This project needed a parser to undo the flattening.

---

## 8. Database and Supabase

Four tables. Full DDL lives in [supabase/migrations/](../supabase/migrations/); this is the shape.

| Table | Purpose |
|---|---|
| `contact_messages` | Submissions. Status, `form_id`/`form_name`, `company`, `ip_hash`, `user_agent` |
| `admin_users` | The allowlist. **Membership here is authorisation** |
| `admin_invitations` | One-time tokens, stored as SHA-256. Never a source of authorisation |
| `rate_limits` | Fixed-window counters, keyed `(bucket, identifier, window_start)` |

Functions: `is_admin()` (SECURITY DEFINER, pinned `search_path`), `bump_rate_limit()` (atomic via
`insert … on conflict do update`, self-pruning), `touch_updated_at()` (trigger).

### Row Level Security

RLS is on for all four tables, so anything without a matching policy is refused. Five policies
exist — select on `admin_users`, `admin_invitations` and `contact_messages`, plus update and
delete on `contact_messages` — each gated by `is_admin()`.

**The absences are the design:**

- No insert policy on `contact_messages` → submissions can only arrive through the server.
- No insert/update policy on `admin_users` or `admin_invitations` → an authenticated user cannot
  grant themselves access or mint themselves an invitation.

Do not "fix" these by adding policies.

Migrations are **not** applied by the build. Verify with:

```sql
select table_name from information_schema.tables where table_schema = 'public' order by 1;
```

---

## 9. Authentication and authorisation

Two separate questions, answered in two different places.

**Identity** — Supabase Auth, email and password. No OAuth, no magic links. The session is
persisted in `localStorage` under `epineon-admin-auth` and sent as an `Authorization: Bearer`
header.

**Authorisation** — an active row in `admin_users`. Being authenticated is never sufficient.
`useAdminAuth` decides `isAdmin` by running `select id from admin_users limit 1`: RLS answers
that only for an active administrator, so the verdict comes from the database rather than a flag
the browser could flip. `requireAdmin()` re-checks the same thing server-side on every
`/api/admin/*` call.

### The first administrator

`/admin/team` can only be used by someone who is already an administrator. That chicken-and-egg
is intentional — nobody can bootstrap themselves through the web app. The first account is
created by `scripts/bootstrap-admin.mjs`, run locally, authorised purely by possession of the
service-role key.

### Invitations

An invitation authorises *creating an auth account for one named address, once, before an
expiry*. It does **not** grant administrator rights. A leaked token is therefore worth no more
than the allowlist already allows.

- 32 random bytes, base64url; stored as SHA-256, looked up by digest
- Single-use: the claim is an `UPDATE` guarded by `accepted_at is null`
- Default 7-day expiry; a new invitation supersedes any live one for that address
- Accounts are created with `email_confirm: true` — the link is itself proof of address
  ownership, which is what removes any SMTP dependency

---

## 10. Security model

Authorisation lives in Postgres. Everything else is defence in depth around it.

| Layer | Enforces | Bypassing it gets you |
|---|---|---|
| RLS + `is_admin()` | Which rows any authenticated user may touch | Nothing — the real boundary |
| `requireAdmin()` | Identity and allowlist on every `/api/admin/*` call | 401 or 403 |
| No write policy on `admin_users` | Only the service role changes the allowlist | Nothing |
| `RequireAdmin` component | What the page looks like | A different-looking page |

### Keys

The **anon key** is public by design and ships in the bundle; everything it reaches is gated by
RLS. The **service-role key** bypasses RLS and is deliberately *not* prefixed `VITE_` — Vite only
inlines `VITE_*`, so it cannot leak into the client bundle by accident.
`api/_lib/supabaseAdmin.js` must never be imported from anything under `src/`.

### Public endpoint hardening

`/api/contact` carries a honeypot field, a timing window (2s–24h), and two rate-limit windows
keyed on a **salted hash** of the IP — no raw address is stored or logged. Honeypot and timing
rejections are worded identically to validation errors so a bot cannot tell which trap it hit.
The limiter **fails open**: a broken limiter must not take the contact form down.

### Headers (`vercel.json`)

Site-wide: `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`,
a `Permissions-Policy`, and HSTS with preload. On `/admin/*`: `X-Robots-Tag: noindex, nofollow`
and `Cache-Control: no-store`. On `/api/*`: `no-store`.

### CSRF

Not implemented, and structurally not applicable: there is no cookie-based ambient authority. The
admin session lives in `localStorage` and travels as a header a cross-site form post cannot set.
**Moving to cookie-based sessions would make CSRF protection necessary.**

---

## 11. Data flow — a submission end to end

1. `/contact` renders; `formStartedAt` is recorded; the tab comes from `?tab=`/`?sub=`, falling
   back to the legacy `#hash`.
2. The visitor submits. The client flattens the answers and POSTs the payload in §7.
3. `POST /api/contact` reads the body with a 16 KB cap.
4. Validation: honeypot, timing, field rules — then `resolveFormId` matches the id against the
   registry and derives the display name. **This is the last point at which anything the browser
   said is believed.**
5. Two rate-limit windows, counted in Postgres against a salted IP hash.
6. Insert under the service role with `ip_hash` and a truncated `user_agent`.
7. `200 {ok:true}`; the page swaps to a confirmation panel.

Then, separately:

8. The administrator signs in; `useAdminAuth` probes `admin_users` and RLS decides.
9. `useMessages` selects `contact_messages` **directly from the browser** with the user's JWT —
   no server endpoint involved. Do not add a read API; RLS already enforces what it would.
10. `inferFormId` decides the section; `parseSubmissionBody` splits the stored body so the detail
    pane shows the visitor's own words separately from the other answers.
11. Status changes write back under RLS. **Mutations must call `.select()`** — PostgREST returns
    neither an error nor a row count when RLS filters the target out, so a blocked write
    otherwise looks successful.

---

## 12. Local development

```bash
npm install
cp .env.example .env.local      # fill in values; .env* is gitignored
npm run dev
```

| Variable | Used by | Secret |
|---|---|---|
| `VITE_SUPABASE_URL` | browser, build | no |
| `VITE_SUPABASE_ANON_KEY` | browser, build | no — public by design |
| `SUPABASE_URL` | server | no |
| `SUPABASE_SERVICE_ROLE_KEY` | server | **yes — treat as a root password** |
| `RATE_LIMIT_SALT` | server | **yes** |
| `PUBLIC_SITE_URL` | server | no — builds invitation links |
| `ADMIN_INVITE_TTL_HOURS` | server, optional | no |
| `VITE_API_BASE_URL` | browser, optional | no |

Anything prefixed `VITE_` is inlined into the public bundle. Without Supabase configured the
admin area renders a "not configured" notice rather than failing.

The dev server still proxies `/submit` and `/api/submit` to `127.0.0.1:3003`. That is vestigial —
the contact form posts to `/api/contact`, which is not proxied.

---

## 13. Testing

```bash
npm test                                             # 142 tests
node --test tests/forms.test.js                      # one file
node --test --test-name-pattern="never says" tests/  # one test by name
```

Node's built-in runner over plain `.test.js` files. No Jest, no Vitest, no mocking library.

`tests/fakeSupabase.mjs` stands in for the Supabase REST and Auth APIs — enough PostgREST to be
meaningful: `eq`/`is`/`neq` filters, `?select=` column projection, filtered `PATCH` returning only
matched rows, and a `missingTables` option that answers as an unapplied migration would. The
filtered PATCH is what makes the single-use invitation claim a real test rather than a rubber
stamp.

Several **drift guards** fail deliberately when two files disagree — the form registry against
the tabs in `Contact.jsx`, the field labels against the parser. If one fails, the fix is usually
to update the registry, not the test.

`npm run lint` has 16 pre-existing problems. Treat that as the baseline: a change should not
raise it.

---

## 14. Known gaps

Accurate as of 5 November 2026.

- **Nothing has been verified against a live deployment.** §9 of `ADMIN_SETUP.md` lists ten
  production checks; none have been run.
- **Migrations 2 and 3 are not applied** to the live project, so invitations fail and the
  dashboard cannot load submissions.
- **The service-role key appears to be rejected** by the live project — server calls fail while
  the browser's anon-key queries succeed.
- No pagination: one 500-row query, and counts derive from that window.
- One role only. No audit log; `last_seen_at` is the only activity trace.
- The contact form honeypot is announced to screen readers (no `aria-hidden`).
- Password reset is wired but untested, and needs SMTP.
- **The hero buttons' `py-*` classes are dead code.** `src/components/ui/button.jsx` gives the
  `default` size variant a fixed `h-9` (36px). A fixed height wins over padding, so the
  `md:py-3 lg:py-3.5` on the two home-hero CTAs has never had any effect and the buttons are 36px
  at every width. **Resolved for the two hero CTAs** later the same day: the dead `py-*` classes
  were removed and replaced with `min-h-11 md:min-h-12`, so those two now measure 44px and 48px.
  The `h-9` variant itself is unchanged, so any other caller relying on `py-*` to size a button
  is still affected.

Uncommitted at time of writing: credential-fault classification in `api/_lib/http.js`, logging in
`api/_lib/auth.js`, the matching branch in `api/admin/team.js`, and two test files.

---
---

# Part II — Learning Book

A lesson-by-lesson walkthrough of this project, written for someone learning to program. Every
explanation uses real code from this repository — nothing invented, nothing generic.

**How this part works.** Each lesson has the same shape: a glossary of new terms, the
explanation, real snippets, a diagram where the idea has a shape, self-test questions with model
answers, and a progress note recorded after the questions are answered.

Lessons are append-only. Nothing here is ever rewritten — if an earlier explanation turns out to
be incomplete, a later lesson corrects it and says so.

| # | Lesson | Covers | Status |
|---|---|---|---|
| 1 | Architecture and Stack | The two apps, the six technologies, the two data routes | Taught — awaiting answers |

---

## Lesson 1 — Architecture and Stack

*Covers Part I §1. Taught 4 November 2026.*

### 1.1 Glossary

New terms, in the order they appear below.

| Term | Plain meaning |
|---|---|
| **Repository (repo)** | The folder holding all your project's code and its history |
| **Library** | Pre-written code you use so you don't write it yourself |
| **Component** | A function that returns a piece of screen. The building block of React |
| **JSX** | HTML-looking syntax written inside JavaScript. React converts it to real HTML |
| **Build** | Converting your many source files into a few optimised files a browser can load |
| **Bundle** | The output of a build — the actual JavaScript file the browser downloads |
| **SPA** (Single Page Application) | A site where the browser builds each page with JavaScript instead of fetching a new HTML file |
| **SSR** (Server-Side Rendering) | Running your UI code on a server to produce finished HTML |
| **Prerender** | Doing SSR *at build time* and saving the result as `.html` files |
| **Route / routing** | The rule deciding which component to show for a given URL |
| **Database** | Permanent, structured storage. Tables of rows, like very strict spreadsheets |
| **Postgres** | The specific database engine Supabase runs |
| **API** | A defined way for one program to ask another program for something |
| **Serverless function** | Code that runs on demand when a URL is hit. There is a server; you just don't manage it |
| **Auth** (authentication) | Proving *who* you are — logging in |
| **Authorisation** | Deciding what you're *allowed to do* once you've proved who you are |
| **JWT** | A signed token a browser holds after logging in, proving identity on each request |
| **RLS** (Row Level Security) | Rules stored *inside the database* deciding which rows each user may see |
| **Anon key** | A public Supabase key safe to ship in the browser; everything it reaches is gated by RLS |
| **Service-role key** | A master Supabase key that bypasses RLS. Server only. Treat as a root password |

### 1.2 The big idea

This repository builds **two different applications**:

1. **A public marketing site** — the pages anyone can visit.
2. **A private admin dashboard** at `/admin` — where enquiries are read and the team is managed.

They share a folder, a build and a deployment, but they are genuinely separate: different
layout, different styling, different way of reaching data. Holding that split in mind makes the
rest of the codebase legible.

### 1.3 The technologies, and why each one

**React** builds the screen out of components. A component is just a function returning what
should appear:

```jsx
export function TrustSeam() {
  return (
    <div className="trust-seam" aria-hidden>
      <span className="trust-seam__line" />
    </div>
  )
}
```

*Why:* pages like the Messages inbox change constantly — click a message, it marks read, the
unread badge drops. Without React you would hunt down each element and update it by hand. With
React you describe what the screen should look like for the current data, and React works out
the difference.

**Vite** turns ~150 source files into a small optimised bundle. The build is three steps
(`package.json`):

```bash
vite build && vite build --ssr src/entry-server.jsx --outDir .ssr-build && node scripts/prerender.mjs
```

1. Build the browser bundle.
2. Build a second copy that can run on a server (SSR).
3. Use that copy to write one finished `.html` per page.

*Why step 3:* a normal SPA builds the page in the visitor's browser, so a crawler that doesn't
run JavaScript sees an empty page. Prerendering runs the React code at build time and saves real
HTML. Crawlers get content; humans still get the fast interactive version after it loads.

**React Router** maps URLs to components (`src/routes.jsx`):

```jsx
export const STATIC_PAGES = [
  { path: '/', Component: App },
  { path: '/contact', Component: Contact },
  { path: '/admin/login', Component: AdminLogin },
  { path: '/admin', Component: guarded(AdminDashboard) },
]
```

`guarded(AdminDashboard)` wraps the page in a login check. `/admin/login` is deliberately not
wrapped — you must be able to reach the login page while logged out.

**Supabase** provides three things at once: Postgres (the database), Auth (login), and an API to
reach them. *Why:* for a small team it replaces building and hosting an entire backend.

**Vercel** serves the built files and runs the serverless functions in `api/`.

**Tailwind** styles the public site with small composable classes. The admin deliberately uses
its own hand-written `admin.css` instead, so the two design systems cannot bleed into each other.

### 1.4 How the parts communicate — the central idea

There are **two routes** from this app to the database. Knowing which is which explains most of
the codebase.

```text
   VISITOR  (not logged in)
      │
      │  POST /api/contact
      ▼
   ┌─────────────────────────────┐
   │  api/contact.js             │      runs on Vercel
   │  uses the SERVICE-ROLE key  │      key never reaches a browser
   │  → bypasses RLS             │
   └──────────────┬──────────────┘
                  │  INSERT
                  ▼
        ┌──────────────────────────┐
        │   Supabase Postgres      │
        │   table: contact_messages│
        │   RLS: is_admin()        │
        └────────────▲─────────────┘
                     │  SELECT / UPDATE
                     │  anon key + the admin's JWT
                     │  → RLS checks EVERY row
   ADMINISTRATOR ────┘
   (logged in)
```

**Route 1 — the browser reads the database directly.** `src/admin/useMessages.js`:

```js
const { data, error: queryError } = await getSupabase()
  .from('contact_messages')
  .select('id, name, email, company, subject, message, status, created_at')
  .order('created_at', { ascending: false })
  .limit(500)
```

Read as a sentence: *from `contact_messages`, select these columns, newest first, at most 500.*
No server code is involved.

The natural worry is: couldn't anyone ask for everyone's messages? They can **ask**. The
database **refuses**. RLS rules live inside Postgres and say "only return rows if the asker is an
active administrator." Editing the JavaScript in a browser changes nothing — the refusal happens
on the database side.

This is what the phrase **"authorisation lives in Postgres, not in the application"** means.

**Route 2 — through a server function.** `api/contact.js`:

```js
const supabase = getSupabaseAdmin()
const { error } = await supabase.from('contact_messages').insert({
  ...result.value,
  ip_hash: hashIdentifier(ip),
  user_agent: String(req.headers['user-agent'] || '').slice(0, 300),
})
```

The browser cannot do this directly because the database has **no rule permitting inserts** on
that table. A visitor isn't logged in, so there is no safe way to allow it. The server performs
the write using the service-role key, which bypasses RLS and never leaves the server.

Note `ip_hash` — a scrambled form of the visitor's IP, never the real one, used for spam limits.

**The rule that follows:**

> Let the browser talk to the database directly whenever RLS can protect it. Use a server
> function only for something the user is not allowed to do themselves.

Exactly three things fall into that second category here: saving a contact message, changing who
is an administrator, and creating a login account.

### 1.5 Why this shape

| Choice | Reason |
|---|---|
| Prerender to static HTML | Crawlers and AI bots often do not run JavaScript |
| Supabase over a custom backend | Database, login and API without a server to maintain |
| RLS over API-layer checks | A frontend bug cannot leak data; the database refuses regardless |
| Serverless functions | Only for what RLS cannot permit |
| Separate admin CSS | Two design systems that cannot contaminate each other |

### 1.6 Gotcha introduced in this lesson

Because of the prerender step there is **no SPA fallback**. A route missing from `STATIC_PAGES`
is not a blank page that recovers — it is a hard 404, because the `.html` file was never written.

### 1.7 Self-test questions

1. The admin dashboard reads the database straight from the browser, but the contact form has to
   go through `api/contact.js`. Why the difference?
2. You add a page at `/pricing`, build the site, but forget to add it to `STATIC_PAGES`. A
   visitor goes to `epineon.ai/pricing`. What happens, and why?
3. The anon key sits inside the public JavaScript bundle where anyone can read it. Why is that
   not a security problem — and which key *would* be?

### 1.8 Model answers

<details>
<summary>Open after attempting the questions</summary>

**1.** Because of what the database permits. `contact_messages` has an RLS policy allowing
*select*, *update* and *delete* for an active administrator — so an administrator's browser can
safely do those directly, and RLS enforces it. It has **no insert policy at all**, and a visitor
isn't logged in, so there is no identity for RLS to check. The write therefore has to happen on
the server with the service-role key, which bypasses RLS. In short: the browser is trusted with
whatever RLS can police; everything else goes through a function.

**2.** It returns a real 404. The build writes one `.html` file per entry in `STATIC_PAGES`, and
Vercel serves those files. No entry means no file was ever written, and there is no SPA fallback
to catch the miss and render it client-side. It fails at the hosting layer before React is ever
involved.

**3.** The anon key is public *by design*. On its own it grants nothing: every table it can reach
has RLS switched on, so the database still asks "is this caller an active administrator?" before
returning a single row. The key identifies the project, it does not confer permission.

The dangerous one is **`SUPABASE_SERVICE_ROLE_KEY`**, which bypasses RLS entirely — anyone
holding it can read and write every row. That is why it is deliberately *not* prefixed `VITE_`:
Vite only inlines `VITE_*` variables into the browser bundle, so the naming convention itself
prevents the leak. `api/_lib/supabaseAdmin.js` must never be imported from anything under `src/`.

</details>

### 1.9 Progress

*To be completed once the questions are answered.*


---

# Part III — Change Log

Part I describes the system as it stands. Part II teaches it. This part records **each change as
it is made**: what was built, why, how it works, and how it was checked. Entries are append-only
and in date order, oldest first. Nothing here is ever rewritten — if a later change supersedes an
earlier one, a new entry says so.

---

## 2026-11-05 — Matrix-rain hero background, responsive at every width

### What was built

The home page hero — the first screen a visitor sees, carrying the headline *"Human-centred AI for
high-stakes work, built on trust."* — now plays a looping "matrix rain" video behind the text, on
**every** screen size, and the hero's spacing adapts to the screen instead of being fixed.

Three things changed:

1. **The video reaches phones.** It previously appeared only at 768px and wider; phones saw a
   plain grid-and-glow background.
2. **The top spacing scales.** It was a fixed 176px at every width, from a 320px phone to a 1920px
   monitor. It is now 112 / 152 / 208px depending on the screen.
3. **The two hero buttons are large enough to tap** on touch screens (44px instead of 36px).

### Why

A background video is the kind of thing that is easy to serve badly. The original decision to hide
it below 768px was the right instinct — the file is 3.5 MB, and sending that to a phone on mobile
data to decorate a background is indefensible. But "hide it on phones" is not a responsive design;
it is a missing design. Half the visitors would never see the hero the brand was built around.

The real answer to "this file is too big for phones" is **not** to withhold the feature. It is to
send a file that fits the phone. That is what responsive means for media, exactly as it already
means for layout.

### The idea that makes it work: don't ship pixels the browser throws away

This is the piece worth understanding, because it is counter-intuitive.

The video fills the hero using the CSS rule `object-fit: cover`. "Cover" means: *scale the video
until it covers the whole box, then crop off whatever hangs over the edge.* The box is the hero
section, and the browser never shows the cropped-off part.

A phone hero is **taller than it is wide** — measured at 375 × 621 on a 375px-wide phone. The
original clip is **much wider than it is tall** (1920 × 1080). Put a wide clip into a tall box
with `cover` and the browser scales by height, then slices off the sides:

```
  A 1920x1080 clip drawn into the 375x621 phone hero with object-fit: cover
  ────────────────────────────────────────────────────────────────────────────
   ┌──────────────────┬───────────┬──────────────────┐
   │   thrown away    │  SHOWN    │   thrown away    │   ← only 34% of the
   │       33%        │   34%     │       33%        │     width is ever seen
   └──────────────────┴───────────┴──────────────────┘
```

So two thirds of every frame you send to the phone is decoded and immediately discarded. The bytes
were spent; the pixels were never seen.

The fix is to **do the cropping once, at encode time, instead of on every device on every frame.**
We cut the centre column out of the source and encode only that. The phone now receives a portrait
clip in which every pixel survives to the screen.

The payoff is measured, not guessed. Both candidates below cost about the same:

| Encode | Bytes | Of each frame, what is shown | Stretch needed to fill the screen |
|---|---|---|---|
| Landscape 960×540, crf 28 | 332 KB | 34% of width, 100% of height | 540 → 1863 px = **3.45×** |
| **Portrait 540×960, crf 26** | **354 KB** | 100% of width, 93% of height | 960 → 1863 px = **1.94×** |

(That 354 KB was the original centre crop. The final file is 300,724 bytes — see the amendment
at the end of this entry.)

Same bytes, **1.8× sharper**, because almost none of them are wasted. (1863 is the measured 621px
hero height on a 375px-wide phone times a device-pixel-ratio of 3 — a typical modern phone packs
three hardware pixels into each CSS pixel, which is why a 540px-tall source has to stretch so far.)

### The assets

Four files in `public/assets/`, all generated from the one source clip:

| File | Dimensions | Bytes | Used when |
|---|---|---|---|
| `matrix-rain-hero.mp4` | 1920×1080 | 3,636,953 | ≥ 768px |
| `matrix-rain-hero-poster.jpg` | 1280×720 | 30,690 | ≥ 768px |
| `matrix-rain-hero-mobile.mp4` | 540×960 | 300,724 | < 768px |
| `matrix-rain-hero-mobile-poster.jpg` | 540×960 | 9,706 | < 768px |

Both clips are h.264, 30 fps, 300 frames, exactly 10 seconds, silent, and loop.

The mobile pair was produced with `ffmpeg`:

```bash
# Crop the centre 608x1080 out of the 1920x1080 source, then scale to 540x960.
#   608 = 1080 x 9/16   (the widest 9:16 rectangle that fits in a 1080-tall frame)
#   206 = centre of the rain-only band (see the amendment at the end of this entry —
#         a centred crop at x=656 cuts straight through the figure)
# -an            drop the audio track (there is none to keep, and it must stay silent to autoplay)
# -movflags +faststart   move the index to the front so playback can start before the full
#                        download finishes
ffmpeg -i public/assets/matrix-rain-hero.mp4 \
  -vf "crop=608:1080:206:0,scale=540:960" \
  -c:v libx264 -crf 26 -preset slow -an -movflags +faststart \
  public/assets/matrix-rain-hero-mobile.mp4

# The poster is frame 0 of the file it belongs to, so the still and the first video frame match
ffmpeg -i public/assets/matrix-rain-hero-mobile.mp4 -frames:v 1 -q:v 4 \
  public/assets/matrix-rain-hero-mobile-poster.jpg
```

`crf` is the quality dial for h.264: **lower is better quality and more bytes.** Three settings
were encoded and measured — crf 26 = 362,607 bytes, crf 28 = 293,411, crf 30 = 241,799. crf 26 was
chosen because at ~354 KB it already matched the landscape option's budget, so there was nothing to
gain by accepting less quality.

### Architecture — three stacked layers

The hero background is three absolutely-positioned layers inside one container. They are painted
back to front:

```
  <section id="home" class="landing-hero-section">
   │
   ├─ <div class="landing-hero-section__bg" aria-hidden>      ← decorative, hidden from
   │   │                                                        screen readers
   │   ├─ 1. .landing-hero-section__grid       faint grid lines
   │   │
   │   ├─ 2. <HeroBackgroundVideo />
   │   │     └─ .landing-hero-section__video         POSTER as a CSS background-image
   │   │         ├─ .landing-hero-section__video-el  the <video>, fades in on top
   │   │         └─ .landing-hero-section__video-scrim  dark wash for text contrast
   │   │
   │   └─ 3. .landing-hero-section__glow       gold floor glow
   │
   └─ <div class="relative z-10">              ← the headline, paragraph and buttons
         <HeroSection />                         sit above all of it
```

**Why the poster is a CSS `background-image` and not only the `<video poster>` attribute.** This
site is prerendered: `scripts/prerender.mjs` writes a real `.html` file for each route at build
time (see §3). A CSS background is in that HTML's stylesheet, so the browser paints the still
image during the *first* paint — before React has loaded, before the component has mounted, before
a single video byte has arrived. If the poster lived only on the `<video>` element, the hero would
be black until JavaScript ran. The `<video poster>` attribute is set too, as the second line of
defence once the element exists.

### The component

`src/components/home/HeroBackgroundVideo.jsx`. Two pieces: a hook that answers *"play, and which
cut?"*, and a component that renders it.

```jsx
const WIDE_QUERY   = '(min-width: 768px)'
const MOTION_QUERY = '(prefers-reduced-motion: no-preference)'

const SOURCES = {
  wide:   { src: '/assets/matrix-rain-hero.mp4',        poster: '/assets/matrix-rain-hero-poster.jpg' },
  narrow: { src: '/assets/matrix-rain-hero-mobile.mp4', poster: '/assets/matrix-rain-hero-mobile-poster.jpg' },
}

function useHeroVideo() {
  const [state, setState] = useState({ play: false, wide: false })   // <- both start false

  useEffect(() => {
    const motion = window.matchMedia(MOTION_QUERY)
    const wide   = window.matchMedia(WIDE_QUERY)
    const update = () => setState({ play: motion.matches, wide: wide.matches })
    update()
    motion.addEventListener('change', update)
    wide.addEventListener('change', update)
    return () => { motion.removeEventListener('change', update); wide.removeEventListener('change', update) }
  }, [])

  return state
}
```

Three decisions in that small block, each worth explaining:

**1. Why the state starts `false` and is only corrected inside `useEffect`.**
Because of prerendering. The HTML is generated on a server by Node, where there is no `window` and
no screen width. React then *hydrates* that HTML in the browser: it re-renders the component and
expects to get the same output. If the component asked `window.matchMedia(...)` during that first
render it would say "wide screen, render a `<video>`", while the server-made HTML has no `<video>`
— React reports a **hydration mismatch** and may discard and rebuild the subtree. Starting at
`false` guarantees server and first-client render agree. `useEffect` runs only in the browser and
only *after* that first render, which is the correct place to learn about the device.

**2. Why `matchMedia` and not `window.innerWidth`.**
`matchMedia` returns a live object that fires a `change` event when the answer flips. Reading
`innerWidth` once would freeze the decision at page load, so rotating a phone or dragging a desktop
window across 768px would keep the wrong file. The `change` listeners keep it correct, and the
cleanup function removes them when the component unmounts so no listener leaks.

**3. Why the `<video>` carries a `key`.**

```jsx
<video key={wide ? 'wide' : 'narrow'} ... >
  <source src={cut.src} type="video/mp4" />
</video>
```

This is a genuine HTML trap. Changing the `src` on a `<source>` element of a **live** `<video>`
does nothing — the media element has already chosen its resource and will not re-run the selection
algorithm. Without the `key`, a phone rotated into landscape past 768px would keep playing the
small portrait file, stretched. Giving React a `key` that changes at the breakpoint makes React
destroy the old element and create a fresh one, which does run resource selection and picks up the
new file.

### Accessibility — `prefers-reduced-motion`

`prefers-reduced-motion` is an operating-system setting a person turns on when movement on screen
causes them discomfort — vestibular disorders, migraine, motion sickness. Honouring it is not
optional politeness.

When it is set, `play` stays `false`, **no `<video>` element is created at all, at any width**, and
the hero shows the poster still. Note that this is stronger than pausing the video: nothing is
requested, so the person also does not pay for a file they were never going to watch.

### The scrim, and why phones need a stronger one

The scrim is the dark wash between the video and the text. Without it, pale characters in the rain
can land behind pale text and make it unreadable.

Phones need more of it. Because `cover` crops a narrow column, the rain is magnified and sits
closer behind the headline, and the headline occupies a far larger share of the screen. So the
mobile scrim is both wider and darker, and the desktop values are restored at `min-width: 768px`:

```css
/* base — phones */
.landing-page-dark .landing-hero-section__video-scrim {
  background:
    radial-gradient(ellipse 85% 55% at 50% 40%, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0) 100%),
    linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.1) 26%, rgba(0,0,0,0) 70%, #000 100%);
}

@media (min-width: 768px) {       /* unchanged from before this entry */
  .landing-page-dark .landing-hero-section__video-scrim {
    background:
      radial-gradient(ellipse 50% 45% at 50% 42%, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 100%),
      linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 70%, #000 100%);
  }
}
```

The `linear-gradient` ending in solid `#000` is what melts the bottom edge of the video into the
black page, so there is no hard seam where the hero stops.

### A scoping trap that was avoided — worth remembering

`.landing-hero-section__glow` is **not** unique to the home page. Six pages use it: Products,
SolutionPage, IndustryPage, VentureStudio, About and the home hero.

The rule that dims the glow to `opacity: 0.55` so it does not overpower the video used to live
inside `@media (min-width: 768px)`. The obvious move — lift it out of the media query so it applies
on phones too — would have silently dimmed the glow on **five unrelated pages** on every phone, a
change nobody asked for and nobody would have thought to check.

The fix is to add a narrower rule rather than widen the existing one:

```css
/* phones: only the home hero has a video, so only the home hero is dimmed */
.landing-page-dark section#home .landing-hero-section__glow { opacity: 0.55; }

@media (min-width: 768px) {
  /* untouched: above 768px every hero is dimmed, exactly as before */
  .landing-page-dark .landing-hero-section__glow { opacity: 0.55; }
}
```

**The general lesson:** before you move a CSS rule out of a media query, grep for the class. A
media query is not only a size condition — in a codebase like this it is often doing unintended
duty as a *scope*. Widening the condition widens the blast radius.

### Spacing — the padding that never scaled

The hero's top padding came from two stacked elements and was **fixed at 176px from 320px to
1920px**:

| | before | after |
|---|---|---|
| outer `<LandingSection>` | `pt-28` (112px) | `pt-20 sm:pt-24 lg:pt-28` (80 / 96 / 112px) |
| inner wrapper `<div>` | `pt-16 sm:pt-20 lg:pt-24` (64 / 80 / 96px) | `pt-8 sm:pt-14 lg:pt-24` (32 / 56 / 96px) |
| **total** | **176px everywhere** | **112 / 152 / 208px** |

On a 375 × 667 phone, 176px of empty space is **26% of the viewport** burned before the headline
starts. The new 112px still clears the 61px fixed header by 51px.

Desktop (`lg`, ≥1024px) is deliberately **unchanged** at 208px — the brief was to make small screens
work, not to redesign the desktop hero.

Measured hero heights, before → after:

```
  width   hero height       h1 top edge
   320    695 → 647 px      176 → 112 px
   375    669 → 621 px      176 → 112 px
   414    669 → 621 px      176 → 112 px
   768    596 → 564 px      176 → 152 px
  1024    731 → 731 px      176 → 208 px     (unchanged)
  1280    771 → 771 px      176 → 208 px     (unchanged)
  1920    771 → 771 px      176 → 208 px     (unchanged)
```

### Touch targets, and a latent bug found on the way

The two hero buttons measured **36px tall at every width**. On a touch screen that is below the
44px that Apple and Google both recommend as a minimum tap target. (It does clear WCAG 2.5.8's
hard floor of 24×24, so this was a quality issue rather than a conformance failure.)

Investigating *why* 36px turned up something worth recording. The buttons carry
`md:py-3 lg:py-3.5` — padding that should have made them taller on big screens. It never had any
effect, because the shadcn `Button` component's `default` size variant sets a **fixed height**:

```js
// src/components/ui/button.jsx
default: "h-9 px-4 py-2 has-[>svg]:px-3",     // h-9 = 36px, a fixed height
```

A fixed `height` wins over padding — the padding cannot push the box taller. So every
`py-*` class on these buttons has always been dead code.

That is a pre-existing bug in the desktop hero and **it was left alone**, because fixing it would
change the desktop design, which is outside this change. It is recorded in §14 Known gaps instead.
What was added is a touch-target floor that stops below `lg`:

```jsx
className="... w-full min-h-11 min-w-0 rounded-full lg:min-h-0 ..."
```

`min-h-11` (44px) is a *minimum* height, so unlike `height` it can push the box taller. `lg:min-h-0`
removes the floor at ≥1024px, so desktop stays at exactly the 36px it has always been. Verified:
button heights are `[44,44,44]` at 320–768 and `[36,36,44]` at 1024–1920 (the third is the "Watch
our story" link, which already had `min-h-[44px]`).

### Data flow — what happens, in order

Nothing here touches the server. This is a static-asset path end to end:

```
  BUILD TIME
  ──────────
  ffmpeg  ──► 2 mp4 + 2 jpg in public/assets/
                      │
  vite build ─────────┴──► copied verbatim into dist/assets/
  node scripts/prerender.mjs ──► dist/index.html  (contains the hero markup and the
                                                   stylesheet that names the poster)

  REQUEST TIME
  ────────────
  1. Browser requests  /            ──► dist/index.html          (static file)
  2. Browser requests  index-*.css  ──► POSTER PAINTS HERE. No JS has run yet.
  3. Browser requests  index-*.js   ──► React loads and hydrates
  4. useEffect runs    ──► matchMedia answers: reduced motion? wide or narrow?
  5a. reduced motion   ──► stop. Poster only. No video byte is ever requested.
  5b. otherwise        ──► React renders <video>; browser requests the chosen .mp4
  6. 'canplay' fires   ──► setReady(true) ──► class .is-ready ──► CSS fades opacity 0 → 1
                            over 0.8s, revealing the video over the identical poster frame
```

Step 6 is why each encode has **its own** poster. The fade reveals the video on top of the still.
If the still were a crop of a different frame or a different aspect ratio, the moment of the fade
would show a visible jump. Because each poster is frame 0 of the file it sits under, there is
nothing to jump.

### Backend, API and database

**None.** No API route, serverless function, Supabase table, query, policy or environment variable
was read, written or added. This change is entirely static assets, CSS and client-side React. The
contact form, admin console and database are untouched.

### Security

Nothing here widens the attack surface, but the reasoning is worth stating rather than assuming:

- **No secrets involved.** No environment variable is read by any file in this change, so there is
  nothing to leak into the client bundle. The `VITE_` rule discussed in §10 is not in play here.
- **The media is first-party.** Both clips are served from the site's own origin out of
  `public/assets/`. No third-party CDN, no external script, no new network origin — so the
  Content-Security-Policy in `vercel.json` needs no new entry, and no new party learns a visitor's
  IP address.
- **The video is inert.** It is `muted`, `loop`, `playsInline`, has no audio track and carries
  `tabIndex={-1}`, so it is not focusable and cannot become a keyboard trap. Its container is
  `aria-hidden`, so assistive technology never announces it.
- **No user input touches any of this.** The file path is chosen from a hard-coded `SOURCES`
  object by a boolean. Nothing is interpolated from a URL, a query string or anything the visitor
  controls, so there is no path-traversal or injection surface.

### What was verified, and how

Measured in headless Chrome over the real production build (`npm run build`, served from `dist/`),
at 320 / 375 / 414 / 768 / 1024 / 1280 / 1920 px:

| Check | Result |
|---|---|
| Correct encode loads | `matrix-rain-hero-mobile.mp4` (540×960) below 768px; `matrix-rain-hero.mp4` (1920×1080) at and above. Read from the element's `currentSrc` and `videoWidth`/`videoHeight`, not from the markup |
| Correct poster loads | mobile poster below 768px, desktop poster above, read from computed `background-image` |
| Video actually plays | `!paused && currentTime > 0` true at all 7 widths |
| Fade-in completes | `.is-ready` present at all 7 widths |
| Horizontal overflow | `scrollWidth - innerWidth` = 0 at all 7 widths |
| Failed requests | no 4xx at any width |
| Console | no errors and no warnings at any width |
| Touch targets | `[44,44,44]` at 320–768; `[36,36,44]` at 1024–1920 |
| Desktop unchanged | hero height 731px at 1024 and 771px at 1280/1920 — identical to the pre-change measurements |
| Other pages unregressed | glow opacity on `/products`, `/company/about`, `/company/venture-studio` is `1` at 375px and `0.55` at 1280px — both the same as before. No video layer present on any of them |
| Build | passes; 34 pages prerendered, 22 indexable |
| Lint | no new errors or warnings (one pre-existing `react-refresh` warning in `LandingSection.jsx` remains) |

Visual confirmation by screenshot at 375, 768 and 1280.

**Not verified:** behaviour on real hardware, real-network download timing, and iOS Safari's
autoplay behaviour, which is stricter than Chrome's. The attributes required for iOS autoplay
(`muted`, `playsInline`, no audio track) are all present, but this was tested in headless Chrome
only and should be opened on a real iPhone before it is relied upon.

### Known limits

- `preload="auto"` asks the browser to fetch the whole clip. On phones that is 354 KB, which is
  acceptable, but `preload="metadata"` would be politer on a metered connection. Not changed here
  because `autoPlay` largely overrides `preload` anyway; worth revisiting if the hero ever stops
  autoplaying.
- The 768px breakpoint is a proxy for "phone or not". A 760px-wide tablet gets the small file and a
  770px-wide one gets the 3.5 MB file. A `<source media="...">` ladder with more steps would be
  finer-grained, and `.webm`/AV1 alternates would cut the bytes further at the same quality.
- The desktop buttons' dead `py-*` classes (see above) are still dead.

### Files touched

| File | Change |
|---|---|
| `public/assets/matrix-rain-hero-mobile.mp4` | **new** — 540×960 portrait encode, 354 KB |
| `public/assets/matrix-rain-hero-mobile-poster.jpg` | **new** — frame 0 of the above, 14 KB |
| `src/components/home/HeroBackgroundVideo.jsx` | hook now returns `{play, wide}`; picks src + poster per width; `key` forces remount at the breakpoint |
| `src/components/home/HeroSection.jsx` | scaled top padding; `min-h-11 lg:min-h-0` on both CTAs |
| `src/theme-landing-dark.css` | video layer shown at all widths; mobile poster as the base background; stronger mobile scrim; glow dim scoped to `section#home` below 768px |

Previously existing and **unchanged**: `matrix-rain-hero.mp4`, `matrix-rain-hero-poster.jpg`, the
grid and glow layers, `LandingSection`, and every other page.

---

### Amendment, same day — rain-only crop on phones, and more room at the bottom

Two adjustments after seeing the result on a phone. The original text above is left as written;
this section records what changed and why.

**1. The phone clip now shows only the rain.**

The source clip is not uniform: a person stands in the right-hand ~45% of the frame, and pure
matrix rain fills the left ~53%.

```
  The 1920x1080 source, by horizontal position
  0%                     53%            100%
  |----- pure rain -------|--- figure ----|
        ^              ^
        |              |
     x=206 .......... x=814        the 608-wide phone crop now sits here
                  ^             ^
                  |             |
               x=656 ......... x=1264   where a CENTRED crop sat, cutting
                                        straight through the face
```

The first encode took the geometric centre of the frame (`x=656`), which put a slice of the
subject's head on the right edge of every phone screen — a fragment of a face with no context,
rather than the rain effect the hero is built around. The crop now starts at **x=206**, centred
on the rain-only band instead of on the frame:

```bash
# was: crop=608:1080:656:0   (centre of the frame)
# now: crop=608:1080:206:0   (centre of the rain-only band, 0-1020)
```

A side benefit: falling characters on black compress far better than a lit human face, so the
file got **smaller at the same crf** — 300,724 bytes, down from 362,607. The poster dropped from
14,614 to 9,706 bytes.

**Desktop is unchanged.** It still plays the full 1920x1080 frame with the figure; there is
room for the whole composition on a wide screen. Only the phone cut is rain-only.

**2. More space below the hero on phones.**

The hero's bottom padding was `pb-10` (40px) at every width below `lg`. On a phone that left
"Watch our story" sitting close to the section edge. It is now:

| | before | after |
|---|---|---|
| base (< 640px) | `pb-10` — 40px | `pb-16` — **64px** |
| `sm` (640–1023px) | `pb-10` — 40px | `pb-12` — **48px** |
| `lg` (≥ 1024px) | `pb-14` — 56px | `pb-14` — 56px, unchanged |

Phones get the most bottom padding of the three, which looks inverted written down but is
correct on screen: the hero content is proportionally much larger relative to a phone viewport,
so it needs more breathing room beneath it, not less.

**3. More space at the foot of the hero, again.**

A second pass raised the bottom padding further and evened it out. The earlier values left the
sm breakpoint (48px) smaller than both base and lg, which was an artefact of only bumping mobile:

| | original | pass 1 | pass 2 |
|---|---|---|---|
| base (< 640px) | `pb-10` — 40px | `pb-16` — 64px | `pb-24` — **96px** |
| `sm` (640–1023px) | `pb-10` — 40px | `pb-12` — 48px | `pb-24` — **96px** |
| `lg` (≥ 1024px) | `pb-14` — 56px | `pb-14` — 56px | `pb-28` — **112px** |

Resulting hero heights: 703px at 320, 677px at 375/414, 620px at 768, 787px at 1024, 827px at
1280 and above.

**A wrong turn worth recording.** The first attempt at this request widened the gap between the
headline and the lead paragraph instead (`space-y-8 lg:space-y-10` → `space-y-12 sm:space-y-14
lg:space-y-16`). That is a different gap, it was not what was wanted, and it has been reverted
to its original 32/32/40px. The hero has four candidate vertical gaps — inside the headline,
headline to paragraph, paragraph to buttons, and the section foot — and "space at the bottom"
names only the last of them unambiguously once you have the diagram in front of you.

**4. The two hero CTAs made responsive across the whole range.**

Measuring "Explore Ecosystems" and "Find your path" at thirteen widths turned up three faults:

| Fault | Detail |
|---|---|
| A dead zone from ~390px to 639px | They stayed stacked in a fixed 264px column until `sm` (640px), even though the pair fits side by side from about 390px. A 600px-wide screen showed two short buttons stacked in a narrow column with empty space either side |
| 36px tall at >= 1024px | Below the 44px touch minimum, and cramped: 18px text with 28px line-height inside a 36px box leaves 4px above and below |
| Every `py-*` class was dead | `src/components/ui/button.jsx` gives the `default` size variant a fixed `h-9`. A fixed height wins over padding, so `px-5 py-2.5 ... md:py-3 lg:py-3.5` never affected the height at all |

Fixes:

```jsx
/* container */ "... flex-col gap-2.5 min-[390px]:flex-row min-[390px]:flex-wrap
                     min-[390px]:max-w-none sm:gap-3"
/* buttons   */ "... w-full min-h-11 min-[390px]:w-auto md:min-h-12 ..."
```

- **390px, not `sm`.** The threshold is where the pair actually fits: 178px + 144px + a 10px gap
  = 332px against 358px of content width at 390. That is also where the mainstream phones sit
  (iPhone 14/15/16 are 390–393px), so they get the horizontal layout while 320–384px still
  stacks, which is the right call for those — stacked full-width buttons are the larger target.
- **`flex-wrap` as a safety net.** If the pair ever cannot fit — longer copy, a larger base font
  — they wrap onto two lines instead of overflowing the page.
- **`min-h-11` / `md:min-h-12`** replaces `lg:min-h-0`, so height now steps 44 → 48px with the
  type instead of being switched off at desktop. The dead `py-*` classes were removed rather
  than left to mislead.

Measured after the change — no horizontal overflow at any width:

```
    vw     layout   button heights   font
   320     stack       44 / 44       14px
   375     stack       44 / 44       14px
   384     stack       44 / 44       14px
   390     row         44 / 44       14px   <- threshold
   414     row         44 / 44       14px
   600     row         44 / 44       14px   <- was stacked before
   768     row         48 / 48       16px
  1024     row         48 / 48       18px   <- was 36px before
  1920     row         48 / 48       18px
```

**Verified** after all four changes, across 320 / 375 / 414 / 768 / 1024 / 1280 / 1920:

| Check | Result |
|---|---|
| Phone clip is rain-only | confirmed by extracting frame 150 of the new encode and viewing it — no figure |
| Correct file still loads per width | mobile encode below 768px, desktop encode at and above, read from `currentSrc` |
| Poster still matches its encode | regenerated from frame 0 of the new crop, so the fade-in has nothing to jump over |
| Hero height | 703 / 677 / 677 / 620 / 787 / 827 / 827 at the seven widths — the growth is the padding that was asked for |
| Gap below "Watch our story" | measured 96px at 375, 96px at 768, 112px at 1440 — matches the classes above |
| Gap under the headline | back to 32 / 32 / 40px, its original value |
| Touch targets | `[44,44,44]` below 768, `[48,48,44]` at 768 and above — every control now clears the 44px minimum at every width (it did not at >= 1024px before) |
| Horizontal overflow | 0 at every width |
| Console | no errors or warnings |
| Build | passes; 34 pages prerendered, 22 indexable |


---

## 2026-11-12 — Site-wide responsiveness audit

### What was done

Every page of the site (34), at ten viewport sizes from 320px to 1920px, was **measured** in a
headless browser against the real production build — 340 page/viewport combinations. The full
report, including the page and component checklists, lives in
[docs/RESPONSIVE_DESIGN_AUDIT.md](RESPONSIVE_DESIGN_AUDIT.md). This entry records the code
changes and the reasoning behind them.

### Why measure instead of look

A screenshot tells you whether something looks wrong; it does not tell you that a link is 32px
tall when it needs 44, and it cannot cover 340 combinations. The harness reads real geometry out
of the live DOM: every element's bounding box against the viewport, `scrollWidth` against
`clientWidth`, every interactive element's height and width, `naturalWidth` on every image, and
the console and network streams.

### The root cause behind most of it

One component explained 138 of the failures across 15 pages:

```js
// src/components/ui/button.jsx — the shadcn `default` size
default: "h-9 px-4 py-2 has-[>svg]:px-3",
```

`h-9` is a **fixed height** (36px). A fixed height beats padding, so:

1. Every default button on the site was 36px — under the 44px touch minimum.
2. Every `py-*` a caller added to a button was **dead code**. `md:py-3 lg:py-3.5` on the hero
   CTAs, `py-4` on "Book a demo" — none of it ever affected the height.

The fix is one line, at the component level rather than patched per page:

```js
default: "h-9 min-h-11 px-4 py-2 has-[>svg]:px-3 lg:min-h-9",
```

`min-h-11` (44px) is a *minimum*, so unlike `height` it can push the box taller. `lg:min-h-9`
puts desktop back to exactly 36px. Callers can still override, because `cn()` places their
`className` last and `tailwind-merge` keeps the last of a conflicting pair — which is why the
hero's own `md:min-h-12` still wins.

**Verified** at the boundary: every `[data-slot="button"]` on the home page measures 44px (or 48
where the hero asks for it) at 1023px, and exactly 36px at 1024, 1280 and 1440.

### Everything else changed

| File | Change | Why |
|---|---|---|
| `src/components/SiteHeader.jsx` | hamburger `h-10 w-10 sm:h-11 sm:w-11` → `h-11 w-11` | It was 40×40 below 640px — the most-used control on mobile, under the minimum. It is `lg:hidden`, so desktop is untouched |
| `src/components/SiteFooter.jsx` | `py-1.5` → `py-3`; `py-1` → `py-3 lg:py-1` | Footer links were 32px (mobile) and 28px (columns). 799 occurrences across all 21 public pages |
| `src/App.css` | touch floors for `.ecosystem-card-cta`, `.legal-doc-toc-link`, `.contact-tab` | 38px, 36px and 36px respectively |
| `src/admin/admin.css` | floors for `.admin-brand`, `.admin-btn--link` | 30px and 22px |
| `src/pages/NotFound.jsx` | two links → `inline-flex min-h-11 items-center` | 20px standalone navigation links |

Every CSS rule is wrapped in `@media (max-width: 1023.98px)` — the exact complement of Tailwind's
`lg`, so there is no gap or double-application at 1024px.

### What was deliberately NOT changed

Four categories looked like failures in the raw data and are not. They are recorded so nobody
"fixes" them later:

- **Inline prose links** (legal pages, `.trust-link`, `.admin-inline-link`) measure ~23px. These
  are links inside a sentence — *"contact us at privacy@epineon.ai"*. **WCAG 2.5.8 explicitly
  exempts them**, and padding them would break the line box they sit in.
- **`.ss-dot` carousel dots** are 10px visually but already carry a 24px hit area through
  `::before`, a documented decision so a row of fifteen still fits a 375px screen.
- **`.challenges-row__text` clipped at every width** is the collapsed state of an accordion —
  one ellipsised line that expands to `white-space: normal` when `.is-active`.
- **Decorative background layers** (`.landing-section__bg`, `.trust-ambience`) report clipped
  content because their oversized children are intentionally clipped. Nothing readable is cut.

### The `overflow-x: clip` guard — tested, not assumed

`src/index.css` sets `overflow-x: clip` on `html` and `body`. That is exactly the kind of global
guard that can hide overflow instead of fixing it, and it also means `scrollWidth` alone cannot
be trusted.

So it was removed at runtime on 10 pages at 320/375/768/1440 and the document re-measured with
nothing clipping: **clean at every width**. The guard is a safety net, not a cover-up. This is
corroborated independently by the per-element geometry check, which `clip` does not affect.

### Security, backend, data flow

**None involved.** This change touches CSS and JSX class strings only. No API route, serverless
function, Supabase table, query, policy or environment variable was read or written, and no new
dependency was added. The 142 existing tests — which cover the contact-form registry and its
drift guards — all still pass, confirming the form contract is untouched.

### Verification

See §9 and §10 of [docs/RESPONSIVE_DESIGN_AUDIT.md](RESPONSIVE_DESIGN_AUDIT.md) for the full
numbers.
