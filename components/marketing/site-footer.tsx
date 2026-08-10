import Link from 'next/link'
import { IndependenceNotice } from './independence-notice'
import { PRODUCTS } from './products'

interface SiteFooterProps {
  /** Wordmark line. The home page reads this from the CMS singleton and
   *  passes it down; every other page uses the default. */
  wordmark?: string
}

/** Four-column footer, on a dark ink surface rather than paper. This is the
 *  one place on the site that inverts, on purpose: the footer is where a
 *  visitor goes looking for something specific (a page, an email, a legal
 *  document), and the contrast switch is what tells them they have left the
 *  page and reached the site's index.
 *
 *  Products comes from PRODUCTS, the same source /solutions and the header
 *  orbit diagram use, so a renamed or added product cannot go stale here.
 *
 *  No Legal column and no social icons yet. Linking "Privacy Policy" or
 *  "Terms of Service" to pages that do not exist is worse than not listing
 *  them, and a LinkedIn or YouTube icon with no real handle behind it is a
 *  dead click. Both are one line to add once there is somewhere for them to
 *  go. */
export function SiteFooter({ wordmark = 'Chosen Workflow' }: SiteFooterProps) {
  return (
    <footer className="border-t hairline bg-ink text-paper">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <p className="eyebrow text-brass-soft">{wordmark}</p>
            <p className="mt-3 max-w-[26ch] text-sm text-paper/60">
              Training built for the service standards your property holds itself to.
            </p>
          </div>

          <nav aria-label="Products">
            <p className="eyebrow mb-4 text-paper/40">Products</p>
            <ul className="flex flex-col gap-2.5">
              {PRODUCTS.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/${p.slug}`}
                    className="text-sm text-paper/70 transition-colors hover:text-paper"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company">
            <p className="eyebrow mb-4 text-paper/40">Company</p>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link href="/about" className="text-sm text-paper/70 transition-colors hover:text-paper">
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="text-sm text-paper/70 transition-colors hover:text-paper"
                >
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-paper/70 transition-colors hover:text-paper">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-paper/70 transition-colors hover:text-paper">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <p className="eyebrow mb-4 text-paper/40">Sign in</p>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link href="/login" className="text-sm text-paper/70 transition-colors hover:text-paper">
                  Sign in
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@chosenworkflow.com"
                  className="text-sm text-paper/70 transition-colors hover:text-paper"
                >
                  hello@chosenworkflow.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-paper/15 pt-6">
          <IndependenceNotice className="max-w-3xl text-xs leading-relaxed text-paper/50" />
          <p className="eyebrow mt-6 text-paper/40">&copy; {new Date().getFullYear()} Chosen Workflow</p>
        </div>
      </div>
    </footer>
  )
}
