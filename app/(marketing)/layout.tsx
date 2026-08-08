import type { ReactNode } from 'react'
import { SiteFooter } from '@/components/marketing/site-footer'
import { SiteHeader } from '@/components/marketing/site-header'

/** Chrome for the public pages. The home page sits outside this group so
 *  its CMS-backed content and existing sections stay exactly as built.
 *
 *  tabIndex={-1} on <main> makes the skip link actually move keyboard focus.
 *  Without it Safari and some Chrome builds jump the scroll position but leave
 *  focus on <body>, so the next Tab returns to the top of the header. */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </>
  )
}
