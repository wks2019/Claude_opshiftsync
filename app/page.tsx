import { AuditLedger } from '@/components/audit-ledger'
import { HeroCta } from '@/components/hero-cta'
import { SiteFooter } from '@/components/marketing/site-footer'
import { SiteHeader } from '@/components/marketing/site-header'
import { createPublicClient } from '@/services/supabase/public'

const STEPS = [
  {
    label: 'Learn',
    title: 'Courses built on your standards',
    body: 'Forbes Travel Guide, LQA, and your own SOPs, structured into lessons your team actually finishes.',
  },
  {
    label: 'Simulate',
    title: 'Decisions, not multiple choice',
    body: 'Staff choose full-sentence responses, not A, B or C. The guest reacts to what they said.',
  },
  {
    label: 'Certify',
    title: 'A score that means something',
    body: 'Weighted across the four dimensions your inspectors actually use. No vanity percentages.',
  },
] as const

/** The three things a quality manager has to believe before they will book.
 *  Rendered as a specimen strip under the hero: divided by rules, not padding,
 *  because the divisions carry meaning rather than decorate the gap. */
const PROMISES = [
  {
    n: '01',
    key: 'Your weights',
    value: 'Forbes, LQA and your own SOPs, weighted exactly as your property weights them.',
  },
  {
    n: '02',
    key: 'Your language',
    value: 'Scenarios authored from your standards, in the words your team already uses.',
  },
  {
    n: '03',
    key: 'Your record',
    value: 'Every session kept, versioned, and verifiable from outside the platform.',
  },
] as const

const DEMO_RESULT = {
  forbesScore: 100,
  lqaScore: 94,
  sopScore: 96,
  eiScore: 98,
}
const DEMO_FINAL = 96.9

const FALLBACK = {
  heroEyebrow: 'For luxury hospitality',
  heroTitle: 'Train the moment, not the manual.',
  heroSubtitle:
    'Every scenario is a real guest interaction. Every score is one your inspectors would recognise.',
  footerText: 'Chosen Workflow',
}

/** The hero headline is authored as one string in the CMS but set on two
 *  lines, the second in brass. Split on the first comma so an editor can
 *  rewrite the line without touching code. A headline with no comma falls
 *  back to a single line rather than breaking. */
function splitHeadline(title: string): [string, string | null] {
  const i = title.indexOf(',')
  if (i === -1) return [title, null]
  return [title.slice(0, i + 1), title.slice(i + 1).trim() || null]
}

export const revalidate = 300

export default async function HomePage() {
  let content: { hero_eyebrow: string; hero_title: string; hero_subtitle: string; footer_text: string } | null = null
  try {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('website_content')
      .select('hero_eyebrow, hero_title, hero_subtitle, footer_text')
      .eq('is_singleton', true)
      .single()
    content = data
  } catch {
    // Falls through to FALLBACK below. A missing env var or a transient
    // Supabase outage must never break the build or take the marketing
    // site down, this content is static copy, not critical data.
  }

  const copy = {
    heroEyebrow: content?.hero_eyebrow ?? FALLBACK.heroEyebrow,
    heroTitle: content?.hero_title ?? FALLBACK.heroTitle,
    heroSubtitle: content?.hero_subtitle ?? FALLBACK.heroSubtitle,
    footerText: content?.footer_text ?? FALLBACK.footerText,
  }

  const [titleLead, titleTail] = splitHeadline(copy.heroTitle)

  return (
    <>
      <SiteHeader />

      <main id="main-content" tabIndex={-1}>
        {/* Hero. The Audit Ledger sits in the first screen rather than three
            sections down: it is the evidence, and a quality manager will
            scroll past claims to reach an artefact that looks like their own
            paperwork. */}
        <section className="border-b hairline">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <div>
              <p className="eyebrow">{copy.heroEyebrow}</p>
              <h1 className="display mt-6 max-w-[11ch] text-[clamp(2.75rem,6.2vw,5rem)] leading-[1.08] text-ink">
                {titleLead}
                {titleTail && <span className="block text-brass-text">{titleTail}</span>}
              </h1>
              <p className="mt-8 max-w-[34ch] text-lg text-ink-soft">{copy.heroSubtitle}</p>
              <HeroCta />
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

        {/* Specimen strip. Vertical rules, not gaps: the divisions are
            structural, so they are drawn. */}
        <section aria-label="What the platform guarantees" className="border-b hairline bg-paper-raised">
          <div className="mx-auto grid max-w-6xl px-6 sm:grid-cols-3">
            {PROMISES.map((item, i) => (
              <div
                key={item.n}
                className={`py-9 ${
                  i === 0
                    ? 'sm:pr-8'
                    : 'border-t hairline sm:border-l sm:border-t-0 sm:px-8 last:sm:pr-0'
                }`}
              >
                <p className="eyebrow text-brass-text">{item.n}</p>
                <h2 className="display mt-2 mb-1.5 text-xl text-ink">{item.key}</h2>
                <p className="text-sm text-stone">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Three moments */}
        <section className="border-b hairline">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <div className="mb-14 grid items-end gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
              <div>
                <p className="eyebrow">How it works</p>
                <h2 className="display mt-3 max-w-[16ch] text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[1.1] text-ink">
                  Three moments, one standard
                </h2>
              </div>
              <p className="max-w-[38ch] text-lg text-ink-soft">
                A new starter can finish a module inside a shift. A manager can see where the
                property is weakest by Friday.
              </p>
            </div>

            <div className="grid gap-12 sm:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.label} className="border-t-2 border-ink pt-5">
                  <p className="eyebrow text-brass-text">{step.label}</p>
                  <h3 className="display mt-2.5 mb-2 text-xl text-ink">{step.title}</h3>
                  <p className="text-sm text-stone">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The one place the page raises its voice. Everything else on the
            page is deliberately quiet so that this lands. */}
        <section className="border-b hairline bg-ink">
          <div className="mx-auto max-w-6xl px-6 py-28">
            <p className="eyebrow text-brass-soft">The Audit Ledger</p>
            <blockquote className="display mt-6 max-w-[20ch] text-[clamp(1.75rem,4.4vw,3.25rem)] leading-[1.16] text-paper">
              Not a single vanity number.{' '}
              <span className="text-brass-soft">
                An inspection sheet, rendered for every member of staff, every session.
              </span>
            </blockquote>
            <p className="data mt-10 max-w-2xl border-t border-paper/20 pt-5 text-xs leading-relaxed text-paper/60">
              The same four dimensions your quality manager already reports on, calculated the same
              way, available the moment a session ends rather than the quarter after.
            </p>
          </div>
        </section>

        {/* Close */}
        <section>
          <div className="mx-auto grid max-w-6xl items-end gap-12 px-6 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <div>
              <h2 className="display max-w-[15ch] text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[1.1] text-ink">
                See a scenario scored against your own weights.
              </h2>
              <p className="mt-5 max-w-[34ch] text-ink-soft">
                We run one of your real guest moments through the platform and show you the ledger
                it produces.
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
