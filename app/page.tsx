import Link from 'next/link'
import { AuditLedger } from '@/components/audit-ledger'
import { FiveStarLockup } from '@/components/marketing/five-star-lockup'
import { OrderQueue } from '@/components/marketing/order-queue'
import { PRODUCTS } from '@/components/marketing/products'
import { SiteFooter } from '@/components/marketing/site-footer'
import { SiteHeader } from '@/components/marketing/site-header'
import { createPublicClient } from '@/services/supabase/public'

/** How a guest uses it. Three steps because there are three, not because
 *  three is a pleasing number. */
const GUEST_STEPS = [
  {
    n: '01',
    title: 'Scan',
    body: 'A card in the room. The guest points their camera at it and the menu opens. Nothing to download, nothing to install.',
  },
  {
    n: '02',
    title: 'Order',
    body: 'The menu they see is the one that applies at that hour, with the modifiers your kitchen actually offers and the service charge already calculated.',
  },
  {
    n: '03',
    title: 'Track',
    body: 'They watch it move from accepted to on the way, on their own phone, without calling down to ask.',
  },
] as const

const PROMISES = [
  { n: '01', key: 'No app', value: 'It runs in the browser the guest already has. Nothing to download at 11pm.' },
  { n: '02', key: 'Any phone', value: 'A camera and a browser is the whole requirement. No hardware in the room.' },
  { n: '03', key: 'Your menu', value: 'Service periods, modifiers, dietary tags and charges, exactly as your kitchen runs them.' },
] as const

const DEMO_RESULT = {
  forbesScore: 100,
  lqaScore: 94,
  sopScore: 96,
  eiScore: 98,
}
const DEMO_FINAL = 96.9

/** The CMS copy at website_content was authored for the training product, and
 *  that is still exactly what it says. It moves down the page with the section
 *  it belongs to rather than being rewritten, so an editor keeps control of the
 *  Academy pitch. The 5STAR hero above it is static for now; give it its own
 *  CMS fields when the copy stops changing weekly. */
const FALLBACK = {
  academyTitle: 'Train the moment, not the manual.',
  academySubtitle:
    'Every scenario is a real guest interaction. Every score is one your quality team can act on.',
  footerText: 'Chosen Workflow',
}

export const revalidate = 300

export default async function HomePage() {
  let content: { hero_title: string; hero_subtitle: string; footer_text: string } | null = null
  try {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('website_content')
      .select('hero_title, hero_subtitle, footer_text')
      .eq('is_singleton', true)
      .single()
    content = data
  } catch {
    // Falls through to FALLBACK below. A missing env var or a transient
    // Supabase outage must never break the build or take the marketing
    // site down, this content is static copy, not critical data.
  }

  const copy = {
    academyTitle: content?.hero_title ?? FALLBACK.academyTitle,
    academySubtitle: content?.hero_subtitle ?? FALLBACK.academySubtitle,
    footerText: content?.footer_text ?? FALLBACK.footerText,
  }

  return (
    <>
      <SiteHeader />

      <main id="main-content" tabIndex={-1}>
        {/* Hero. 5STAR leads because it is the finished product and the one a
            general manager can authorise without a committee. The artefact is
            the kitchen queue rather than the guest's phone: the buyer is the
            operator, and what convinces them is the operational view. */}
        <section className="border-b hairline">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <div>
              <FiveStarLockup subline="In-room dining ordering" />
              <h1 className="display mt-9 max-w-[13ch] text-[clamp(2.5rem,5.6vw,4.5rem)] leading-[1.08] text-ink">
                Room service,{' '}
                <span className="block text-brass-text">without the phone call.</span>
              </h1>
              <p className="mt-8 max-w-[36ch] text-lg text-ink-soft">
                A card in the room, the menu on the guest&rsquo;s own phone, the order in your
                kitchen. No app to download and nobody left holding a receiver at midnight.
              </p>
              <div className="mt-11 flex flex-wrap items-center gap-6">
                <a
                  href="mailto:hello@chosenworkflow.com?subject=Demo request"
                  className="eyebrow border border-ink bg-ink px-5 py-3 text-paper transition-colors hover:bg-transparent hover:text-ink"
                >
                  Book a demo
                </a>
                <Link
                  href="/5star"
                  className="eyebrow border-b border-transparent pb-1 pt-2 text-brass-text transition-colors hover:border-brass"
                >
                  How 5STAR works
                </Link>
              </div>
            </div>

            <div>
              <OrderQueue />
              <p className="eyebrow mt-4">The kitchen view. Live orders, as they arrive.</p>
            </div>
          </div>
        </section>

        {/* Specimen strip. Vertical rules, not gaps: the divisions carry
            meaning rather than decorate the space between. */}
        <section aria-label="What 5STAR requires" className="border-b hairline bg-paper-raised">
          <div className="mx-auto grid max-w-6xl px-6 sm:grid-cols-3">
            {PROMISES.map((item, i) => (
              <div
                key={item.n}
                className={`py-9 ${
                  i === 0 ? 'sm:pr-8' : 'border-t hairline sm:border-l sm:border-t-0 sm:px-8 last:sm:pr-0'
                }`}
              >
                <p className="eyebrow text-brass-text">{item.n}</p>
                <h2 className="display mt-2 mb-1.5 text-xl text-ink">{item.key}</h2>
                <p className="text-sm text-stone">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How a guest uses it */}
        <section className="border-b hairline">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <div className="mb-14 grid items-end gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
              <div>
                <p className="eyebrow">How a guest uses it</p>
                <h2 className="display mt-3 max-w-[16ch] text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[1.1] text-ink">
                  Three steps, none of them a phone call
                </h2>
              </div>
              <p className="max-w-[38ch] text-lg text-ink-soft">
                The whole journey happens on the guest&rsquo;s own device, in the browser they
                already have open.
              </p>
            </div>

            <div className="grid gap-12 sm:grid-cols-3">
              {GUEST_STEPS.map((step) => (
                <div key={step.n} className="border-t-2 border-ink pt-5">
                  <p className="eyebrow text-brass-text">{step.n}</p>
                  <h3 className="display mt-2.5 mb-2 text-xl text-ink">{step.title}</h3>
                  <p className="text-sm text-stone">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The second act: 5STAR is one of three, and the other two are why it
            is a platform rather than a single-feature app. */}
        <section className="border-b hairline bg-ink">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <p className="eyebrow text-brass-soft">One platform, three products</p>
            <h2 className="display mt-4 max-w-[22ch] text-[clamp(1.75rem,4vw,3rem)] leading-[1.14] text-paper">
              Serving the guest is one question. Two more decide whether it happens again tomorrow.
            </h2>

            <dl className="mt-16 grid gap-10 sm:grid-cols-3">
              {PRODUCTS.map((p) => (
                <div key={p.slug} className="border-t border-paper/20 pt-6">
                  <dt className="eyebrow mb-1 text-brass-soft">{p.kind}</dt>
                  <p className="display mb-3 text-xl text-paper">{p.name}</p>
                  <dd className="text-sm leading-relaxed text-paper/70">{p.question}</dd>
                  <Link
                    href={`/${p.slug}`}
                    className="eyebrow mt-5 inline-block border-b border-transparent pb-1 text-brass-soft transition-colors hover:border-brass-soft"
                  >
                    {p.name}
                  </Link>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* The Academy pitch, which is what the CMS copy has always said. It
            keeps the Score Ledger, because measurement is the thread that runs
            through all three products. */}
        <section className="border-b hairline">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <div>
              <p className="eyebrow">Hospitality Academy</p>
              <h2 className="display mt-3 max-w-[14ch] text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[1.1] text-ink">
                {copy.academyTitle}
              </h2>
              <p className="mt-5 max-w-[36ch] text-ink-soft">{copy.academySubtitle}</p>
              <Link
                href="/academy"
                className="eyebrow mt-9 inline-block border-b border-transparent pb-1 pt-2 text-brass-text transition-colors hover:border-brass"
              >
                Hospitality Academy
              </Link>
            </div>

            <div>
              <div className="border hairline bg-paper-raised p-7">
                <div className="flex items-baseline justify-between border-b hairline pb-4">
                  <span className="display text-lg text-ink">In-Room Dining</span>
                  <span className="eyebrow">Session 04</span>
                </div>
                <AuditLedger result={DEMO_RESULT} finalScore={DEMO_FINAL} />
              </div>
              <p className="eyebrow mt-4">Actual output. Not a mock-up.</p>
            </div>
          </div>
        </section>

        {/* Close */}
        <section>
          <div className="mx-auto grid max-w-6xl items-end gap-12 px-6 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <div>
              <h2 className="display max-w-[15ch] text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[1.1] text-ink">
                See it running against your own menu.
              </h2>
              <p className="mt-5 max-w-[34ch] text-ink-soft">
                Send us a service period and a handful of dishes. We will put them in and show you
                the guest journey and the kitchen queue.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <a
                href="mailto:hello@chosenworkflow.com?subject=Demo request"
                className="eyebrow border border-ink bg-ink px-5 py-3 text-paper transition-colors hover:bg-transparent hover:text-ink"
              >
                Book a demo
              </a>
              <a
                href="mailto:hello@chosenworkflow.com?subject=Pricing enquiry"
                className="eyebrow border-b border-transparent pb-1 pt-2 text-brass-text transition-colors hover:border-brass"
              >
                Get a quote
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter wordmark={copy.footerText} />
    </>
  )
}
