import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/marketing/page-header'

export const metadata: Metadata = {
  title: 'Resources | Chosen Workflow',
  description:
    'Reference material on standards scoring, SOP structure, simulation design, and certificate verification for luxury hospitality teams.',
}

const REFERENCE = [
  {
    title: 'How the Audit Ledger is calculated',
    body: 'The four scored dimensions, how each is weighted, and why the final figure is not an average.',
  },
  {
    title: 'Structuring an SOP that scores',
    body: 'The six block types, when to reach for a Checklist over a Procedure, and how versioning affects results already recorded.',
  },
  {
    title: 'Writing a simulation that discriminates',
    body: 'Building branches where every response is plausible, so the scenario separates competence rather than testing reading speed.',
  },
  {
    title: 'Setting standards weights',
    body: 'Translating an inspection sheet into the weights an administrator configures, and what changes for results recorded before the change.',
  },
] as const

export default function ResourcesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Resources"
        title="Reference material for the people configuring the standard."
        standfirst="Written for administrators and L&D leads setting up a property, and for managers reading results for the first time. Request any of the below and we will send it directly."
      />

      <section className="border-t hairline">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow mb-2">Guides</p>
          <h2 className="display mb-14 text-2xl text-ink">Available on request</h2>

          <div className="grid gap-x-16 gap-y-12 sm:grid-cols-2">
            {REFERENCE.map((item) => (
              <article key={item.title} className="border-t hairline pt-6">
                <h3 className="display mb-3 text-lg text-ink">{item.title}</h3>
                <p className="mb-5 text-sm text-stone">{item.body}</p>
                <a
                  href={`mailto:hello@chosenworkflow.com?subject=${encodeURIComponent(`Resource request: ${item.title}`)}`}
                  className="eyebrow border-b border-brass pb-0.5 text-ink transition-colors hover:text-brass"
                >
                  Request this guide
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t hairline bg-ink text-paper">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 sm:grid-cols-2">
          <div>
            <p className="eyebrow mb-2 text-brass-soft">Certificate verification</p>
            <h2 className="display mb-4 text-2xl text-paper">
              Confirm a certificate without an account.
            </h2>
            <p className="text-paper/70">
              Certificates issued by any property on the platform can be checked publicly, including
              their expiry. Useful for inspectors, auditors, and hiring managers.
            </p>
          </div>
          <div className="border-t border-paper/20 pt-6 sm:border-l sm:border-t-0 sm:pl-10 sm:pt-0">
            <p className="eyebrow mb-3 text-brass-soft">How it works</p>
            <p className="text-sm text-paper/70">
              Every issued certificate carries a unique verification code. Scan the code on the
              certificate, or open the verification link printed alongside it, and the result is
              returned without a login.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t hairline">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="display max-w-2xl text-2xl text-ink">
            Looking for something that is not listed?
          </h2>
          <p className="mt-4 max-w-xl text-ink-soft">
            Tell us what you are trying to configure and we will point you at the right material, or
            write it.
          </p>
          <div className="mt-10">
            <Link
              href="/contact"
              className="eyebrow border-b border-brass pb-1 text-ink transition-colors hover:text-brass"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
