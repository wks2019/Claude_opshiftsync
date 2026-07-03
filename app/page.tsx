import Image from 'next/image'
import Link from 'next/link'
import { AuditLedger } from '@/components/audit-ledger'
import { HeroCta } from '@/components/hero-cta'
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
    body: 'Every scenario is a real guest moment. Staff choose full-sentence responses, not A/B/C answers, and the guest reacts.',
  },
  {
    label: 'Certify',
    title: 'A score that means something',
    body: 'Weighted across four dimensions your inspectors actually use. No vanity percentages.',
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
    'A learning and simulation platform built on Forbes Travel Guide and LQA standards. Every scenario is a real guest interaction. Every score is one your inspectors would recognise.',
  footerText: 'Chosen Workflow',
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

  return (
    <main id="main-content">
      <header className="border-b hairline">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <span>
            <Image src="/logo.png" alt="Chosen Workflow" width={463} height={105} className="h-14 w-auto" priority />
          </span>
          <Link
            href="/login"
            className="eyebrow border-b border-transparent pb-1 text-ink transition-colors hover:border-brass"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pb-20 pt-24 text-center">
        <p className="eyebrow mb-5">{copy.heroEyebrow}</p>
        <h1 className="display text-4xl leading-tight text-ink sm:text-5xl">
          {copy.heroTitle}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-ink-soft">
          {copy.heroSubtitle}
        </p>
        <HeroCta />
      </section>

      {/* How it works */}
      <section className="border-t hairline">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow mb-2">How it works</p>
          <h2 className="display mb-14 text-2xl text-ink">Three moments, one standard</h2>

          <div className="grid gap-12 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.label} className="border-t hairline pt-6">
                <p className="eyebrow mb-3 text-brass">{step.label}</p>
                <h3 className="display mb-2 text-lg text-ink">{step.title}</h3>
                <p className="text-sm text-stone">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audit Ledger showcase */}
      <section className="border-t hairline bg-ink text-paper">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 sm:grid-cols-2 sm:items-center">
          <div>
            <p className="eyebrow mb-2 text-brass-soft">The Audit Ledger</p>
            <h2 className="display mb-5 text-2xl text-paper">
              Scored the way your standards actually work.
            </h2>
            <p className="text-paper/70">
              Forbes Travel Guide, LQA, your written SOPs, and emotional intelligence, weighted
              exactly as your property weights them. Not a single vanity number. An inspection
              sheet, rendered for every staff member, every session.
            </p>
            <p className="mt-6 text-sm text-paper/50">
              Sample result from a completed In-Room Dining scenario.
            </p>
          </div>
          <div className="[&_.text-ink]:text-paper [&_.text-ink-soft]:text-paper/80 [&_.text-brass]:text-brass-soft [&_.border-ink]:border-paper [&_.hairline]:border-paper/20">
            <AuditLedger result={DEMO_RESULT} finalScore={DEMO_FINAL} />
          </div>
        </div>
      </section>

      <footer className="border-t hairline">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <p className="eyebrow">{copy.footerText}</p>
              <p className="mt-2 max-w-xs text-sm text-stone">
                Training built for the standards your inspectors actually measure.
              </p>
            </div>
            <a
              href="mailto:hello@chosenworkflow.com"
              className="eyebrow border-b border-transparent pb-0.5 text-ink transition-colors hover:border-brass"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
