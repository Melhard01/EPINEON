/**
 * Background media for the industry "Where it gets hard" cards.
 *
 * Each card can play its own video. Until per-card clips exist, the card falls back to the
 * industry's still image (reused from the home-page "Find your path" cards) with a slow
 * drift, so the panel never reads as a dead background.
 *
 * Adding a video for a card = change that challenge in `industries.js` from a plain string
 * to `{ text: '…', video: '/media/<file>.mp4', poster: '…' }`. The component picks it up;
 * nothing here needs editing.
 */
import financeBanking from '../assets/industries/finance-banking-challenges.jpg'
import healthcare from '../assets/industries/healthcare-challenges.jpg'
import governmentDefence from '../assets/industries/government-defence-challenges.jpg'
import wellnessCoaching from '../assets/industries/wellness-coaching-challenges.jpg'
import longevity from '../assets/industries/longevity-challenges.jpg'
import clinicsOrganisations from '../assets/industries/clinics-organisations-challenges.jpg'
import enterpriseWorkforce from '../assets/industries/enterprise-workforce-challenges.jpg'
import universitiesAcademics from '../assets/industries/universities-academics-challenges.jpg'
import creators from '../assets/find-your-path/creators.png'

export const INDUSTRY_FALLBACK_IMAGE = {
  'finance-banking': financeBanking,
  healthcare,
  'government-defence': governmentDefence,
  'wellness-coaching': wellnessCoaching,
  longevity,
  'clinics-organisations': clinicsOrganisations,
  'enterprise-workforce': enterpriseWorkforce,
  'influencers-educators': creators,
  'universities-academics': universitiesAcademics,
}

/**
 * object-position for the fallback still, where the default centre crop would
 * cut something that matters. The panel is far squarer than a wide image on
 * tablet and phone, so anything the viewer needs to read has to be anchored.
 */
export const INDUSTRY_FALLBACK_DISPLAY = {
  // An infographic has to be read, not cropped: `contain` shows all of it and
  // `ratio` lets the panel take the image's shape below the two-column
  // breakpoint, so nothing is cut and no dead space is left around it.
  'government-defence': { contain: true, ratio: '1479 / 704' },
  // A photo crops cleanly, so it keeps `cover` and fills the card beside the
  // list. `ratio` only matters once the panel stacks, where matching the
  // image's shape means the crop takes nothing off it.
  'wellness-coaching': { ratio: '1408 / 768' },
  longevity: { ratio: '1312 / 816' },
  'clinics-organisations': { ratio: '1408 / 768' },
  'enterprise-workforce': { ratio: '1312 / 816' },
  'universities-academics': { ratio: '1408 / 768' },
}
