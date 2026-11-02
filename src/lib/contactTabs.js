/**
 * Which contact tab a URL asks for, and how to write that back.
 *
 * Two URL shapes reach /contact and both have to keep working:
 *
 *   ?tab=demo                      explicit, survives being pasted into an ad,
 *   ?tab=inquire&sub=sales         an email or a QR code, and is readable in
 *   ?tab=inquire&sub=partnerships  analytics
 *
 *   #demo  #sales  #partnerships   the older shape, still hard-coded in
 *                                  FinalCTA, NotFound, Products, IndustryPage,
 *                                  VentureStudio, solutions.js and
 *                                  industries.js
 *
 * Query parameters win when both are present: they are the explicit request,
 * and a stale hash left over from an earlier click should not override one.
 *
 * Kept free of React so the rules can be unit-tested directly
 * (tests/contactTabs.test.js) instead of only through a rendered page.
 */

/** The sub-tabs under "Inquire". Mirrors INQUIRE_TABS in src/pages/Contact.jsx. */
export const INQUIRE_IDS = ['sales', 'partnerships']

export const DEFAULT_INQUIRE_ID = 'sales'

const MODES = ['demo', 'inquire']

const clean = (value) => String(value ?? '').trim().toLowerCase()

/** Legacy hash links. An unknown hash falls through to the demo tab, as before. */
export function resolveFromHash(hash) {
  const id = clean(hash).replace(/^#/, '')
  if (INQUIRE_IDS.includes(id)) return { mode: 'inquire', inquireId: id }
  return { mode: 'demo', inquireId: DEFAULT_INQUIRE_ID }
}

/**
 * @param {string} search  location.search, e.g. "?tab=inquire&sub=sales"
 * @param {string} hash    location.hash, e.g. "#sales"
 * @returns {{mode: 'demo'|'inquire', inquireId: 'sales'|'partnerships'}}
 */
export function resolveContactTab(search, hash) {
  const params = new URLSearchParams(search || '')
  const tab = clean(params.get('tab'))
  const sub = clean(params.get('sub'))
  const validSub = INQUIRE_IDS.includes(sub) ? sub : null

  if (tab === 'inquire') {
    return { mode: 'inquire', inquireId: validSub ?? DEFAULT_INQUIRE_ID }
  }
  if (tab === 'demo') {
    return { mode: 'demo', inquireId: DEFAULT_INQUIRE_ID }
  }
  // ?sub=partnerships on its own says plainly enough which tab is wanted.
  if (validSub) {
    return { mode: 'inquire', inquireId: validSub }
  }
  // An unrecognised ?tab= is ignored rather than honoured, so a typo lands on
  // a working form instead of a blank one.
  return resolveFromHash(hash)
}

/**
 * The query string for a tab, preserving everything else already in the URL
 * (notably ?product=, which prefills the product field).
 */
export function contactTabSearch(mode, inquireId, currentSearch = '') {
  const params = new URLSearchParams(currentSearch || '')
  params.set('tab', MODES.includes(mode) ? mode : 'demo')
  if (mode === 'inquire') {
    params.set('sub', INQUIRE_IDS.includes(inquireId) ? inquireId : DEFAULT_INQUIRE_ID)
  } else {
    params.delete('sub')
  }
  return `?${params.toString()}`
}
