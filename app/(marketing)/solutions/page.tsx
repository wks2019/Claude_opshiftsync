import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/marketing/page-header'

export const metadata: Metadata = {
  title: 'Solutions | Chosen Workflow',
  description:
    'Courses, decision-based simulations, versioned SOPs, weighted competency scoring, and verifiable certificates for luxury hospitality properties.',
}

const CAPABILITIES = [
  {
    name: 'Courses',
    body: 'Modules, lessons, and quizzes authored in the admin CMS. Your standards, your language, structured so a new starter can finish a module inside a shift.',
  },
  {
    name: 'Simulations',
    body: 'Branching guest scenarios where staff choose full-sentence responses and the guest reacts. Scoring is deterministic, so two people who make the same choices receive the same result.',
  },
  {
    name: 'SOPs',
    body: 'Versioned procedures built from six block types: Procedure, Checklist, Table, Rating and Competency, Field and Record, Media. Publish a new version without losing the record of the last one.',
  },
  {
    name: 'Competencies',
    body: 'Weighted scoring against Forbes Travel Guide and LQA standards, tracked per person and rolled up per module, using the weights your property actually applies.',
  },
  {
    name: 'Certificates',
    body: 'Issued on completion, with expiry, and publicly verifiable. An inspector or a new employer can confirm a certificate without an account.',
  },
  {
    name: 'Multi-property',
    body: 'Every record is scoped to a hotel group and enforced by Postgres Row Level Security, at the database, not in application code. One property cannot read another.',
  },
] as const

const ROLES = [
  {
    role: 'Staff',
    line: 'Take courses, run simulations, read the SOP that applies to the moment, and see the Audit Ledger for every session.',
  },
  {
    role: 'Manager',
    line: 'Team rollup across the same four dimensions, an at-risk list, and drill-down into any individual result.',
  },
  {
    role: 'Administrator',
    line: 'Invite and suspend staff, author content, and set the standards weights that every score in the property is calculated from.',
  },
] as const

export default function SolutionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Solutions"
        title="One platform for the standards you are inspected against."
        standfirst="Chosen Workflow covers the full route from learning a standard to proving it: authored courses, decision-based simulations, versioned SOPs, weighted scoring, and a certificate that can be verified from outside the platform."
      />

      <section className="border-t hairline">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow mb-2">What is included</p>
          <h2 className="display mb-14 text-2xl text-ink">Six parts, one record</h2>

          <div className="grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((item) => (
              <div key={item.name} className="border-t hairline pt-6">
                <h3 className="display mb-3 text-lg text-ink">{item.name}</h3>
                <p className="text-sm text-stone">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t hairline bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow mb-2 text-brass-soft">By role</p>
          <h2 className="display mb-14 text-2xl text-paper">
            Three dashboards, built for three different jobs
          </h2>

          <dl className="grid gap-10 sm:grid-cols-3">
            {ROLES.map((item) => (
              <div key={item.role} className="border-t border-paper/20 pt-6">
                <dt className="eyebrow mb-3 text-brass-soft">{item.role}</dt>
                <dd className="text-sm text-paper/70">{item.line}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-t hairline">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="display max-w-2xl text-2xl text-ink">
            See a scenario scored against your own weights.
          </h2>
          <p className="mt-4 max-w-xl text-ink-soft">
            We will run one of your real guest moments through the platform and show you the Audit
            Ledger it produces.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link
              href="/contact"
              className="border border-ink bg-ink px-6 py-2.5 text-paper transition-colors hover:bg-transparent hover:text-ink"
            >
              Request a demo
            </Link>
            <Link
              href="/pricing"
              className="eyebrow border-b border-brass pb-1 text-ink transition-colors hover:text-brass"
            >
              Pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
