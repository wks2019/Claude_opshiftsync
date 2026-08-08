'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/services/supabase/client'

type AuthState = 'loading' | 'authenticated' | 'unauthenticated'

/** Hero call to action. Auth-aware: a signed-in visitor is offered their
 *  dashboard rather than a demo they do not need.
 *
 *  Left-aligned rather than centred, because the hero now runs on an
 *  asymmetric grid. The reserved height on load prevents the block below
 *  from jumping once the session resolves. */
export function HeroCta() {
  const [state, setState] = useState<AuthState>('loading')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setState(data.session ? 'authenticated' : 'unauthenticated')
    })
  }, [])

  if (state === 'loading') {
    return <div className="mt-11 h-11" aria-hidden="true" />
  }

  if (state === 'authenticated') {
    return (
      <div className="mt-11 flex items-center gap-6">
        <Link
          href="/staff"
          className="eyebrow border border-ink bg-ink px-5 py-3 text-paper transition-colors hover:bg-transparent hover:text-ink"
        >
          Go to your dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-11 flex flex-wrap items-center gap-6">
      <a
        href="mailto:hello@chosenworkflow.com?subject=Demo request"
        className="eyebrow border border-ink bg-ink px-5 py-3 text-paper transition-colors hover:bg-transparent hover:text-ink"
      >
        Book a demo
      </a>
      <Link
        href="/solutions"
        className="eyebrow border-b border-transparent pb-1 pt-2 text-brass-text transition-colors hover:border-brass"
      >
        See how scoring works
      </Link>
    </div>
  )
}
