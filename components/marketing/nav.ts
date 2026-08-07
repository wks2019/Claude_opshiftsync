/** The public site's information architecture. Header, mobile disclosure,
 *  and footer all read from this one list so the nav can never drift. */
export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/solutions', label: 'Solutions' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/resources', label: 'Resources' },
  { href: '/contact', label: 'Contact' },
] as const

export type NavLink = (typeof NAV_LINKS)[number]
