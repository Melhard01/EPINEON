import React from 'react'
import { Activity, Brain, Users, Sparkles, ArrowUpRight } from 'lucide-react'
import { PageShell } from '../../components/PageShell'
import { CORPORATE_MANIFESTO } from '../../data/ecosystem.js'

// The four-dimension model (moved here from the homepage, per brief).
const DIMENSIONS = [
  { icon: Activity, label: 'Body', body: 'Physical wellbeing, powered by metabolic and nutrition data.' },
  { icon: Brain, label: 'Mind', body: 'Deciding under pressure with more confidence, and keeping personal data with its owner.' },
  { icon: Users, label: 'People', body: 'Community, networking, and daily connection — so no one faces the hard things alone.' },
  { icon: Sparkles, label: 'Contribution', body: 'Turning personal experience into something that helps the next person.' },
]

export default function About() {
  return (
    <PageShell
      title="About Epineon"
      description="Our origin story, mission, vision, and the four-dimension model behind everything we build."
      path="/company/about"
    >
      {/* Hero / origin */}
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16">
        <div className="site-content min-w-0">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c9a227]">Our MTP</p>
            <p className="epineon-section-lead mt-3 text-balance text-slate-900">
              Stewarding people and organisations toward resilience, sovereignty and longevity.
            </p>
          </div>
          <div className="mt-12 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c9a227]">About</p>
            <h1 className="epineon-h2 epineon-section-title mt-3 text-slate-900">
              We help people and organisations stay in charge of their own future.
            </h1>
            <p className="epineon-body-large mt-6 text-white/80 text-base leading-relaxed lg:text-lg">
              The world is changing faster than most institutions can absorb. Economies wobble, geopolitics keeps shifting, and AI is
              changing how decisions get made and how organisations are built. In that kind of world, people and
              organisations need the strength to absorb what&apos;s coming, the clarity to keep deciding for
              themselves, and foundations that last. That&apos;s the work we do.
            </p>
            {/* TODO: replace with the real founding origin story + year. */}
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="border-t border-white/5 py-14 lg:py-20">
        <div className="site-content min-w-0">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-14">
            <h2 className="epineon-h2 epineon-section-title shrink-0 text-slate-900 lg:w-72">Our Manifesto</h2>
            <div className="min-w-0 flex-1 space-y-5">
              <p className="epineon-body-large text-white/75 text-base leading-relaxed lg:text-lg">
                <em>{CORPORATE_MANIFESTO.name}</em> is the business manifesto of Epineon — our thesis on living well
                across body, mind, people, and contribution, and the role technology should play in service of a
                whole life.
              </p>
              <a
                href={CORPORATE_MANIFESTO.href}
                target="_blank"
                rel="noopener noreferrer"
                className="ecosystem-card-cta inline-flex"
              >
                Read {CORPORATE_MANIFESTO.name}
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="border-t border-white/5 py-14 lg:py-20">
        <div className="site-content min-w-0">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-14">
            <h2 className="epineon-h2 epineon-section-title shrink-0 text-slate-900 lg:w-72">Our Mission</h2>
            <div className="min-w-0 flex-1 space-y-5">
              <p className="epineon-body-large text-white/75 text-base leading-relaxed lg:text-lg">
                At Epineon, we work across the four dimensions of a whole life: the body, the mind, the people around
                us, and what each of us adds to the world. Technology only matters when it serves all four — a person
                isn&apos;t well in one dimension if the other three are missing.
              </p>
              <p className="epineon-body-large text-white/75 text-base leading-relaxed lg:text-lg">
                Behind this sits a carefully chosen set of capabilities: AI to read patterns at scale, quantum
                simulation to model what classical computing can&apos;t, and fundamental research to keep pushing on
                the underlying questions. None of these tools leads the work — the people we serve do.
              </p>
            </div>
          </div>

          {/* Four-dimension model */}
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {DIMENSIONS.map((dim) => {
              const Icon = dim.icon
              return (
                <div key={dim.label} className="why-item">
                  <span className="why-item-icon lp-icon-chip" aria-hidden>
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="why-item-label mt-4 text-slate-900">{dim.label}</h3>
                  <p className="epineon-body mt-2 text-white/70 text-sm leading-relaxed">{dim.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section id="vision" className="border-t border-white/5 py-14 lg:py-20">
        <div className="site-content min-w-0">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-14">
            <h2 className="epineon-h2 epineon-section-title shrink-0 text-slate-900 lg:w-72">Our Vision</h2>
            <div className="min-w-0 flex-1 space-y-5">
              <p className="epineon-body-large text-white/75 text-base leading-relaxed lg:text-lg">
                We see a world where people aren&apos;t blindsided by what comes next — where they understand their own
                body, take care of their own mind, lean on the people around them, and find meaning in what they give
                back. Where they hold their own data and approach hard decisions with the steadiness that comes from
                being prepared rather than reactive.
              </p>
              <p className="epineon-body-large text-white/75 text-base leading-relaxed lg:text-lg">
                This is what Science Tech for Life means to us: scientific exploration and technological advancement
                put in direct service of how long, how well, and how fully people live.
              </p>
            </div>
          </div>
        </div>
      </section>

    </PageShell>
  )
}
