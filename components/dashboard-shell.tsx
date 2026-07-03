'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { logout } from '@/services/auth/session-actions'
import { useToast } from '@/components/toast-provider'

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
    { href: '/admin/media-library', label: 'Media' },
    { href: '/admin/user-management', label: 'People' },
    { href: '/admin/tenant-settings', label: 'Property' },
  ],
}

interface DashboardShellProps {
  role: AppRole
  propertyName: string
  children: ReactNode
}

/**
 * Shared authenticated layout. A single hairline-ruled header carries
 * the property name (display face, the one per screen) and role nav.
 * Content sits on a wide, quiet page: whitespace does the luxury work.
 */
export function DashboardShell({ role, propertyName, children }: DashboardShellProps) {
  const navItems = NAV[role]
  const currentPath = usePathname()
  const router = useRouter()
  const { showToast } = useToast()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  async function handleSignOut() {
    setIsSigningOut(true)
    try {
      await logout()
      router.push('/login')
      router.refresh()
    } catch {
      showToast('Could not sign out. Try again.', 'error')
      setIsSigningOut(false)
    }
  }

  return (
    <div className="min-h-dvh bg-paper">
      <header className="border-b hairline">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Link href="/" className="shrink-0 transition-opacity hover:opacity-80">
            <Image src="/logo.png" alt={propertyName} width={463} height={105} className="h-14 w-auto" priority />
          </Link>

          <div className="hidden items-baseline gap-7 md:flex">
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

            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="eyebrow text-stone transition-colors hover:text-claret disabled:opacity-40"
            >
              {isSigningOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            className="eyebrow text-ink md:hidden"
          >
            {isMenuOpen ? 'Close' : 'Menu'}
          </button>
        </div>

        {isMenuOpen && (
          <nav aria-label="Primary" className="border-t hairline px-6 py-4 md:hidden">
            <ul className="space-y-4">
              {navItems.map(({ href, label }) => {
                const isActive = currentPath === href
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => setIsMenuOpen(false)}
                      className={isActive ? 'text-ink' : 'text-stone transition-colors hover:text-ink'}
                    >
                      {label}
                    </Link>
                  </li>
                )
              })}
              <li className="border-t hairline pt-4">
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="eyebrow text-stone transition-colors hover:text-claret disabled:opacity-40"
                >
                  {isSigningOut ? 'Signing out…' : 'Sign out'}
                </button>
              </li>
            </ul>
          </nav>
        )}
      </header>

      <main id="main-content" className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  )
}
