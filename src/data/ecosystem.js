/**
 * Epineon corporate hub — single source of truth for the ecosystem → product map.
 *
 * The corporate site is a HUB: every product card routes OUTBOUND to the product's
 * own domain. Adding a future product = one entry here (no homepage rebuild).
 *
 * Fields per product:
 *   id          stable key / anchor id
 *   name        display name
 *   positioning one-line value prop (hub-level, not deep features)
 *   audience    short audience tag
 *   accent      brand-accent hex (the product's own flavor; parent system stays neutral)
 *   logo        imported asset URL (optional; falls back to name text)
 *   href        outbound destination
 *   status      'live' (real domain) | 'soon' (under development)
 *   external    true => routes to a different domain (open in new tab)
 *   demoHref    optional internal route (e.g. the demo form, product prefilled) — takes
 *               precedence over href/status for the card + menu CTA
 *   note        optional sub-note (e.g. hardware/software pairing)
 */
import epicryptLogo from '../assets/logos/Epi Crypt/Epi-Crypt-logo-transparent.png'
import epiquantumLogo from '../assets/logos/Epi Quantum/Epi-Quantum-logo.png'
import epiwellLogo from '../assets/logos/Epi Nutrition/Epi-Well-logo-transparent.png'
import epilegalletLogo from '../assets/logos/Epi le Galet/Epi-LeGallet-logo-transparent.png'
import epitrustLogo from '../assets/logos/Epi Trust/Epi-Trust-logo-transparent.png'
import epimindedLogo from '../assets/logos/Epiminded/Epiminded-logo-transparent.png'

/** Corporate inquiries / coming-soon products route here (stays on the hub). */
export const CORPORATE_CONTACT_HREF = '/#CTA'

export const ECOSYSTEMS = [
  {
    id: 'enterprise-ai',
    name: 'Enterprise AI',
    eyebrow: 'Security & Privacy',
    categoryLabel: 'ENTERPRISE AI & SECURITY',
    cardHeadline: "Sovereign AI infrastructure for organisations that can't afford to be wrong.",
    motif: 'shield',
    accent: '#38bdf8',
    solutionHref: '/solutions/trusted-ai',
    solutionCta: 'Explore Security Solutions',
    tagline: 'Trusted infrastructure and private AI systems for organisations that cannot compromise on security.',
    products: [
      {
        id: 'qaegis',
        name: 'Qaegis',
        positioning: 'Private AI sandboxes that let enterprises use LLMs without exposing their data.',
        description:
          'Qaegis gives enterprises a private, sovereign environment to put large language models to work without sensitive data ever leaving their control. Models run inside isolated sandboxes governed by your own access, residency and audit policies, so teams gain the productivity of modern AI while meeting the standards banks, regulators and security functions operate under — adopting AI on their own terms, without trading away confidentiality or compliance.',
        audience: 'Enterprises · Banks · CISOs',
        accent: '#22d3ee',
        href: 'https://quantumaegis.ai/',
        status: 'live',
        external: true,
      },
      {
        id: 'epicrypt',
        name: 'EPICRYPT',
        positioning: 'Quantum-aware encryption that protects sovereign and defence traffic at line speed.',
        audience: 'Sovereign defense · Critical infrastructure · Gov',
        accent: '#38bdf8',
        logo: epicryptLogo,
        href: CORPORATE_CONTACT_HREF,
        status: 'live',
        external: false,
        demoHref: '/contact?product=EPICRYPT#demo',
      },
      {
        id: 'epiquantum',
        name: 'EPIQUANTUM',
        positioning: 'Quantum cryptographic keys safeguarding sovereign, nation-grade defence data long after quantum computers arrive.',
        audience: 'Sovereign defense · Finance',
        accent: '#818cf8',
        logo: epiquantumLogo,
        href: CORPORATE_CONTACT_HREF,
        status: 'live',
        external: false,
        demoHref: '/contact?product=EPIQUANTUM#demo',
      },
    ],
  },
  {
    id: 'health-wellness',
    name: 'Health & Wellness',
    eyebrow: 'Preventive & Personalized',
    categoryLabel: 'HEALTH & WELLNESS',
    cardHeadline: 'Preventive, personalised health — owned by the people it describes.',
    motif: 'pulse',
    accent: '#34d399',
    solutionHref: '/solutions/precision-health',
    solutionCta: 'Explore Health Solutions',
    tagline: 'Preventive healthcare and personalized wellness, powered by data the person owns.',
    products: [
      {
        id: 'epiwell',
        name: 'EPIWELL',
        positioning: 'Personalised nutrition and metabolic intelligence built on your own biology.',
        audience: 'Coaches · Wellness orgs · Individuals',
        accent: '#5fb87a',
        logo: epiwellLogo,
        href: 'https://epiwell.tech/',
        status: 'live',
        external: true,
      },
      {
        id: 'epi-legallet',
        name: 'EPI LeGallet',
        positioning: 'A glycaemic biosensor streaming real-time metabolic signals into EpiWell.',
        audience: 'Individuals · Coaches · Clinicians',
        accent: '#5fb87a',
        logo: epilegalletLogo,
        href: CORPORATE_CONTACT_HREF,
        status: 'soon',
        external: false,
        note: 'Hardware sensor, pairs with EPIWELL',
      },
      {
        id: 'epitrust',
        name: 'Epitrust',
        positioning: 'An AI co-pilot for clinicians across the consultation journey.',
        audience: 'Doctors · Clinics · Patients',
        accent: '#3b82f6',
        logo: epitrustLogo,
        href: CORPORATE_CONTACT_HREF,
        status: 'soon',
        external: false,
      },
    ],
  },
  {
    id: 'future-intelligence',
    name: 'Future Intelligence',
    eyebrow: 'Foresight & Upskilling',
    categoryLabel: 'FUTURE INTELLIGENCE',
    cardHeadline: 'Foresight and upskilling for leaders facing constant change.',
    motif: 'compass',
    accent: '#a78bfa',
    solutionHref: '/solutions/future-of-work',
    solutionCta: 'Explore Intelligence Solutions',
    tagline: 'Helping organisations and people anticipate technological change and stay ahead of it.',
    products: [
      {
        id: 'epiminded',
        name: 'Epiminded',
        positioning: 'Foresight and AI upskilling for leaders navigating constant change.',
        audience: 'Organizations · Creators',
        accent: '#a78bfa',
        logo: epimindedLogo,
        href: 'https://epiminded.com/',
        status: 'live',
        external: true,
      },
    ],
  },
]

/** Flat list of every product (handy for the mega-menu / products grid). */
export const ALL_PRODUCTS = ECOSYSTEMS.flatMap((eco) =>
  eco.products.map((p) => ({ ...p, ecosystemId: eco.id, ecosystemName: eco.name })),
)

/** Corporate-level content (NOT a product) — surfaced in About / Vision narrative only. */
export const CORPORATE_MANIFESTO = {
  id: 'renaissance-now',
  name: 'Renaissance Now',
  kind: 'manifesto',
  positioning: 'The Epineon manifesto — our thesis on living well across body, mind, people, and contribution.',
  href: 'https://renaissancenow.org/',
  external: true,
}
