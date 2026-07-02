import Link from 'next/link'
import type { ReactNode } from 'react'

type AppRole = 'staff' | 'manager' | 'administrator'

interface NavItem {
  href: string
  label: string
}

const NAV: Record<AppRole, NavItem[]> = {
  staff: [
    { href: '/staff', label: 'Today' },
    { href: '/staff/courses', label: 'Courses' },
    { href: '/staff/simulations', label: 'Simulations' },
    { href: '/staff/competencies', label: 'My standards' },
    { href: '/staff/certificates', label: 'Certificates' },
  ],
  manager: [
    { href: '/manager', label: 'Team' },
    { href: '/manager/team-analytics', label: 'Analytics' },
    { href: '/manager/reports', label: 'Reports' },
  ],
  administrator: [
    { href: '/admin', label: 'Overview' },
    { href: '/admin/cms', label: 'Content' },
    { href: '/admin/standards-engine', label: 'Standards' },
    { href: '/admin/user-management', label: 'People' },
    { href: '/admin/tenant-settings', label: 'Property' },
  ],
}

interface DashboardShellProps {
  role: AppRole
  propertyName: string
  currentPath: string
  children: ReactNode
}

/**
 * Shared authenticated layout. A single hairline-ruled header carries
 * the property name (display face, the one per screen) and role nav.
 * Content sits on a wide, quiet page: whitespace does the luxury work.
 */
export function DashboardShell({ role, propertyName, currentPath, children }: DashboardShellProps) {
  const navItems = NAV[role]

  return (
    <div className="min-h-dvh bg-paper">
      <header className="border-b hairline">
        <div className="mx-auto flex max-w-6xl items-baseline justify-between px-6 py-5">
          <Link href="/" className="display text-xl text-ink transition-colors hover:text-brass">
            {propertyName}
          </Link>

          <nav aria-label="Primary">
            <ul className="flex items-baseline gap-7">
              {navItems.map(({ href, label }) => {
                const isActive = currentPath === href
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={isActive ? 'page' : undefined}
                      className={
                        isActive
                          ? 'border-b border-brass pb-1 text-ink'
                          : 'pb-1 text-stone transition-colors hover:text-ink'
                      }
                    >
                      {label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  )
}
