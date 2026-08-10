'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_LINKS } from './nav'

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** Desktop nav. The active route carries a brass underline, the same
 *  hairline-and-brass language the product uses for state everywhere else.
 *  pt-2 is there only to lift each link above the 24px target minimum; the
 *  underline stays where pb-1 puts it.
 *
 *  Breakpoint is lg, not md. The masthead row needs roughly 840px for the
 *  wordmark, six nav links, Sign in and Book a demo. At md (768px) only
 *  720px is available inside the px-6 gutters, so the row overflowed the
 *  viewport and pushed a horizontal scrollbar onto every page between 768
 *  and about 860. Tablet portrait therefore keeps the mobile disclosure.
 *
 *  Links are whitespace-nowrap so wider-than-expected font rendering can
 *  never fold a label onto two lines. See the note in site-header.tsx. */
export function SiteNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
      {NAV_LINKS.map((link) => {
        const active = isActive(pathname, link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={`eyebrow whitespace-nowrap border-b pb-1 pt-2 transition-colors ${
              active ? 'border-brass text-ink' : 'border-transparent hover:border-brass hover:text-ink'
            }`}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}

/** Mobile nav. Rendered as a native disclosure so the menu costs no
 *  JavaScript, stays keyboard operable, and never blocks first paint.
 *
 *  The active row is signalled by weight as well as colour, so it does not
 *  depend on colour alone the way the desktop underline does not.
 *
 *  Must stay the exact inverse of SiteNav's breakpoint. If these two drift
 *  apart the header either shows both navs or neither. */
export function SiteNavMobile() {
  const pathname = usePathname()

  return (
    <details className="group border-t hairline lg:hidden">
      <summary className="eyebrow flex cursor-pointer list-none items-center justify-between px-6 py-4 text-ink [&::-webkit-details-marker]:hidden">
        <span>Menu</span>
        <span aria-hidden="true" className="transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <nav aria-label="Primary, mobile" className="flex flex-col border-t hairline">
        {NAV_LINKS.map((link) => {
          const active = isActive(pathname, link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? 'page' : undefined}
              className={`border-b hairline px-6 py-3.5 text-sm transition-colors ${
                active ? 'font-medium text-brass-text' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
    </details>
  )
}
