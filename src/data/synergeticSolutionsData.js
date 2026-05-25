/**
 * Our Synergetic Solutions — product copy and assets (unchanged from landing).
 * `logo` is a Vite-resolved URL; use optional `logoText` when no raster/SVG logo exists.
 */
import epiQuantumLogo from '../assets/logos/Epi Quantum/Epi-Quantum-logo.png'
import epiLeGalletLogo from '../assets/logos/Epi le Galet/Epi-LeGallet-logo-transparent.png'
import epicryptlogo from '../assets/logos/Epi Crypt/Epi-Crypt-logo-transparent.png'
import epimindedlogo from '../assets/logos/Epiminded/Epiminded-logo-transparent.png'
import { phoneShot } from '../lib/phoneScreenshot.js'
import epimindedScreen1 from '../assets/epiminded/screenshots/01-onboarding.png'
import epimindedScreen1_2x from '../assets/epiminded/screenshots/01-onboarding@2x.png'
import epimindedScreen2 from '../assets/epiminded/screenshots/02-interests.png'
import epimindedScreen2_2x from '../assets/epiminded/screenshots/02-interests@2x.png'
import epimindedScreen3 from '../assets/epiminded/screenshots/03-brain-booster.png'
import epimindedScreen3_2x from '../assets/epiminded/screenshots/03-brain-booster@2x.png'
import epimindedScreen4 from '../assets/epiminded/screenshots/04-article.png'
import epimindedScreen4_2x from '../assets/epiminded/screenshots/04-article@2x.png'
import epiWellLogo from '../assets/logos/Epi Nutrition/Epi-Well-logo-transparent.png'
import epiWellScreen1 from '../assets/epi-well/screenshots/01-metabolic-overview.png'
import epiWellScreen1_2x from '../assets/epi-well/screenshots/01-metabolic-overview@2x.png'
import epiWellScreen2 from '../assets/epi-well/screenshots/02-meal-details.png'
import epiWellScreen2_2x from '../assets/epi-well/screenshots/02-meal-details@2x.png'
import epiWellScreen3 from '../assets/epi-well/screenshots/03-score-reflection.png'
import epiWellScreen3_2x from '../assets/epi-well/screenshots/03-score-reflection@2x.png'
import epiWellScreen4 from '../assets/epi-well/screenshots/04-history.png'
import epiWellScreen4_2x from '../assets/epi-well/screenshots/04-history@2x.png'
import epiWellScreen5 from '../assets/epi-well/screenshots/05-nutrition-diet.png'
import epiWellScreen5_2x from '../assets/epi-well/screenshots/05-nutrition-diet@2x.png'
import epiWellScreen6 from '../assets/epi-well/screenshots/06-device.png'
import epiWellScreen6_2x from '../assets/epi-well/screenshots/06-device@2x.png'
import epitrustlogo from '../assets/logos/Epi Trust/Epi-Trust-logo-transparent.png'
import epiTrustScreen1 from '../assets/epi-trust/screenshots/01-health-dashboard.png'
import epiTrustScreen1_2x from '../assets/epi-trust/screenshots/01-health-dashboard@2x.png'
import epiTrustScreen2 from '../assets/epi-trust/screenshots/02-find-your-doctor.png'
import epiTrustScreen2_2x from '../assets/epi-trust/screenshots/02-find-your-doctor@2x.png'
import epiTrustScreen3 from '../assets/epi-trust/screenshots/03-epi-trust-care-chat.png'
import epiTrustScreen3_2x from '../assets/epi-trust/screenshots/03-epi-trust-care-chat@2x.png'
import epiTrustScreen4 from '../assets/epi-trust/screenshots/04-medications-list.png'
import epiTrustScreen4_2x from '../assets/epi-trust/screenshots/04-medications-list@2x.png'
import epiTrustScreen5 from '../assets/epi-trust/screenshots/05-medications-safety.png'
import epiTrustScreen5_2x from '../assets/epi-trust/screenshots/05-medications-safety@2x.png'
import epiTrustScreen6 from '../assets/epi-trust/screenshots/06-doctor-dashboard.png'
import epiTrustScreen7 from '../assets/epi-trust/screenshots/07-doctor-patients.png'
import epiTrustScreen8 from '../assets/epi-trust/screenshots/08-doctor-calendar.png'
import renaissanceNowLogo from '../assets/logos/Renaissance Now/Renaissance-Now-logo-transparent.png'
export const synergeticCategories = [
  {
    slug: 'biotech',
    name: 'Biotech & Longevity',
    tagline: 'Metabolic intelligence, precision nutrition, and clinical trust at scale.',
    products: [
      {
        id: 'epi-legalet',
        slug: 'epi-legalet',
        name: 'EPI LeGallet',
        logo: epiLeGalletLogo,
        description:
          'EPI LeGallet is an intelligent glycaemic sensor that captures real-time metabolic signals — glucose trends, insulin response, stress and sleep — and feeds them directly into EPIWELL. It is the data foundation of Epineon’s precision-health stack, turning continuous biological readings into structured, actionable insight. With adaptive, AI-driven feedback, LeGallet helps individuals and the coaches who guide them make better decisions about energy, focus and long-term metabolic health.',
        ctaLabel: 'Discover EPI LeGallet',
      },
      {
        id: 'epi-well',
        slug: 'epi-well',
        name: 'EPIWELL',
        logo: epiWellLogo,
        screenshots: [
          phoneShot(epiWellScreen1, epiWellScreen1_2x),
          phoneShot(epiWellScreen2, epiWellScreen2_2x),
          phoneShot(epiWellScreen3, epiWellScreen3_2x),
          phoneShot(epiWellScreen4, epiWellScreen4_2x),
          phoneShot(epiWellScreen5, epiWellScreen5_2x),
          phoneShot(epiWellScreen6, epiWellScreen6_2x),
        ],
        description:
          'EPIWELL is a personalised nutrition system built on biological data, behavioural insight and ingredient science. It interprets signals such as glucose response, stress, sleep and energy to deliver adaptive guidance and formulations matched to each person’s physiology. Designed for coaches, wellness organisations and individuals, EPIWELL turns continuous metabolic data into practical, evolving protocols that support cognition, performance and long-term health — personal to the individual, not one-size-fits-all.',
        ctaLabel: 'Discover Epi well',
        ctaHref: 'https://epiwell.tech/',
      },
      {
        id: 'epi-trust',
        slug: 'epi-trust',
        name: 'Epitrust',
        logo: epitrustlogo,
        screenshotSets: {
          phone: [
            phoneShot(epiTrustScreen1, epiTrustScreen1_2x, { width: 473, height: 1024 }),
            phoneShot(epiTrustScreen2, epiTrustScreen2_2x, { width: 473, height: 1024 }),
            phoneShot(epiTrustScreen3, epiTrustScreen3_2x, { width: 473, height: 1024 }),
            phoneShot(epiTrustScreen4, epiTrustScreen4_2x, { width: 473, height: 1024 }),
            phoneShot(epiTrustScreen5, epiTrustScreen5_2x, { width: 473, height: 1024 }),
          ],
          web: [
            phoneShot(epiTrustScreen6, epiTrustScreen6, { width: 1024, height: 440 }),
            phoneShot(epiTrustScreen7, epiTrustScreen7, { width: 1024, height: 440 }),
            phoneShot(epiTrustScreen8, epiTrustScreen8, { width: 1024, height: 440 }),
          ],
        },
        description:
          'Epitrust is a clinical assistant built with and for healthcare providers. It turns medical, nutritional and behavioural data into clear, shareable insight, reducing the time lost to documentation and data overload. Through contextual recommendations, structured follow-up and precision-nutrition modules, it supports clinicians across the consultation journey and strengthens patient engagement — helping providers deliver consistent, high-quality care at scale while keeping patient data protected.',
        ctaLabel: 'Discover Epi Trust',
      },
    ],
  },
  {
    slug: 'cybersecurity',
    number: '02',
    name: 'Cybersecurity & Privacy',
    tagline: 'Quantum-aware cryptography and sovereign protection for critical data.',
    products: [
      {
        id: 'epi-crypt',
        slug: 'epi-crypt',
        name: 'EPICRYPT',
        logo: epicryptlogo,
        description:
          "EPICRYPT secures private networks and communications against both today’s attacks and tomorrow’s quantum threats. Hybrid random-number generation combines patented quantum entropy with proven mathematical models to produce cryptographic keys that are unique, unpredictable and durable. Its IP encryptor protects data in motion at gigabit speeds without disrupting existing infrastructure — giving governments, financial institutions and critical-infrastructure operators transparent, audit-ready protection for sovereign data.",
        ctaLabel: 'Discover EPI Crypt',
      },
      {
        id: 'epi-quantum',
        slug: 'epi-quantum',
        name: 'EPIQUANTUM',
        logo: epiQuantumLogo,
        description:
          "EPIQUANTUM generates quantum-grade cryptographic keys engineered to remain secure in the era of quantum computing. Grounded in quantum mechanics, patented entropy models, custom hardware security modules and next-generation crypto-processors, it protects data that sovereign institutions cannot afford to lose — from classified records to financial transactions. EPIQUANTUM brings nation-grade safeguards to enterprises and critical infrastructure where trust and long-term resilience are non-negotiable.",
        ctaLabel: 'Discover EPIquantum',
      },
    ],
  },
  {
    slug: 'edtech',
    name: 'EdTech',
    tagline: 'Human potential, publishing, and cognitive performance.',
    products: [
      {
        id: 'renaissance-now',
        slug: 'renaissance-now',
        name: 'Renaissance Now',
        logo: renaissanceNowLogo,
        description:
          `"Renaissance Now" is not just a book; it's the business manifesto of Epineon, introducing Epi—a groundbreaking wearable wellness technology. Epi is designed to help individuals excel in life by harmonizing four essential aspects: physiological, psychological, social, and purposeful well-being.`,
        ctaLabel: 'Discover Renaissance Now',
        ctaHref: 'https://renaissancenow.org/',
      },
      {
        id: 'epi-minded',
        slug: 'epi-minded',
        name: 'Epiminded',
        logo: epimindedlogo,
        screenshots: [
          phoneShot(epimindedScreen1, epimindedScreen1_2x),
          phoneShot(epimindedScreen2, epimindedScreen2_2x),
          phoneShot(epimindedScreen3, epimindedScreen3_2x),
          phoneShot(epimindedScreen4, epimindedScreen4_2x),
        ],
        description:
          `Epiminded is a foresight and upskilling companion for founders, strategists and leadership teams operating under uncertainty. It combines curated trend intelligence with behavioural science to deliver personalised insight that sharpens decision-making, supports strategic thinking and surfaces the signals that matter, when they matter. Whether shaping a venture, redefining a mission or weighing a critical decision, Epiminded helps leaders anticipate change rather than react to it.`,
        ctaLabel: 'Discover Epiminded',
        ctaHref: 'https://epiminded.com/',
      },
    ],
  },
]
