import Image from 'next/image'
import Link from 'next/link'
import { SiteNav, SiteNavMobile } from './site-nav'

/** The public site's masthead. Shared by the home page and every page in
 *  the (marketing) route group. Access is invite-only, so the terminal
 *  action is "Request access", never a public sign-up. */
export function SiteHeader() {
  return (
    <header className="border-b hairline">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-6">
        <Link href="/" aria-label="Chosen Workflow, home">
          <Image
            src="/logo.png"
            alt="Chosen Workflow"
            width={463}
            height={105}
            className="h-14 w-auto"
            priority
          />
        </Link>

        <SiteNav />

        <div className="flex items-center gap-5">
          <Link
            href="/login"
            className="eyebrow border-b border-transparent pb-1 text-ink transition-colors hover:border-brass"
          >
            Sign in
          </Link>
          <Link
            href="/contact"
            className="eyebrow hidden border border-ink px-4 py-2 text-ink transition-colors hover:bg-ink hover:text-paper sm:inline-block"
          >
            Request access
          </Link>
        </div>
      </div>

      <SiteNavMobile />
    </header>
  )
}
