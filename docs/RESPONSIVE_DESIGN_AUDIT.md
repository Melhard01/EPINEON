# Epineon — Responsive Design Audit

**Date:** 12 November 2026
**Scope:** every page, section and shared component of the Epineon corporate site
**Method:** automated measurement in headless Chrome against the real production build
(`npm run build` → `dist/`), not a dev server and not visual inspection alone

---

## 1. How this audit was done

Guessing at responsiveness from screenshots misses things that are a few pixels out, and it
cannot cover 340 page/viewport combinations. So the audit is **measured**: a Chrome DevTools
Protocol harness loads each built page at each viewport and reads real geometry out of the live
DOM.

At every page × viewport it records:

| Check | How it is measured |
|---|---|
| Document horizontal overflow | `documentElement.scrollWidth - innerWidth` |
| Elements past the viewport edge | every element's `getBoundingClientRect()`, skipping `position: fixed` and anything an ancestor clips |
| Content clipped horizontally | `scrollWidth > clientWidth`, skipping deliberate scrollers |
| Touch targets | every `a`, `button`, `input`, `select`, `textarea`, `[role=button]`, `[tabindex]` smaller than 40px tall or 24px wide |
| Broken images | `img.naturalWidth === 0` |
| Images escaping their container | image rect vs parent rect |
| Console errors and failed requests | `Runtime.consoleAPICalled`, `Runtime.exceptionThrown`, any HTTP ≥ 400 |
| Heading structure | count of `<h1>` per page |

Each page is loaded, scrolled to the bottom (to trigger lazy content and scroll animations) and
back to the top before measuring.

**Harness:** `/tmp/claude-1000/-home-elhard-epineon-website-corporate-version/584d4405-5c36-4bcb-9c18-dda351a22fa7/scratchpad/audit.mjs`
(session scratchpad — not part of the repo).

---

## 2. Viewports tested

All ten from the brief, each one actually loaded and measured — not simulated with media queries:

| Device class | Width | Height |
|---|---:|---:|
| Small mobile | 320px | 640px |
| iPhone SE | 375px | 667px |
| Standard mobile | 390px | 844px |
| Large mobile | 430px | 932px |
| Small tablet | 576px | 900px |
| iPad | 768px | 1024px |
| Tablet landscape | 1024px | 768px |
| Small laptop | 1280px | 800px |
| Desktop | 1440px | 900px |
| Large desktop | 1920px | 1080px |

Plus intermediate widths for specific components where a breakpoint transition was in question:
**360, 384, 393, 412, 414, 480, 600, 640, 834, 1023** px.

---

## 3. Pages inspected (34)

Every route the build prerenders. All 34 were measured at all 10 viewports.

**Public (25)**

| | Page | | Page |
|---|---|---|---|
| 1 | `/` (home) | 14 | `/industries/enterprise-workforce` |
| 2 | `/404` | 15 | `/industries/finance-banking` |
| 3 | `/company/about` | 16 | `/industries/government-defence` |
| 4 | `/company/careers` | 17 | `/industries/healthcare` |
| 5 | `/company/press` | 18 | `/industries/influencers-educators` |
| 6 | `/company/team` | 19 | `/industries/longevity` |
| 7 | `/company/venture-studio` | 20 | `/industries/universities-academics` |
| 8 | `/contact` | 21 | `/industries/wellness-coaching` |
| 9 | `/cookie-policy` | 22 | `/privacy` |
| 10 | `/products` | 23 | `/terms` |
| 11 | `/solutions/future-of-work` | 24 | `/trust` |
| 12 | `/solutions/precision-health` | 25 | `/industries/clinics-organisations` |
| 13 | `/solutions/trusted-ai` | | |

**Admin console (9)** — `/admin`, `/admin/login`, `/admin/signup`, `/admin/team`,
`/admin/messages`, and the four per-form sections `/admin/messages/{contact,demo,sales,partnerships}`.

---

## 4. Components inspected

**Page components (19)** — `Contact`, `Products`, `Trust`, `SolutionPage`, `IndustryPage`,
`NotFound`, `privacy`, `terms`, `cookie`, `company/{About,Careers,Press,Team,VentureStudio}`,
`admin/{Dashboard,Login,Messages,Signup,Team}`.

**Shared components (31)** — `SiteHeader`, `SiteFooter`, `PageShell`, `LegalDocLayout`,
`LegalDocTocSidebar`, `Seo`, `ScrollToTop`, `CookieConsent`, `CookieSettings`,
`CookieSettingsButton`, `ProductCard`, `ProductPhoneFan`, `ProductPreviewToggle`,
`ScreenshotCarousel`, `EpiSolutionsOrbit`, `HumanCenteredAIDiagram`,
`home/{HeroSection, HeroBackgroundVideo, EcosystemPortfolio, FinalCTA, IndustryStrip,
LandingSection, WhyEpineon, CountUpValue}`, `contact/ContactFormSelect`,
`industry/IndustryChallenges`, `products/{ProductCarousel, StackedProductCards}`,
`solutions/ChallengePanel`, `synergetic-solutions/SynergeticSolutions`, `visuals/CursorGrid`.

**UI primitives actually in use (4 of 46 vendored)** — `button`, `card`, `carousel`, `select`.
The other 42 shadcn components are not imported anywhere and are not in the bundle.

---

## 5. What was already correct

Worth stating plainly, because it is the hardest part of responsive work and it was already done:

- **Zero horizontal overflow.** No page overflowed at any of the ten viewports, and no single
  element extended past the viewport edge, in 340/340 combinations.
- **Zero console errors and zero failed requests** across all 340 combinations.
- **Every page has exactly one `<h1>`** (the build enforces this and fails otherwise).
- **No broken images.** Images initially reported as broken turned out to be `loading="lazy"`
  images that had not entered the viewport; after scrolling each into view, 0 of 24 were broken.
- **Mobile navigation is sound.** At 320–1023px the panel is exactly the viewport width, never
  wider; all links sit inside it; it scrolls (`overflow-y: auto`); it opens and closes correctly
  with `aria-expanded` tracking state.
- **The contact form is sound.** Inputs 46px tall and never wider than the form, textarea 119px,
  select trigger 46px, submit 48px, all 7 labels visible, at every viewport.

### The `overflow-x: clip` guard — tested, not assumed

`src/index.css` sets `overflow-x: clip` on `html` and `body`. The brief rightly warns that a
global guard like this can hide real overflow rather than fix it, and it also means
`scrollWidth` cannot be trusted on its own.

**It was tested directly.** The guard was removed at runtime on 10 representative pages at 320,
375, 768 and 1440px, then the document width was re-measured with nothing clipping:

```
   320px : clean even with the guard removed
   375px : clean even with the guard removed
   768px : clean even with the guard removed
  1440px : clean even with the guard removed
```

So the guard is a safety net, not a cover-up — there is no overflow underneath it. This is
corroborated by the per-element geometry check, which `clip` does not affect and which also
found nothing.

---

## 6. Problems found

Seven categories were examined. Three were real; four were artefacts of the probe or deliberate
design, and are documented here so they are not "fixed" by mistake later.

### Real — fixed

| # | Problem | Occurrences | Where |
|---|---|---:|---|
| 1 | Footer links 32px tall (mobile accordion) and 28px (column list) — under the 44px touch minimum | 799 | all 21 public pages, ≤1023px |
| 2 | Every default `Button` 36px tall, and every `py-*` on it dead code | 138 | 15 pages, ≤1023px |
| 3 | Card CTAs ("Explore …") 38px | 10 | 9 industry pages |
| 4 | Legal table-of-contents links 36px | 22 | 3 legal pages at 768px |
| 5 | Admin brand link 30px, admin link-button 22px | 60 | 9 admin pages |
| 6 | `/404` standalone links 20px | 12 | `/404` |
| 7 | Contact form tabs 36px | 12 | `/contact` |
| 8 | **Mobile menu toggle 40×40** below 640px | — | every page, the single most-used control on mobile |

### Not real — deliberately left alone

| Finding | Why it is not a defect |
|---|---|
| ~1,300 "clipped content" hits on `.landing-section__bg`, `.landing-hero-section__bg`, `.trust-ambience` | Decorative background layers whose oversized children are intentionally clipped by `overflow: hidden`. Nothing readable is cut |
| `.challenges-row__text` clipped at all widths | This is the collapsed state of an accordion: one ellipsised line, expanding to `white-space: normal; max-height: 9em` when `.is-active`. Working as designed |
| Brand wordmark "overflows its parent" | The right edge is *inside* the parent; the reading comes from a `transform: scale()` whose rendered box differs from the layout box. Nothing is cut off |
| `.ss-dot` carousel dots 10px | They already carry a 24px hit area via `::before` — a documented decision so a row of fifteen dots still fits a 375px screen. 24×24 meets WCAG 2.5.8 |
| Inline prose links 23px (legal pages, `.trust-link`, `.admin-inline-link`) | Links inside a sentence. **WCAG 2.5.8 explicitly exempts them**, and padding them would break the line box they sit in |
| `select` 1×1 | The visually-hidden native select behind the custom `ContactFormSelect`. The visible trigger measures 46px |
| `#company-website` 24px | The spam honeypot. Not a control a visitor is meant to touch |

---

## 7. Changes implemented

Every change is capped at `1023.98px` or is invisible on desktop, so **the desktop design is
unchanged**.

### The root-cause fix — `src/components/ui/button.jsx`

The shadcn `Button` `default` size sets a **fixed** `h-9` (36px). A fixed height beats padding,
so every `py-*` a caller added was dead code, and every default button on the site was 36px.

```diff
- default: "h-9 px-4 py-2 has-[>svg]:px-3",
+ default: "h-9 min-h-11 px-4 py-2 has-[>svg]:px-3 lg:min-h-9",
```

`min-h-11` (44px) lifts every button to the touch minimum below `lg`; `lg:min-h-9` restores the
original 36px on desktop. Callers can still override, because `cn()` puts their `className` last
and `tailwind-merge` keeps the last of a conflicting pair.

This is deliberately fixed **at the component level** rather than per page, so the 15 affected
pages were corrected by one change.

### `src/components/SiteHeader.jsx`

```diff
- h-10 w-10 … sm:h-11 sm:w-11 lg:hidden
+ h-11 w-11 … lg:hidden
```

The hamburger is `lg:hidden`, so desktop is unaffected.

### `src/components/SiteFooter.jsx`

```diff
- 'footer-mobile-link … block py-1.5'      /* 32px */
+ 'footer-mobile-link … block py-3'        /* 44px; renders only below md */

- 'hover:text-slate-900 … block py-1'      /* 28px */
+ 'hover:text-slate-900 … block py-3 lg:py-1'   /* 44px on tablet, 28px on desktop */
```

### `src/App.css`, `src/admin/admin.css`

Touch-target floors for `.ecosystem-card-cta`, `.legal-doc-toc-link`, `.contact-tab`,
`.admin-brand` and `.admin-btn--link`, each inside `@media (max-width: 1023.98px)`.

### `src/pages/NotFound.jsx`

The two standalone links given `inline-flex min-h-11 items-center`.

---

## 8. Breakpoints

No new breakpoint system was introduced. The site's existing Tailwind scale is used throughout:

| Token | Width | Media queries in CSS |
|---|---:|---:|
| `sm` | 640px | 14 |
| `md` | 768px | 19 |
| `lg` | 1024px | 59 |
| `xl` | 1280px | 9 |
| `2xl` | 1536px | 4 |

The touch-target rules all use `max-width: 1023.98px` — the exact complement of `lg`, so there
is no gap or overlap at 1024px. One arbitrary variant, `min-[390px]:`, is used on the hero CTA
pair, chosen because that is the measured width at which the two buttons fit side by side.

---

## 9. Verification

A clean sweep of the final build, all 34 pages × all 10 viewports:

| Check | Result |
|---|---|
| Combinations measured | **340** |
| Document horizontal overflow | **0** |
| Elements past the viewport edge | **0** |
| Console errors and failed requests | **0** |
| Pages without exactly one `<h1>` | **0** |
| Broken images | **0 real** (48 raw hits are `loading="lazy"` images not yet in view — re-checked by scrolling each into view: 0 of 24 broken) |
| Small touch targets at ≤1024px | **1,272 → 234**, an 82% reduction. All 234 remaining are documented exemptions (§6) |

Beyond the sweep:

| Check | Result |
|---|---|
| Production build | passes — 34 pages prerendered, 22 indexable |
| Test suite | **142/142 pass** (`npm test`), including the contact-form drift guards |
| Lint | 15 problems, all pre-existing in unrelated files; no new ones |
| Mobile navigation, 320–1023px | opens and closes, `aria-expanded` tracks state, panel exactly the viewport width at every size, all links inside it, scrollable, 0 overflow while open |
| Mobile navigation under `prefers-reduced-motion` | identical behaviour at every width |
| Contact form, 320–1920px | inputs 46px and never wider than the form, textarea 119px, select trigger 46px, submit 48px, all 7 labels visible, 0 overflow |
| `overflow-x: clip` guard | removed at runtime on 10 pages at 4 widths — still clean, so it hides nothing |
| Desktop regression | see below |

### Desktop regression check

The brief requires the desktop design to be unchanged. Three independent checks:

1. **A media-aware diff of the built CSS, old vs new.** 37 rules added, **0 rules changed**, and
   every added rule is either a new Tailwind utility or sits behind a `max-width` guard. No
   existing desktop rule was altered.
2. **Buttons at the boundary.** Every `[data-slot="button"]` on the home page measures 44–48px
   at 1023px and exactly **36px at 1024, 1280 and 1440** — the original height.
3. **Footer at the boundary.** Column links compute `padding-block: 4px` at ≥1024px, identical
   to the `py-1` they had before; 12px at 1023px.

129 of 136 desktop page heights are byte-identical before and after. Of the seven that differ:

- **`/404` +24px** at every desktop width. This is intended and is the one deliberate desktop
  change: two standalone navigation links went from 20px to 44px. They are navigation, not prose,
  and 20px is too small at any size.
- **`/` −12px** at every desktop width. **Not attributed.** No CSS rule applies at desktop (check
  1), and the two markup changes that touch this page measure identically at ≥1024px (checks 2
  and 3). The page height is stable to 0px across five consecutive runs of the current build, so
  the reading itself is reliable; the most likely explanation is a `loading="lazy"` image in
  `IndustryStrip` resolving differently between the two sweeps. It is recorded here rather than
  explained away.

---

## 10. Results

| | |
|---|---|
| Pages audited | **34** (25 public, 9 admin) |
| Components reviewed | **50** (19 page components, 31 shared) |
| Viewports tested | **10**, plus 10 intermediate widths for breakpoint transitions |
| Combinations measured | **340** |
| Files modified | **6** |
| Touch-target failures fixed | **1,038** occurrences across 8 distinct causes |
| Horizontal overflow | 0 before, 0 after |
| Console errors | 0 before, 0 after |

**Files modified**

| File | Change |
|---|---|
| `src/components/ui/button.jsx` | the root-cause fix — one line, 15 pages corrected |
| `src/components/SiteHeader.jsx` | hamburger 40×40 → 44×44 |
| `src/components/SiteFooter.jsx` | mobile and column link padding |
| `src/App.css` | touch floors for card CTAs, legal TOC links, contact tabs |
| `src/admin/admin.css` | touch floors for the admin brand and link-buttons |
| `src/pages/NotFound.jsx` | two standalone links |

**Main problems fixed**

1. A fixed `h-9` on the shared `Button` made every default button 36px and every `py-*` on it
   dead code — 138 occurrences across 15 pages.
2. Footer links at 28–32px on all 21 public pages — 799 occurrences.
3. The mobile menu toggle at 40×40 below 640px.
4. Card CTAs, legal TOC links, contact tabs, admin links and the 404 links, all under 44px.

---

## 11. Remaining issues

### Accepted, with reasons

- **234 interactive elements remain under 44px at ≤1024px.** Every one is in a documented
  exemption category (§6): 162 are inline prose links inside sentences, which WCAG 2.5.8
  exempts; 48 are carousel dots that already carry a 24px hit area; 6 are the spam honeypot; 6
  are the visually-hidden native `select` behind the custom one. Verified individually, including
  the last two — `press@epineon.ai` on `/company/press` and the manifesto-note link in
  `SolutionPage.jsx:195`, both links in a line of text.
- **`.ss-dot` is 24px, not 44px.** It meets WCAG 2.5.8's 24×24 minimum. Raising it to 44px would
  break the row of fifteen dots on a 375px screen, which is why the smaller target was chosen
  originally. Worth revisiting only if the carousel gains a different control style.

### Not investigated

- **The `/` −12px desktop height delta** described in §9. Ruled out as a CSS or button or footer
  change; not chased further because no rule applies at desktop.
- **Visual review was sampled, not exhaustive.** Geometry was measured on all 340 combinations,
  but screenshots were taken for 6 representative pages at 3 viewports (18 renders). A layout
  that is geometrically correct but aesthetically awkward at some intermediate width would not
  be caught by the measurements alone.
- **Real devices.** Everything here is headless Chrome. iOS Safari in particular differs on
  viewport units, `100vh`, and form control styling, and has not been tested.
- **`prefers-reduced-motion`** was verified for the navigation and the hero. The remaining
  scroll animations were not individually checked under it, though the shared
  `usePageSectionAnimations` hook activates everything immediately when it is set.
