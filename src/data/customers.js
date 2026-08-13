/**
 * Customer stories. Chargea & Avenis are real testimonials; NeuroLab / BioSync / Meridian are
 * plausible placeholders to be replaced with real partners later.
 * TODO: confirm facts + publishing permission before launch.
 */
export const CUSTOMERS = [
  {
    slug: 'chargea',
    company: 'Chargea',
    industry: 'Fintech',
    ecosystem: 'Enterprise AI',
    context: 'Chargea is a fast-growing fintech company navigating a rapidly evolving technology landscape.',
    outcomeStat: 'Infrastructure that scales with the business',
    challenge: 'As a fast-scaling fintech, Chargea needed a technology partner who could evolve its infrastructure as quickly as the business grew — without the roadmap becoming a bottleneck.',
    outcome: 'A long-term partnership with aligned roadmaps, giving Chargea infrastructure that scales with demand instead of constraining it.',
    quote:
      'We have a continuous business and partnership together with Epineon because our interests are now merged for the better. Their cutting-edge technology and forward-thinking strategies have been pivotal in our journey towards sustainable growth.',
    shortQuote: 'Their technology and forward-thinking strategies have been pivotal to our growth.',
    attribution: 'William Beny',
    role: 'Chargea',
  },
  {
    slug: 'avenis',
    company: 'Avenis',
    industry: 'Digital Infrastructure',
    ecosystem: 'Enterprise AI',
    context: 'Avenis modernizes digital infrastructure for organizations operating at scale.',
    outcomeStat: 'Modernised — without a minute of downtime',
    challenge: 'Avenis had to modernise critical digital infrastructure while keeping live services running for customers operating at scale.',
    outcome: 'A faster, more resilient digital foundation, modernised without downtime.',
    quote:
      'We worked hand in hand with Epineon to revolutionize our digital infrastructure. Their innovative approach and attention to detail were instrumental in streamlining our processes.',
    shortQuote: 'Their innovative approach was instrumental in streamlining our processes.',
    attribution: 'Peter Craft',
    role: 'Avenis',
  },
  {
    slug: 'neurolab',
    company: 'NeuroLab Institute',
    industry: 'Research & Life Science',
    ecosystem: 'Health & Wellness',
    outcomeStat: 'Responsible AI, put to work in the lab',
    context: 'NeuroLab Institute conducts applied research in human-centered AI and life science.',
    challenge: 'Needed an AI partner whose data ethics and human-centered design principles matched their research standards.',
    outcome: 'A long-term research partnership advancing responsible AI applications in life science.',
    quote:
      "Epineon's approach to human-centered AI design aligns precisely with how we think about responsible research applications. A rare partner in this space.",
    attribution: 'Dr. Sofia Marenne',
    role: 'Director of Applied Research, NeuroLab Institute',
  },
  {
    slug: 'biosync',
    company: 'BioSync Research',
    industry: 'Metabolic Science',
    ecosystem: 'Health & Wellness',
    outcomeStat: 'From metabolic research to protocol, faster',
    context: 'BioSync Research translates metabolic science into real-world health protocols.',
    challenge: 'Needed tools to translate complex metabolic research into actionable, real-world health protocols.',
    outcome: 'Accelerated research-to-protocol pipeline using the EpiWell precision health stack.',
    quote:
      'Working with Epineon has accelerated how we translate metabolic research into real-world protocols. Their precision health stack is exactly what applied science needs.',
    attribution: 'Prof. Arnaud Tessier',
    role: 'Head of Metabolic Science, BioSync Research',
  },
  {
    slug: 'meridian',
    company: 'Meridian Academic Center',
    industry: 'Education & Leadership',
    ecosystem: 'Future Intelligence',
    outcomeStat: 'Sharper decisions under pressure',
    context: 'Meridian Academic Center runs executive leadership and workforce-development programs.',
    challenge: 'Sought an AI-powered foresight tool for their executive leadership development program.',
    outcome: 'SoulChain deployed as a core resource, improving strategic decision-making across cohorts.',
    quote:
      "SoulChain has become a core resource for our leadership development program. It's the only AI tool we've seen that genuinely improves strategic thinking under pressure.",
    attribution: 'Dr. Leila Okonkwo',
    role: 'Program Director, Meridian Academic Center',
  },
]

export const CUSTOMER_BY_SLUG = Object.fromEntries(CUSTOMERS.map((c) => [c.slug, c]))
export const CUSTOMER_INDUSTRIES = [...new Set(CUSTOMERS.map((c) => c.industry))]
