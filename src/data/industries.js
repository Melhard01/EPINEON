/**
 * Industry (vertical) pages. Each references products from `ecosystem.js` by id and links
 * to a related solution page. Copy is positioning; caseStudy facts are flagged TODO.
 */
export const INDUSTRIES = {
  'finance-banking': {
    path: '/industries/finance-banking',
    title: 'Finance & Bank',
    headline: 'AI built for the standards banks, insurers, and financial institutions actually operate under.',
    seoDescription: 'Private, sovereign, quantum-ready AI for banks, insurers, and financial institutions.',
    team: 'finance & bank',
    challenges: [
      'Data-residency and compliance rules make public LLMs a non-starter for banks.',
      'Quantum computing threatens the cryptography protecting today’s transactions.',
      'Audit and explainability requirements that generic AI tools can’t meet.',
    ],
    approach: [
      'Banks and insurers can’t send regulated data to a public model.',
      'Qaegis puts modern AI inside a perimeter you control; EPICRYPT protects transactions in motion; EPIQUANTUM future-proofs keys against quantum attacks.',
      'All while meeting audit and explainability demands your regulators expect.',
    ],
    productIds: ['qaegis', 'epiquantum', 'epicrypt'],
    relatedSolution: '/solutions/trusted-ai',
    caseStudy: {
      company: 'Chargea',
      industry: 'Fintech',
      quote:
        'We have a continuous business and partnership together with Epineon because our interests are now merged for the better. Their cutting-edge technology and forward-thinking strategies have been pivotal in our journey towards sustainable growth.',
      attribution: 'William Beny · Chargea',
    },
  },

  healthcare: {
    path: '/industries/healthcare',
    title: 'Healthcare & Clinics',
    headline: 'AI that earns clinical trust — and protects patient data.',
    seoDescription: 'AI that helps clinicians deliver better care, faster, without compromising trust.',
    team: 'healthcare',
    challenges: [
      'Patient data demands privacy guarantees most AI tools can’t provide.',
      'Clinicians lose time to documentation and data overload.',
      'Fragmented records make personalised, preventive care hard to deliver.',
    ],
    approach: [
      'Clinical trust starts with protecting patient data.',
      'EpiTrust co-pilots the consultation, turning scattered medical and behavioural data into clear, shareable guidance.',
      'EPIWELL converts continuous signals into preventive, personalised care plans — without sending records to a public model.',
    ],
    productIds: ['epitrust', 'epiwell'],
    relatedSolution: '/solutions/precision-health',
    caseStudy: null, // TODO: add a real clinic/provider story
  },

  'government-defence': {
    path: '/industries/government-defence',
    title: 'Government & Defence',
    headline: 'Sovereign, quantum-ready AI for the public sector and critical infrastructure.',
    seoDescription: 'Sovereign, quantum-aware AI for government bodies and critical infrastructure.',
    team: 'public sector',
    challenges: [
      'Sensitive data can never leave sovereign control.',
      'Post-quantum threats put long-lived classified data at risk.',
      'Legacy infrastructure must adopt AI without adding attack surface.',
    ],
    approach: [
      'Sovereignty is non-negotiable.',
      'Qaegis keeps sensitive workloads under your control; EPICRYPT secures communications in transit; EPIQUANTUM protects long-lived data against post-quantum threats.',
      'Legacy infrastructure can adopt AI without widening the attack surface.',
    ],
    productIds: ['qaegis', 'epiquantum', 'epicrypt'],
    relatedSolution: '/solutions/trusted-ai',
    caseStudy: {
      company: 'Avenis',
      industry: 'Digital infrastructure',
      quote:
        'We worked hand in hand with Epineon to revolutionize our digital infrastructure. Their innovative approach and attention to detail were instrumental in streamlining our processes.',
      attribution: 'Peter Craft · Avenis',
    },
  },

  'wellness-coaching': {
    path: '/industries/wellness-coaching',
    title: 'Wellness & Coaching',
    headline: 'Precision wellness tools that scale your practice.',
    seoDescription: 'Precision wellness tools for coaches, practitioners, and independent creators.',
    team: 'wellness',
    challenges: [
      'Coaches juggle data from many devices with no unified view.',
      'Generic plans don’t reflect each client’s biology.',
      'Scaling personalised guidance is manual and time-consuming.',
    ],
    approach: [
      'Stop stitching together a dozen disconnected apps.',
      'EPIWELL unifies each client’s signals; EPI LeGallet streams real-time glucose and metabolic data.',
      'Give biology-specific guidance and scale a personalised practice without scaling your hours.',
    ],
    productIds: ['epiwell', 'epi-legallet'],
    relatedSolution: '/solutions/precision-health',
    caseStudy: null, // TODO: add a real coach/practitioner story
  },

  longevity: {
    path: '/industries/longevity',
    title: 'Longevity & Personal Health',
    headline: 'Own your metabolic data — and finally know if you’re actually getting healthier.',
    seoDescription: 'Unified, data-owned metabolic health for individuals optimising longevity — powered by EPIWELL and the EPI LeGallet biosensor.',
    team: 'longevity',
    challenges: [
      'Spending $200+ a month on patch CGMs and apps, with no unified picture.',
      'No honest answer to the only question that matters: am I getting healthier?',
      'Compliance dies after the second sensor — the habit never sticks.',
    ],
    approach: [
      'EPIWELL pulls glucose, sleep, activity and nutrition into one dashboard.',
      'Your own data — not generic protocols — drives personal recommendations.',
      'EPI LeGallet keeps tracking non-invasive, so the habit sticks past sensor number two.',
    ],
    productIds: ['epiwell', 'epi-legallet'],
    relatedSolution: '/solutions/precision-health',
    ctaHeadline: 'Ready to understand your own biology?',
    ctaButton: 'Explore EPIWELL',
    ctaHref: 'https://epiwell.tech/',
    caseStudy: null,
  },

  'clinics-organisations': {
    path: '/industries/clinics-organisations',
    title: 'Clinics & Organisations',
    headline: 'Deliver measurable, sticky metabolic outcomes — under your own brand.',
    seoDescription: 'White-label metabolic health programmes for clinics and organisations, with cohort dashboards and outcome reporting.',
    team: 'clinical programmes',
    challenges: [
      'Dependent on Dexcom / Abbott supply, with thin margins.',
      'Client compliance collapses around week 4 as patch friction sets in.',
      'Patch friction quietly kills your 12-week programmes.',
    ],
    approach: [
      'EPIWELL gives your team a cohort dashboard, white-label experience, and outcome reporting (PDF, CSV).',
      'EPI LeGallet removes the patch friction that breaks 12-week programmes.',
      'EpiTrust adds a clinician co-pilot across the consultation.',
    ],
    productIds: ['epiwell', 'epi-legallet', 'epitrust'],
    relatedSolution: '/solutions/precision-health',
    ctaHeadline: 'Bring a branded metabolic programme to your clients.',
    ctaButton: 'Book a programme demo',
    ctaHref: '/contact#demo',
    caseStudy: null,
  },

  'enterprise-workforce': {
    path: '/industries/enterprise-workforce',
    title: 'Enterprise & Workforce',
    headline: 'Lead through AI disruption with foresight your competitors don’t have.',
    seoDescription: 'Foresight and workforce readiness for CEOs and entrepreneurs navigating AI disruption.',
    team: 'enterprise',
    challenges: [
      'AI is reshaping your market faster than annual strategy cycles can react.',
      'Reskilling the workforce is urgent, but it’s unclear which skills will still matter.',
      'Bet-the-company decisions demand foresight, not guesswork, about what’s coming next.',
    ],
    approach: [
      'Leadership decisions can’t run on guesswork.',
      'Epiminded combines trend intelligence and behavioural science to show how AI is reshaping your market.',
      'Turn foresight into a planning input so strategy keeps pace with disruption.',
    ],
    productIds: ['epiminded'],
    relatedSolution: '/solutions/future-of-work',
    ctaHeadline: 'Ready to lead through AI disruption?',
    caseStudy: null, // TODO: add a real enterprise/founder story
  },

  'influencers-educators': {
    path: '/industries/influencers-educators',
    title: 'Influencers & Educators',
    headline: 'Stay ahead of the curve your audience expects you to see first.',
    seoDescription: 'Future-of-work foresight for education influencers and independent creators.',
    team: 'creator',
    challenges: [
      'Your audience expects credible, current insight on a field that shifts every week.',
      'Turning complex AI and future-of-work trends into clear content eats your time.',
      'Standing out means foresight your followers can’t find anywhere else.',
    ],
    approach: [
      'Your audience follows you to understand what’s next.',
      'Epiminded distils complex AI and future-of-work signals into clear, credible foresight.',
      'Spend less time tracking noise and more time publishing insight that keeps you ahead.',
    ],
    productIds: ['epiminded'],
    relatedSolution: '/solutions/future-of-work',
    ctaHeadline: 'Give your audience the signal, not the noise.',
    ctaButton: 'Explore Epiminded',
    caseStudy: null, // TODO: add a real creator/influencer story
  },

  'universities-academics': {
    path: '/industries/universities-academics',
    title: 'Universities & Academics',
    headline: 'Prepare students and faculty for a future that keeps rewriting the curriculum.',
    seoDescription: 'Foresight and upskilling for universities, faculty, and academic researchers.',
    team: 'academic',
    challenges: [
      'Curricula can’t keep pace with how fast AI is redefining the skills graduates need.',
      'Faculty and students lack a clear view of the careers that will actually exist.',
      'Teaching and research demand trustworthy, future-focused intelligence.',
    ],
    approach: [
      'Curricula struggle to keep pace with AI.',
      'Epiminded gives faculty and students a structured view of where skills and careers are heading.',
      'Programmes, research and teaching stay aligned with the roles graduates will actually need.',
    ],
    productIds: ['epiminded'],
    relatedSolution: '/solutions/future-of-work',
    ctaHeadline: 'Let’s prepare your students for what’s actually next.',
    ctaButton: 'Speak with our education team',
    caseStudy: null, // TODO: add a real university/programme story
  },
}
