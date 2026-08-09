import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/marketing/page-header'
import { PRODUCTS } from '@/components/marketing/products'

export const metadata: Metadata = {
  title: 'Solutions | Chosen Workflow',
  description:
    'Three products on one platform: 5STAR for guest-facing apps, Hospitality Academy for training and certification, and Hospitality OPS for SOPs and staff testing.',
}

const SHARED = [
  {
    name: 'One account per property',
    body: 'A member of staff signs in once. What they see is decided by their role and their hotel, enforced by Postgres Row Level Security at the database rather than in application code.',
  },
  {
    name: 'One record',
    body: 'A training result, an SOP version and a guest order all belong to the same property and the same person. Nothing has to be reconciled across systems afterwards.',
  },
  {
    name: 'One standard',
    body: 'Five-star service principles, luxury guest experience principles and your own procedures are configured once, with your weights, and every score in every product is calculated from them.',
  },
] as const

export default function SolutionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Solutions"
        title="Three products, one platform."
        standfirst="Serving the guest, training the team, and holding the standard are three different jobs. They are sold separately and they run on the same account, the same roles and the same record."
      />

      <section className="border-t hairline">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-x-16 gap-y-16 lg:grid-cols-3">
            {PRODUCTS.map((p) => (
              <div key={p.slug} className="border-t-2 border-ink pt-6">
                <p className="eyebrow text-brass-text">{p.kind}</p>
                <h2 className="display mt-2.5 mb-3 text-2xl text-ink">{p.name}</h2>
                <p className="display mb-5 text-lg leading-snug text-ink-soft">{p.question}</p>
                <p className="text-sm text-stone">{p.summary}</p>
                <p className="eyebrow mt-6">{p.status}</p>
                <Link
                  href={`/${p.slug}`}
                  className="eyebrow mt-6 inline-block border-b border-brass pb-1 pt-2 text-ink transition-colors hover:text-brass-text"
                >
                  Read more
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t hairline bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow mb-2 text-brass-soft">What they share</p>
          <h2 className="display mb-14 max-w-[20ch] text-2xl text-paper">
            Three products is only worth anything if they are actually the same platform
          </h2>

          <dl className="grid gap-10 sm:grid-cols-3">
            {SHARED.map((item) => (
              <div key={item.name} className="border-t border-paper/20 pt-6">
                <dt className="display mb-3 text-lg text-paper">{item.name}</dt>
                <dd className="text-sm leading-relaxed text-paper/70">{item.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-t hairline">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="display max-w-2xl text-2xl text-ink">
            Start with one. Add the others when they earn it.
          </h2>
          <p className="mt-4 max-w-xl text-ink-soft">
            Most properties begin with 5STAR, because it is the one a guest notices in the first
            week. Nothing obliges you to buy three.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <a
              href="mailto:hello@chosenworkflow.com?subject=Demo request"
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
