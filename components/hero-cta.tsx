'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/services/supabase/client'

type AuthState = 'loading' | 'authenticated' | 'unauthenticated'

export function HeroCta() {
  const [state, setState] = useState<AuthState>('loading')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setState(data.session ? 'authenticated' : 'unauthenticated')
    })
  }, [])

  if (state === 'loading') {
    return <div className="mt-10 h-11" aria-hidden="true" />
  }

  if (state === 'authenticated') {
    return (
      <div className="mt-10 flex items-center justify-center">
        <Link
          href="/staff"
          className="border border-ink bg-ink px-6 py-2.5 text-paper transition-colors hover:bg-transparent hover:text-ink"
        >
          Go to your dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-10 flex items-center justify-center gap-6">
      <a
        href="mailto:hello@chosenworkflow.com?subject=Demo request"
        className="border border-ink bg-ink px-6 py-2.5 text-paper transition-colors hover:bg-transparent hover:text-ink"
      >
        Request a demo
      </a>
      <Link
        href="/login"
        className="border border-ink px-6 py-2.5 text-ink transition-colors hover:bg-ink hover:text-paper"
      >
        Sign in
      </Link>
    </div>
  )
}
