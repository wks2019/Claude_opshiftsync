import Link from 'next/link'
import { NAV_LINKS } from './nav'

interface SiteFooterProps {
  /** Wordmark line. The home page reads this from the CMS singleton and
   *  passes it down; every other page uses the default. */
  wordmark?: string
}

export function SiteFooter({ wordmark = 'Chosen Workflow' }: SiteFooterProps) {
  return (
    <footer className="border-t hairline">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div>
            <p className="eyebrow">{wordmark}</p>
            <p className="mt-2 max-w-xs text-sm text-stone">
              Training built for the standards your inspectors actually measure.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-2.5">
            {NAV_LINKS.filter((link) => link.href !== '/').map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-stone transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-2.5">
            <Link href="/login" className="text-sm text-stone transition-colors hover:text-ink">
              Sign in
            </Link>
            <Link
              href="/certificates/verify"
              className="text-sm text-stone transition-colors hover:text-ink"
            >
              Verify a certificate
            </Link>
            <a
              href="mailto:hello@chosenworkflow.com"
              className="text-sm text-stone transition-colors hover:text-ink"
            >
              hello@chosenworkflow.com
            </a>
          </div>
        </div>

        <p className="eyebrow mt-12 border-t hairline pt-6">
          &copy; {new Date().getFullYear()} Chosen Workflow
        </p>
      </div>
    </footer>
  )
}
