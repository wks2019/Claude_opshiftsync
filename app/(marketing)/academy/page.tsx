import type { Metadata } from 'next'
import Link from 'next/link'
import { AuditLedger } from '@/components/audit-ledger'
import { IndependenceNotice } from '@/components/marketing/independence-notice'
import { PageHeader } from '@/components/marketing/page-header'

export const metadata: Metadata = {
  title: 'Hospitality Academy | Chosen Workflow',
  description:
    'Courses, decision-based simulations, weighted competency scoring and verifiable certificates, authored from your own standards.',
}

const CAPABILITIES = [
  {
    name: 'Courses',
    body: 'Modules, lessons and quizzes authored in the admin CMS. Your standards, your language, structured so a new starter can finish a module inside a shift.',
  },
  {
    name: 'Simulations',
    body: 'Branching guest scenarios where staff choose full-sentence responses and the guest reacts. Scoring is deterministic, so two people who make the same choices receive the same result.',
  },
  {
    name: 'Competencies',
    body: 'Weighted scoring against five-star service principles and luxury guest experience principles, tracked per person and rolled up per module, using the weights your property actually applies.',
  },
  {
    name: 'Certificates',
    body: 'Issued on completion, with an expiry date, and publicly verifiable. A manager or a new employer can confirm a certificate without an account.',
  },
  {
    name: 'Learning paths',
    body: 'Role-based sequences, so a commis chef and a front desk agent are not handed the same reading list on their first morning.',
  },
  {
    name: 'Manager view',
    body: 'Team rollup across the same four dimensions, an at-risk list, and drill-down into any individual result.',
  },
] as const

const DIMENSIONS = [
  { name: 'Five-Star Service Principles', weight: '35' },
  { name: 'Luxury Guest Experience', weight: '30' },
  { name: 'Standard Procedure', weight: '25' },
  { name: 'Emotional Intelligence', weight: '10' },
] as const

const DEMO_RESULT = { forbesScore: 100, lqaScore: 94, sopScore: 96, eiScore: 98 }

export default function AcademyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Hospitality Academy"
        title="Does this person know the standard?"
        standfirst="Training authored from your own procedures, scenarios that behave like real guests, and a score your quality team can act on. Not a completion percentage."
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

      {/* The ledger */}
      <section className="border-t hairline bg-paper-raised">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <p className="eyebrow mb-2">The Score Ledger</p>
            <h2 className="display max-w-[16ch] text-2xl text-ink">
              Four dimensions, weighted the way your property weights them
            </h2>
            <p className="mt-5 max-w-[36ch] text-ink-soft">
              Every session produces the same sheet. Not a single vanity number, and not a
              percentage that means nothing to the person reading it.
            </p>
            <dl className="mt-10">
              {DIMENSIONS.map((d) => (
                <div
                  key={d.name}
                  className="flex items-baseline justify-between border-t hairline py-3 last:border-b"
                >
                  <dt className="text-sm text-ink-soft">{d.name}</dt>
                  <dd className="eyebrow">wt {d.weight}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <div className="border hairline bg-paper p-7">
              <div className="flex items-baseline justify-between border-b hairline pb-4">
                <span className="display text-lg text-ink">In-Room Dining</span>
                <span className="eyebrow">Session 04</span>
              </div>
              <AuditLedger result={DEMO_RESULT} finalScore={96.9} />
            </div>
            <p className="eyebrow mt-4">Actual output. Not a mock-up.</p>
          </div>
        </div>
      </section>

      {/* Boundary with OPS */}
      <section className="border-t hairline">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow mb-2">Where Academy ends</p>
          <h2 className="display mb-6 max-w-[24ch] text-2xl text-ink">
            Learning something and still being able to do it are different questions
          </h2>
          <p className="max-w-2xl text-ink-soft">
            Academy proves someone learned the standard: a course, taken once, producing a
            certificate. Hospitality OPS proves they can still do it today: a short assessment,
            taken repeatedly, producing a competency record. Same engine, different question.
          </p>
          <Link
            href="/ops"
            className="eyebrow mt-10 inline-block border-b border-brass pb-1 pt-2 text-ink transition-colors hover:text-brass-text"
          >
            Hospitality OPS
          </Link>
        </div>
      </section>

      <section className="border-t hairline">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="display max-w-2xl text-2xl text-ink">
            See a scenario scored against your own weights.
          </h2>
          <p className="mt-4 max-w-xl text-ink-soft">
            We will run one of your real guest moments through the platform and show you the ledger
            it produces.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <a
              href="mailto:hello@chosenworkflow.com?subject=Academy demo request"
              className="eyebrow border border-ink bg-ink px-5 py-3 text-paper transition-colors hover:bg-transparent hover:text-ink"
            >
              Book a demo
            </a>
            <Link
              href="/pricing"
              className="eyebrow border-b border-brass pb-1 pt-2 text-ink transition-colors hover:text-brass-text"
            >
              Pricing
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t hairline">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <p className="eyebrow mb-3">Independence</p>
          <IndependenceNotice className="max-w-2xl text-sm text-stone" />
        </div>
      </section>
    </>
  )
}
