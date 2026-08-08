import Link from 'next/link'
import { SiteNav, SiteNavMobile } from './site-nav'

/** The public site's masthead. Shared by the home page and every page in
 *  the (marketing) route group. Access is invite-only, so the terminal
 *  action is "Book a demo", never a public sign-up.
 *
 *  The wordmark is a plain <img> rather than next/image on purpose: it is
 *  vector, so there is nothing for the image optimiser to do, and routing it
 *  through /_next/image would cost a round trip to return the same bytes.
 *  alt is empty because the parent link already carries the accessible name. */
export function SiteHeader() {
  return (
    <header className="border-b hairline">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-6">
        <Link href="/" aria-label="Chosen Workflow, home" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/wordmark-compact.svg"
            alt=""
            width={874}
            height={134}
            className="h-8 w-auto"
          />
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
