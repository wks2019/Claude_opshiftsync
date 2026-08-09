import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/marketing/page-header'

export const metadata: Metadata = {
  title: 'Pricing | Chosen Workflow',
  description:
    'Chosen Workflow is priced per property and per seat, quoted after a short scoping call. Every deployment includes the full platform.',
}

const FACTORS = [
  {
    factor: 'Properties',
    detail: 'How many properties are in scope, and whether they share one standards configuration or each hold their own.',
  },
  {
    factor: 'Seats',
    detail: 'Active staff, managers, and administrators. Seasonal properties are counted at peak, not annual average.',
  },
  {
    factor: 'Standards',
    detail: 'Five-star service principles and luxury guest experience principles are configured as standard. Additional internal standards are scoped separately.',
  },
  {
    factor: 'Content',
    detail: 'Whether your team authors courses, SOPs, and simulations in the CMS, or we build the first set with you.',
  },
] as const

const INCLUDED = [
  'Courses, lessons, and quizzes',
  'Decision-based simulations',
  'Versioned SOPs, all six block types',
  'Weighted competency scoring',
  'Certificates with public verification',
  'Staff, manager, and administrator dashboards',
  'Tenant isolation enforced at the database',
  'Unlimited authored content',
] as const

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="Priced per property, quoted after a scoping call."
        standfirst="There is no self-serve tier. Standards configuration and tenant setup are done with you before anyone logs in, so the price is set once we know the shape of your estate."
      />

      <section className="border-t hairline">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-16 lg:grid-cols-[3fr_2fr]">
            <div>
              <p className="eyebrow mb-2">What sets the price</p>
              <h2 className="display mb-12 text-2xl text-ink">Four variables</h2>

              <dl className="grid gap-10 sm:grid-cols-2">
                {FACTORS.map((item) => (
                  <div key={item.factor} className="border-t hairline pt-6">
                    <dt className="display mb-2 text-lg text-ink">{item.factor}</dt>
                    <dd className="text-sm text-stone">{item.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="border hairline p-8">
              <p className="eyebrow mb-2 text-brass">Every deployment</p>
              <h2 className="display mb-8 text-lg text-ink">
                The whole platform, at every price
              </h2>
              <ul className="flex flex-col gap-3">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-ink-soft">
                    <span aria-hidden="true" className="text-brass">
                      &mdash;
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-8 border-t hairline pt-6 text-sm text-stone">
                Nothing above is gated behind a higher tier. There are no per-certificate or
                per-simulation charges.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t hairline bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="display max-w-2xl text-2xl text-paper">
            Tell us the estate and we will send a number.
          </h2>
          <p className="mt-4 max-w-xl text-paper/70">
            Properties, approximate headcount, and the standards you hold yourself to are enough
            for a first quote.
          </p>
          <div className="mt-10">
            <Link
              href="/contact"
              className="border border-paper px-6 py-2.5 text-paper transition-colors hover:bg-paper hover:text-ink"
            >
              Contact for pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
