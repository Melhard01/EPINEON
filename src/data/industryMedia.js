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
import publicSector from '../assets/find-your-path/public-sector.png'
import wellness from '../assets/find-your-path/wellness.png'
import personal from '../assets/find-your-path/personal.png'
import programmes from '../assets/find-your-path/programmes.png'
import leadership from '../assets/find-your-path/leadership.png'
import creators from '../assets/find-your-path/creators.png'
import academia from '../assets/find-your-path/academia.png'

export const INDUSTRY_FALLBACK_IMAGE = {
  'finance-banking': financeBanking,
  healthcare,
  'government-defence': publicSector,
  'wellness-coaching': wellness,
  longevity: personal,
  'clinics-organisations': programmes,
  'enterprise-workforce': leadership,
  'influencers-educators': creators,
  'universities-academics': academia,
}
