import React from 'react'
import { PageShell } from '../../components/PageShell'
import { TEAM } from '../../data/team.js'

export default function Team() {
  return (
    <PageShell
      title="Our Team"
      description="The people building Epineon across life science, cybersecurity, and future intelligence."
      path="/company/team"
      noindex
    >
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16">
        <div className="site-content min-w-0">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c9a227]">Company</p>
            <h1 className="epineon-h2 epineon-section-title mt-3 text-slate-900">Our Team</h1>
            <p className="epineon-body-large mt-5 text-white/80 text-lg leading-relaxed">
              A cross-domain team spanning life science, cybersecurity, and future intelligence.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 pb-24 pt-12 lg:pb-32">
        <div className="site-content min-w-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {TEAM.map((member) => (
              <div key={member.name} className="team-card">
                <img
                  src={member.photo}
                  alt={member.name}
                  className="team-card-photo"
                  loading="lazy"
                  decoding="async"
                />
                <h3 className="team-card-name mt-4 text-slate-900">{member.name}</h3>
                {member.title ? (
                  <p className="team-card-title">{member.title}</p>
                ) : (
                  <p className="team-card-title team-card-title--placeholder">Profile coming soon</p>
                )}
                {member.bio ? <p className="team-card-bio mt-2">{member.bio}</p> : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  )
}
