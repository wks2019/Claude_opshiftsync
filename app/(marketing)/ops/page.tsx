import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/marketing/page-header'

export const metadata: Metadata = {
  title: 'Hospitality OPS | Chosen Workflow',
  description:
    'The SOP system and staff testing. Versioned procedures your team reads mid-shift, and short assessments that prove competency is still current.',
}

const BLOCKS = [
  { name: 'Procedure', body: 'Ordered steps. The thing itself, written the way it is actually done.' },
  { name: 'Checklist', body: 'Items to tick, for the parts of a shift that are a sequence rather than a judgement.' },
  { name: 'Table', body: 'Reference data. Cover counts, timings, temperatures, allocations.' },
  { name: 'Rating and Competency', body: 'The scale a supervisor marks against, attached to the procedure it belongs to.' },
  { name: 'Field and Record', body: 'What gets written down, and where it goes afterwards.' },
  { name: 'Media', body: 'A photograph of the correct setup is worth more than a paragraph describing it.' },
] as const

const TESTING = [
  {
    name: 'Question bank',
    body: 'Multiple choice, multiple answer and fill-in-the-blank, filed by section: menu knowledge, minibar, LQA standards, Forbes standards.',
  },
  {
    name: 'Departmental',
    body: 'Front desk, food and beverage, housekeeping. A question set belongs to the department it is asked of, not to a general pool.',
  },
  {
    name: 'Repeatable',
    body: 'A competency is not a thing earned once. Assessments are taken again, and the record shows whether someone is still current.',
  },
  {
    name: 'Written by you',
    body: 'Managers author questions in the CMS. No ticket, no release, no waiting for us.',
  },
] as const

const VERSIONING = [
  'A published version is never overwritten. The previous one stays readable.',
  'Every change records who made it and when.',
  'Staff always read the current published version, never a draft.',
  'An inspector can be shown what the procedure said on a given date.',
] as const

export default function OpsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Hospitality OPS"
        title="Is the standard actually being followed?"
        standfirst="The procedures your team reads mid-shift, and the short assessments that prove they can still do what they were signed off on. Training answers whether someone learned it. This answers whether it is happening."
      />

      {/* SOP system */}
      <section className="border-t hairline">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow mb-2">The SOP system</p>
          <h2 className="display mb-6 max-w-[20ch] text-2xl text-ink">
            Six block types, because a procedure is not just prose
          </h2>
          <p className="mb-14 max-w-2xl text-ink-soft">
            A standard operating procedure that is only paragraphs gets skimmed and then ignored.
            These are the six shapes a real procedure takes, and each one is authored as itself
            rather than typed into a document.
          </p>

          <div className="grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {BLOCKS.map((b) => (
              <div key={b.name} className="border-t hairline pt-6">
                <h3 className="display mb-3 text-lg text-ink">{b.name}</h3>
                <p className="text-sm text-stone">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Versioning */}
      <section className="border-t hairline bg-ink text-paper">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <p className="eyebrow mb-2 text-brass-soft">Versioning</p>
            <h2 className="display max-w-[18ch] text-2xl text-paper">
              Publishing a new version does not erase the last one
            </h2>
            <p className="mt-5 max-w-[34ch] text-paper/70">
              Most SOP libraries are a shared drive full of documents nobody is sure are current.
              The point of versioning is not tidiness. It is being able to answer what the procedure
              said on the day something went wrong.
            </p>
          </div>
          <ul className="space-y-0">
            {VERSIONING.map((v) => (
              <li
                key={v}
                className="border-t border-paper/20 py-4 text-sm text-paper/80 last:border-b last:border-paper/20"
              >
                {v}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Staff testing */}
      <section className="border-t hairline bg-paper-raised">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow mb-2">Staff testing</p>
          <h2 className="display mb-14 max-w-[22ch] text-2xl text-ink">
            Short, repeatable, and filed by department
          </h2>

          <dl className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {TESTING.map((t) => (
              <div key={t.name} className="border-t hairline pt-6">
                <dt className="display mb-2 text-lg text-ink">{t.name}</dt>
                <dd className="text-sm text-stone">{t.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Boundary with Academy */}
      <section className="border-t hairline">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow mb-2">Where OPS ends</p>
          <h2 className="display mb-6 max-w-[24ch] text-2xl text-ink">
            A certificate is earned once. A competency has to stay true.
          </h2>
          <p className="max-w-2xl text-ink-soft">
            Hospitality Academy teaches the standard and issues a certificate when someone has
            learned it. OPS is what happens for the rest of the year: the procedure they check
            mid-shift, and the assessment that shows the knowledge is still current.
          </p>
          <Link
            href="/academy"
            className="eyebrow mt-10 inline-block border-b border-brass pb-1 pt-2 text-ink transition-colors hover:text-brass-text"
          >
            Hospitality Academy
          </Link>
        </div>
      </section>

      <section className="border-t hairline">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="display max-w-2xl text-2xl text-ink">
            Bring us one procedure you already have.
          </h2>
          <p className="mt-4 max-w-xl text-ink-soft">
            We will rebuild it in the block system and show you what your team would read, and what
            the assessment attached to it would ask.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <a
              href="mailto:hello@chosenworkflow.com?subject=OPS demo request"
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
    </>
  )
}
