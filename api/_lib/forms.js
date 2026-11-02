/**
 * The form registry — the server's source of truth for which public forms exist.
 *
 * WHY THIS FILE EXISTS
 * Every public form posts to the same endpoint. Before this registry the only
 * record of *which* form a submission came from was the `subject` string and a
 * `[label]` prefix inside the message body — both chosen by the browser and
 * never checked. Routing a submission on that basis means letting the client
 * decide where its own message files.
 *
 * So: the client sends an `id` and nothing else. The server matches that id
 * against the list below and looks the display NAME up here. A `form_name` in
 * a request body is ignored outright — there is no code path that reads one.
 *
 * Kept free of I/O, of `process.env` and of any Supabase import, because it is
 * imported from three places:
 *   - api/_lib/validation.js   (server: decides what gets stored)
 *   - src/routes.jsx           (build: one prerendered admin route per form)
 *   - src/pages/admin/*        (browser: the dashboard's sections)
 * The security-critical side owns the data and the UI reads from it, never the
 * other way round.
 */

/**
 * Where anything unrecognised lands: submissions from a cached bundle built
 * before this registry, and anything whose id does not match. It is a real
 * section in the dashboard, so nothing is ever invisible to an administrator.
 */
export const LEGACY_FORM_ID = 'contact'

/**
 * `name` is the form's label exactly as the website shows it — these are the
 * same strings src/pages/Contact.jsx renders on its tabs, which is also what
 * the old client put in `subject`, so the backfill in
 * supabase/migrations/20261102000000_submission_forms.sql maps cleanly.
 */
export const FORMS = [
  {
    id: LEGACY_FORM_ID,
    name: 'Contact',
    path: '/contact',
    // Not a form on the site: the bucket for submissions that predate form_id.
    legacy: true,
  },
  { id: 'demo', name: 'Demo request', path: '/contact#demo' },
  { id: 'sales', name: 'Sales & Enterprise', path: '/contact#sales' },
  { id: 'partnerships', name: 'Partnerships & Ventures', path: '/contact#partnerships' },
]

const BY_ID = new Map(FORMS.map((form) => [form.id, form]))

export const FORM_IDS = FORMS.map((form) => form.id)

export function isKnownFormId(value) {
  return typeof value === 'string' && BY_ID.has(value)
}

export function getForm(id) {
  return BY_ID.get(id) ?? null
}

/**
 * Resolve whatever the client sent to an id this server recognises.
 *
 * Deliberately falls back instead of rejecting: a visitor on a cached bundle
 * that predates `formId` must still be able to reach us. Their message lands in
 * the legacy bucket rather than being lost.
 */
export function resolveFormId(value) {
  const id = typeof value === 'string' ? value.trim().toLowerCase() : ''
  return BY_ID.has(id) ? id : LEGACY_FORM_ID
}

/**
 * The stored display name. Always derived here from an already-resolved id —
 * never taken from, or influenced by, the request body.
 */
export function formNameFor(id) {
  return (BY_ID.get(id) ?? BY_ID.get(LEGACY_FORM_ID)).name
}

/**
 * Label for a row whose form_id is not in the registry — only reachable if a
 * row were written outside /api/contact. Falls back to the stored name, then
 * to the raw id, so an administrator always sees something truthful.
 */
export function displayFormName(formId, storedName) {
  const known = BY_ID.get(formId)
  if (known) return known.name
  const stored = typeof storedName === 'string' ? storedName.trim() : ''
  return stored || formId || 'Unknown form'
}
