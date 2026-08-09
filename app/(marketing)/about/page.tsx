import type { Metadata } from 'next'
import Link from 'next/link'
import { IndependenceNotice } from '@/components/marketing/independence-notice'
import { PageHeader } from '@/components/marketing/page-header'

export const metadata: Metadata = {
  title: 'About | Chosen Workflow',
  description:
    'Why Chosen Workflow scores decisions rather than multiple choice, and how the platform is built around five-star service principles and luxury guest experience principles.',
}

const PRINCIPLES = [
  {
    title: 'Score the decision, not the recall',
    body: 'A multiple-choice question tests whether someone read the manual. A guest moment tests whether they can hold a standard under pressure. Every simulation presents full-sentence responses, and the guest reacts to the one chosen.',
  },
  {
    title: 'Use the weights the property uses',
    body: 'A single percentage tells a manager nothing. Results are weighted across five-star service principles, luxury guest experience principles, your written SOPs, and emotional intelligence, in the proportions your property already applies.',
  },
  {
    title: 'Make the result defensible',
    body: 'Scoring is deterministic. The same choices produce the same score every time, and every session is retained. When a result is challenged, there is a record to open.',
  },
  {
    title: 'Isolate tenants at the database',
    body: 'Every record carries a hotel group, and Postgres Row Level Security enforces it. Isolation that lives in application code is a policy. Isolation in the database is a guarantee.',
  },
] as const

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Built for properties that are measured, not surveyed."
        standfirst="Chosen Workflow exists because luxury service is judged on specific, observable behaviour, and most training platforms were never designed to produce a result a quality manager can act on."
      />

      <section className="border-t hairline">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow mb-2">Position</p>
          <h2 className="display mb-8 max-w-3xl text-2xl leading-snug text-ink">
            Standards are specific. Training that ignores that specificity produces confident staff
            and inconsistent service.
          </h2>
          <div className="grid max-w-4xl gap-6 text-ink-soft sm:grid-cols-2">
            <p>
              Five-star service principles describe behaviour at a level of detail most learning
              platforms flatten. The interval before a guest is acknowledged. Whether a name is used,
              and when. What is done with a complaint in the first sentence of the reply. These are
              not preferences. They are the behaviours a property is judged on.
            </p>
            <p>
              A platform that reduces all of it to a completion percentage cannot tell a manager
              which of their team will hold the standard on a difficult evening. Chosen Workflow was
              built to answer that question instead, and to keep the evidence behind the answer.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t hairline">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow mb-2">How we build</p>
          <h2 className="display mb-14 text-2xl text-ink">Four commitments</h2>

          <div className="grid gap-x-16 gap-y-12 sm:grid-cols-2">
            {PRINCIPLES.map((item) => (
              <div key={item.title} className="border-t hairline pt-6">
                <h3 className="display mb-3 text-lg text-ink">{item.title}</h3>
                <p className="text-sm text-stone">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t hairline">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow mb-2">Who it is for</p>
          <h2 className="display mb-6 max-w-2xl text-2xl text-ink">
            Learning and development teams inside luxury properties and hotel groups.
          </h2>
          <p className="max-w-2xl text-ink-soft">
            Typically a group L&amp;D lead running standards across several properties, a quality
            manager preparing for a mystery guest or brand inspection, or a general manager who wants a defensible read on
            where the team currently stands.
          </p>
          <div className="mt-10">
            <Link
              href="/contact"
              className="border border-ink bg-ink px-6 py-2.5 text-paper transition-colors hover:bg-transparent hover:text-ink"
            >
              Talk to us
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
