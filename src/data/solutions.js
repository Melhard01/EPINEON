/**
 * Cross-ecosystem solution pages (by job-to-be-done). Each references products from
 * `ecosystem.js` by id and routes buyers to contact sales. Copy is positioning, not facts;
 * caseStudy facts are flagged TODO until verified.
 */
export const SOLUTIONS = {
  'trusted-ai': {
    path: '/solutions/trusted-ai',
    eyebrow: 'Use cases',
    title: 'Trusted AI for Regulated Industries',
    lede: 'The leverage of modern AI, inside a perimeter you control — built for organisations that can’t afford to be wrong.',
    seoDescription:
      'Private, sovereign AI for finance, government, and critical infrastructure — built around the standards you operate under.',
    problemHeading: 'The challenge',
    problem: [
      'Regulated organisations want the advantage of modern AI, but they operate under rules that make sending sensitive data to a third-party model a non-starter. Compliance teams need provable control over where data lives and how it is used.',
      'Meanwhile, security teams are already preparing for a post-quantum world, where today’s encryption no longer holds. Adopting AI without addressing both at once doesn’t remove the risk — it just relocates it.',
    ],
    solutionHeading: 'How Epineon addresses it',
    solutionIntro:
      'Epineon brings AI inside your environment, on infrastructure you govern — paired with quantum-aware cryptography and compliance-grade workflows.',
    credibilityLine:
      'Designed for environments governed by GDPR, HIPAA and national-security frameworks.',
    productIds: ['qaegis', 'epicrypt', 'epiquantum'],
    audienceHeading: 'Built for',
    industries: ['finance-banking', 'government-defence', 'healthcare'],
    caseStudy: null,
    ctaHeading: 'Bring trusted AI inside your perimeter.',
    ctaLabel: 'Request a Demo',
    ctaHref: '/contact#demo',
  },

  'precision-health': {
    path: '/solutions/precision-health',
    eyebrow: 'Use cases',
    title: 'Precision Health Intelligence',
    lede: 'Preventive, personalised health intelligence that keeps biological data with the people it describes.',
    seoDescription:
      'Preventive, data-owned health intelligence for clinicians and the people they care for.',
    problemHeading: 'The challenge',
    problem: [
      'Health data is fragmented across devices, labs, and apps — and rarely owned by the person it describes. Care stays reactive when it could be preventive.',
      'Clinicians are stretched thin, drowning in data without the time to turn it into clear, personalised guidance.',
    ],
    solutionHeading: 'How Epineon addresses it',
    solutionIntro:
      'A connected stack that captures real-world signals, turns them into clear guidance, and keeps ownership of the data with the person — not the platform.',
    productIds: ['epiwell', 'epi-legallet', 'epitrust'],
    audienceHeading: 'Who it’s for',
    industries: ['healthcare', 'wellness-coaching'],
    caseStudy: null,
    proofNote: 'Healthcare pilots are underway; we publish results once partners are ready to be named.',
    ctaHeading: 'Make health preventive and personal.',
    ctaLabel: 'Talk to Our Health Team',
    ctaHref: '/contact#sales',
  },

  'future-of-work': {
    path: '/solutions/future-of-work',
    eyebrow: 'Use cases',
    title: 'Future of Work & Learning',
    lede: 'Foresight and upskilling that help leaders stay ahead of how AI is rewriting their work.',
    seoDescription:
      'Foresight and AI-augmented upskilling for organisations navigating disruption.',
    problemHeading: 'The challenge',
    problem: [
      'AI is rewriting how work gets done faster than most organisations can adapt. Leaders struggle to anticipate what’s coming, and teams fall behind on the skills that suddenly matter.',
      'Generic training doesn’t fix this. People need foresight and learning that meet them where they are.',
    ],
    solutionHeading: 'How Epineon addresses it',
    solutionIntro:
      'Epiminded turns trend intelligence and behavioural science into personalised foresight and micro-learning that sharpen decision-making and strategic thinking.',
    productIds: ['epiminded'],
    manifestoNote: {
      text: 'Renaissance Now is Epineon’s manifesto: our thesis on living and working well across body, mind, people and contribution, and the role technology should play in service of a whole life. It is the foundation everything in Future Intelligence is built on.',
      label: 'Read Renaissance Now',
      href: 'https://renaissancenow.org/',
    },
    audienceHeading: 'Use cases',
    useCases: [
      'Foresight for leadership teams facing AI disruption',
      'Personalised micro-learning that adapts to each person',
      'Communities that learn and trade insight together',
    ],
    industries: ['enterprise-workforce', 'universities-academics', 'influencers-educators'],
    ctaHeading: 'Prepare your organisation for what’s next.',
    ctaLabel: 'Start a Conversation',
    ctaHref: '/contact#sales',
  },
}
