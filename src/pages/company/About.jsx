import React from 'react'
import { Activity, Brain, Users, Sparkles, ArrowUpRight } from 'lucide-react'
import { PageShell } from '../../components/PageShell'
import { LandingSection } from '../../components/home/LandingSection'
import { CORPORATE_MANIFESTO } from '../../data/ecosystem.js'
import aboutFutureImage from '../../assets/about-future.png'
import aboutManifestoImage from '../../assets/about-manifesto.png'
import aboutVisionImage from '../../assets/about-vision.png'

const DIMENSIONS = [
  { icon: Activity, label: 'Body', body: 'Physical wellbeing, powered by metabolic and nutrition data.' },
  { icon: Brain, label: 'Mind', body: 'Deciding under pressure with more confidence, and keeping personal data with its owner.' },
  { icon: Users, label: 'People', body: 'Community, networking, and daily connection — so no one faces the hard things alone.' },
  { icon: Sparkles, label: 'Contribution', body: 'Turning personal experience into something that helps the next person.' },
]

function AboutStripRow({
  id,
  title,
  titleAs: TitleTag = 'h2',
  children,
  visual,
  visualModifier = '',
  bodyUnderTitle = false,
  visualUnderText = false,
  rowModifier = '',
}) {
  const body = <div className="about-strip-row__body">{children}</div>
  const visualNode = (
    <div className={`about-strip-row__visual${visualModifier ? ` ${visualModifier}` : ''}`}>{visual}</div>
  )

  if (visualUnderText) {
    return (
      <LandingSection className="about-strip-landing border-b border-white/5">
        <article id={id} className={`about-strip-row${rowModifier ? ` ${rowModifier}` : ''}`}>
          <div className="about-strip-row__inner about-strip-row__inner--stacked">
            <div className="about-strip-row__content">
              <div className="about-strip-row__title-frame">
                <TitleTag className="about-strip-row__title text-slate-900">{title}</TitleTag>
              </div>
              {body}
            </div>
            <div className="about-strip-row__visual-below">{visualNode}</div>
          </div>
        </article>
      </LandingSection>
    )
  }

  return (
    <LandingSection className="about-strip-landing border-b border-white/5">
      <article id={id} className={`about-strip-row${rowModifier ? ` ${rowModifier}` : ''}`}>
        <div className="about-strip-row__inner">
          <div className="about-strip-row__content">
            <div className="about-strip-row__title-frame">
              <TitleTag className="about-strip-row__title text-slate-900">{title}</TitleTag>
            </div>
            {bodyUnderTitle ? body : null}
          </div>
          <div className="about-strip-row__aside">
            {visualNode}
            {bodyUnderTitle ? null : body}
          </div>
        </div>
      </article>
    </LandingSection>
  )
}

function ManifestoStripRow({ children }) {
  return (
    <LandingSection className="about-strip-landing border-b border-white/5">
      <article className="about-strip-row about-strip-row--manifesto">
        <div className="about-manifesto-inner">
          <figure className="about-manifesto-figure">
            <img
              src={aboutManifestoImage}
              alt="Renaissance Now book cover — human and AI profiles"
              className="about-manifesto-figure__image"
              decoding="async"
              loading="lazy"
            />
          </figure>
          <div className="about-strip-row__content about-manifesto-content">
            <div className="about-strip-row__title-frame">
              <h2 className="about-strip-row__title text-slate-900">Our Manifesto</h2>
            </div>
            <div className="about-strip-row__body about-manifesto-body">{children}</div>
          </div>
        </div>
      </article>
    </LandingSection>
  )
}

export default function About() {
  return (
    <PageShell
      title="About Epineon"
      description="Our origin story, mission, vision, and the four-dimension model behind everything we build."
      path="/company/about"
    >
      <LandingSection
        id="about-mtp"
        withMeshBackground={false}
        className="about-page-hero landing-hero-section pt-32 lg:pt-40"
      >
        <div className="landing-hero-section__bg" aria-hidden>
          <div className="landing-hero-section__grid" />
          <div className="landing-hero-section__glow" />
        </div>
        <div className="relative z-10">
          <div className="site-content min-w-0">
            <div className="mx-auto max-w-4xl text-center">
              <p className="about-page-hero__eyebrow scroll-animate scroll-animate-delay-1 text-sm font-semibold uppercase tracking-[0.22em] text-[#c9a227]">
                Our MTP
              </p>
              <p className="about-page-hero__lead epineon-section-lead scroll-animate scroll-animate-delay-2 mt-3 text-balance text-slate-900">
                Stewarding people and organisations toward resilience, sovereignty and longevity.
              </p>
            </div>
          </div>
        </div>
      </LandingSection>

      <div className="about-strip">
        <AboutStripRow
          title="We help people and organisations stay in charge of their own future."
          titleAs="h1"
          bodyUnderTitle
          rowModifier="about-strip-row--future"
          visualModifier="about-strip-row__visual--editorial"
          visual={
            <figure className="about-strip-editorial">
              <img
                src={aboutFutureImage}
                alt="Global data trends across a three-dimensional world map"
                className="about-strip-editorial__image"
                decoding="async"
                loading="lazy"
              />
            </figure>
          }
        >
          <p className="about-section-body text-white/80">
            The world is changing faster than most institutions can absorb. Economies wobble, geopolitics keeps shifting, and AI is
            changing how decisions get made and how organisations are built. In that kind of world, people and
            organisations need the strength to absorb what&apos;s coming, the clarity to keep deciding for
            themselves, and foundations that last. That&apos;s the work we do.
          </p>
        </AboutStripRow>

        <ManifestoStripRow>
          <p className="about-section-body text-white/75">
            <em>{CORPORATE_MANIFESTO.name}</em> is the business manifesto of Epineon — our thesis on living well
            across body, mind, people, and contribution, and the role technology should play in service of a
            whole life.
          </p>
          <a
            href={CORPORATE_MANIFESTO.href}
            target="_blank"
            rel="noopener noreferrer"
            className="ecosystem-card-cta about-section-cta inline-flex"
          >
            Read {CORPORATE_MANIFESTO.name}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>
        </ManifestoStripRow>

        <AboutStripRow
          id="vision"
          title="Our Vision"
          bodyUnderTitle
          rowModifier="about-strip-row--vision"
          visualModifier="about-strip-row__visual--editorial"
          visual={
            <figure className="about-strip-editorial">
              <img
                src={aboutVisionImage}
                alt="People connected through technology across a global network"
                className="about-strip-editorial__image"
                decoding="async"
                loading="lazy"
              />
            </figure>
          }
        >
          <p className="about-section-body text-white/75">
            We see a world where people aren&apos;t blindsided by what comes next — where they understand their own
            body, take care of their own mind, lean on the people around them, and find meaning in what they give
            back. Where they hold their own data and approach hard decisions with the steadiness that comes from
            being prepared rather than reactive.
          </p>
          <p className="about-section-body text-white/75">
            This is what Science Tech for Life means to us: scientific exploration and technological advancement
            put in direct service of how long, how well, and how fully people live.
          </p>
        </AboutStripRow>

        <AboutStripRow
          id="mission"
          title="Our Mission"
          bodyUnderTitle
          visualUnderText
          rowModifier="about-strip-row--mission"
          visualModifier="about-strip-row__visual--grid"
          visual={
            <div className="about-dimensions-grid" aria-label="Four dimensions of a whole life">
              {DIMENSIONS.map((dim) => {
                const Icon = dim.icon
                return (
                  <div key={dim.label} className="about-dimension-cell">
                    <div className="about-dimension-cell__header">
                      <span className="why-item-icon lp-icon-chip about-dimension-cell__icon" aria-hidden>
                        <Icon className="about-dimension-cell__icon-svg" />
                      </span>
                      <h3 className="about-dimension-cell__label text-slate-900">{dim.label}</h3>
                    </div>
                    <p className="about-dimension-cell__body">{dim.body}</p>
                  </div>
                )
              })}
            </div>
          }
        >
          <p className="about-section-body about-mission-body text-white/80">
            At Epineon, we work across the four dimensions of a whole life: the body, the mind, the people around us,
            and what each of us adds to the world. Technology only matters when it serves all four — a person isn&apos;t
            well in one dimension if the other three are missing.
          </p>
          <p className="about-section-body about-mission-body text-white/80">
            Behind this sits a carefully chosen set of capabilities: AI to read patterns at scale, quantum simulation
            to model what classical computing can&apos;t, and fundamental research to keep pushing on the underlying
            questions. None of these tools leads the work — the people we serve do.
          </p>
        </AboutStripRow>
      </div>
    </PageShell>
  )
}
