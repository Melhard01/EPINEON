import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  resolveContactTab,
  resolveFromHash,
  contactTabSearch,
  INQUIRE_IDS,
  DEFAULT_INQUIRE_ID,
} from '../src/lib/contactTabs.js'
import { FORMS } from '../api/_lib/forms.js'

/** Which tab a /contact URL opens, in both the query and the legacy hash form. */

const tab = (search, hash = '') => {
  const r = resolveContactTab(search, hash)
  return `${r.mode}/${r.inquireId}`
}

// ------------------------------------------------------------ query strings

test('?tab= opens the named tab', () => {
  assert.equal(tab('?tab=demo'), 'demo/sales')
  assert.equal(tab('?tab=inquire&sub=sales'), 'inquire/sales')
  assert.equal(tab('?tab=inquire&sub=partnerships'), 'inquire/partnerships')
})

test('?tab=inquire without a sub falls back to the default sub-tab', () => {
  assert.equal(tab('?tab=inquire'), `inquire/${DEFAULT_INQUIRE_ID}`)
  assert.equal(tab('?tab=inquire&sub='), `inquire/${DEFAULT_INQUIRE_ID}`)
  assert.equal(tab('?tab=inquire&sub=nonsense'), `inquire/${DEFAULT_INQUIRE_ID}`)
})

test('a bare ?sub= is honoured, since it is unambiguous', () => {
  assert.equal(tab('?sub=partnerships'), 'inquire/partnerships')
  assert.equal(tab('?sub=sales'), 'inquire/sales')
})

test('casing and surrounding whitespace do not matter', () => {
  assert.equal(tab('?tab=INQUIRE&sub=Partnerships'), 'inquire/partnerships')
  assert.equal(tab('?tab=%20demo%20'), 'demo/sales')
})

test('a typo in ?tab= lands on a working form rather than a blank one', () => {
  assert.equal(tab('?tab=enquire'), 'demo/sales')
  assert.equal(tab('?tab='), 'demo/sales')
  assert.equal(tab('?tab=<script>alert(1)</script>'), 'demo/sales')
})

// -------------------------------------------------------------- legacy hash

test('the hash links already scattered across the site still work', () => {
  // FinalCTA, NotFound, Products, IndustryPage, VentureStudio, solutions.js,
  // industries.js all point at these.
  assert.equal(tab('', '#sales'), 'inquire/sales')
  assert.equal(tab('', '#partnerships'), 'inquire/partnerships')
  assert.equal(tab('', '#demo'), 'demo/sales')
  // ProductCard links to #waitlist, which has no tab of its own.
  assert.equal(tab('', '#waitlist'), 'demo/sales')
  assert.equal(tab('', ''), 'demo/sales')
})

test('query parameters beat a stale hash', () => {
  assert.equal(tab('?tab=demo', '#sales'), 'demo/sales')
  assert.equal(tab('?tab=inquire&sub=partnerships', '#sales'), 'inquire/partnerships')
})

test('an unrecognised ?tab= defers to the hash rather than overriding it', () => {
  assert.equal(tab('?tab=bogus', '#partnerships'), 'inquire/partnerships')
})

test('resolveFromHash tolerates a missing leading #', () => {
  assert.deepEqual(resolveFromHash('sales'), { mode: 'inquire', inquireId: 'sales' })
  assert.deepEqual(resolveFromHash(undefined), { mode: 'demo', inquireId: DEFAULT_INQUIRE_ID })
})

// ------------------------------------------------------------- writing back

test('switching tabs writes a URL that reopens the same tab', () => {
  for (const [mode, sub] of [['demo', 'sales'], ['inquire', 'sales'], ['inquire', 'partnerships']]) {
    const search = contactTabSearch(mode, sub)
    assert.equal(tab(search), `${mode}/${mode === 'demo' ? DEFAULT_INQUIRE_ID : sub}`)
  }
})

test('writing a tab keeps ?product= and drops a stale ?sub=', () => {
  const withProduct = contactTabSearch('inquire', 'partnerships', '?product=EPICRYPT')
  assert.match(withProduct, /product=EPICRYPT/)
  assert.equal(tab(withProduct), 'inquire/partnerships')

  // Leaving the Inquire tab must not leave its sub behind.
  const backToDemo = contactTabSearch('demo', 'partnerships', '?tab=inquire&sub=partnerships')
  assert.doesNotMatch(backToDemo, /sub=/)
  assert.equal(tab(backToDemo), 'demo/sales')
})

// -------------------------------------------------------------- drift guards

test('the sub-tabs match the tabs the Contact page renders', () => {
  const source = readFileSync(new URL('../src/pages/Contact.jsx', import.meta.url), 'utf8')
  const inquireBlock = source.slice(source.indexOf('const INQUIRE_TABS'), source.indexOf('const inputClass'))
  const ids = [...inquireBlock.matchAll(/id:\s*'([^']+)',/g)].map(([, id]) => id)

  assert.deepEqual(ids, INQUIRE_IDS, 'INQUIRE_TABS in Contact.jsx and INQUIRE_IDS have drifted apart')
})

test('every sub-tab is also a registered form, so its submissions file correctly', () => {
  const formIds = FORMS.filter((f) => !f.legacy).map((f) => f.id)
  for (const id of INQUIRE_IDS) {
    assert.ok(formIds.includes(id), `sub-tab "${id}" has no entry in api/_lib/forms.js`)
  }
  assert.ok(formIds.includes('demo'), 'the demo tab has no entry in api/_lib/forms.js')
})
