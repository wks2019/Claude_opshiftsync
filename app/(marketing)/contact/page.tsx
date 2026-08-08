import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/marketing/page-header'

export const metadata: Metadata = {
  title: 'Contact | Chosen Workflow',
  description:
    'Request a demo, request access for your property, or ask a question about standards configuration and pricing.',
}

const ROUTES = [
  {
    label: 'Request a demo',
    body: 'We run one of your own guest moments through a simulation and show you the Audit Ledger it produces.',
    subject: 'Demo request',
    primary: true,
  },
  {
    label: 'Request access',
    body: 'Accounts are created by your property administrator. If your property is already on the platform, we will put you in touch with them.',
    subject: 'Access request',
    primary: false,
  },
  {
    label: 'Pricing',
    body: 'Send the number of properties, approximate headcount, and the standards you are measured against, and we will send a quote.',
    subject: 'Pricing enquiry',
    primary: false,
  },
  {
    label: 'Support',
    body: 'For properties already using the platform. Include your property name and, where relevant, the session or certificate reference.',
    subject: 'Support request',
    primary: false,
  },
] as const

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="One address, four reasons to use it."
        standfirst="Everything reaches the same inbox. Choosing the right line below simply gets your message to the right person faster."
      />

      <section className="border-t hairline">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-x-16 gap-y-12 sm:grid-cols-2">
            {ROUTES.map((item) => (
              <div key={item.subject} className="border-t hairline pt-6">
                <h2 className="display mb-3 text-lg text-ink">{item.label}</h2>
                <p className="mb-6 text-sm text-stone">{item.body}</p>
                <a
                  href={`mailto:hello@chosenworkflow.com?subject=${encodeURIComponent(item.subject)}`}
                  className={
                    item.primary
                      ? 'inline-block border border-ink bg-ink px-6 py-2.5 text-paper transition-colors hover:bg-transparent hover:text-ink'
                      : 'eyebrow border-b border-brass pb-0.5 text-ink transition-colors hover:text-brass-text'
                  }
                >
                  {item.primary ? item.label : `Email about ${item.label.toLowerCase()}`}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t hairline">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
            <div>
              <p className="eyebrow mb-2">Direct</p>
              <a
                href="mailto:hello@chosenworkflow.com"
                className="display text-xl text-ink transition-colors hover:text-brass"
              >
                hello@chosenworkflow.com
              </a>
            </div>
            <div className="flex flex-col gap-3">
              <p className="eyebrow">Already have an account</p>
              <Link
                href="/login"
                className="text-sm text-ink-soft transition-colors hover:text-ink"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
