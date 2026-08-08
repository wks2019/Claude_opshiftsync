import Link from 'next/link'
import { SiteNav, SiteNavMobile } from './site-nav'

/** The public site's masthead. Shared by the home page and every page in
 *  the (marketing) route group. Access is invite-only, so the terminal
 *  action is "Book a demo", never a public sign-up.
 *
 *  The wordmark is set as text, not an image. It was a 463x105 PNG rendered
 *  at 56px tall, which meant every 2x display was upscaling it, which is what
 *  read as blur. Since the page already loads Marcellus through next/font,
 *  the mark can simply be typeset: sharp at any density, zero bytes, scales
 *  with the type system, and readable by anything that reads text. The
 *  "Hospitality training" line that sat under the old logo rendered at roughly
 *  6px at this size and has been dropped rather than kept as decoration. */
export function SiteHeader() {
  return (
    <header className="border-b hairline">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-6">
        <Link
          href="/"
          aria-label="Chosen Workflow, home"
          className="display shrink-0 text-2xl leading-none text-ink"
        >
          Chosen Workflow
        </Link>

        <SiteNav />

        <div className="flex items-center gap-5">
          <Link
            href="/login"
            className="eyebrow border-b border-transparent pb-1 pt-2 text-ink transition-colors hover:border-brass"
          >
            Sign in
          </Link>
          <Link
            href="/contact"
            className="eyebrow hidden border border-ink px-4 py-2 text-ink transition-colors hover:bg-ink hover:text-paper sm:inline-block"
          >
            Book a demo
          </Link>
        </div>
      </div>

      <SiteNavMobile />
    </header>
  )
}
