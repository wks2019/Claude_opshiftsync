'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_LINKS } from './nav'

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** Desktop nav. The active route carries a brass underline, the same
 *  hairline-and-brass language the product uses for state everywhere else. */
export function SiteNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
      {NAV_LINKS.map((link) => {
        const active = isActive(pathname, link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={`eyebrow border-b pb-1 transition-colors ${
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
 *  JavaScript, stays keyboard operable, and never blocks first paint. */
export function SiteNavMobile() {
  const pathname = usePathname()

  return (
    <details className="group border-t hairline md:hidden">
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
                active ? 'text-brass-text' : 'text-ink-soft hover:text-ink'
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
