import Link from 'next/link'
import { createClient } from '@/services/supabase/server'

export default async function StaffTodayPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase.from('users').select('full_name').eq('id', user.id).single()
    : { data: null }

  const { data: recentSessions } = user
    ? await supabase
        .from('simulation_sessions')
        .select('id, status, completed_at, simulations(title)')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(3)
    : { data: null }

  return (
    <section>
      <p className="eyebrow mb-2">Today</p>
      <h1 className="display mb-8 text-2xl text-ink">
        {profile?.full_name ? `Welcome back, ${profile.full_name}` : 'Welcome'}
      </h1>

      <div className="border-t hairline pt-6">
        <p className="eyebrow mb-3">Continue</p>
        <Link
          href="/staff/simulations"
          className="block border hairline p-5 transition-colors hover:border-brass"
        >
          <p className="text-ink-soft">Choose a simulation</p>
          <p className="mt-1 text-sm text-stone">
            Practise a real guest scenario and see your Audit Ledger score.
          </p>
        </Link>
      </div>

      {recentSessions && recentSessions.length > 0 && (
        <div className="mt-10 border-t hairline pt-6">
          <p className="eyebrow mb-3">Recent activity</p>
          <ol>
            {recentSessions.map((session) => (
              <li key={session.id} className="border-t hairline py-3">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-ink-soft">
                    {(session.simulations as unknown as { title: string } | null)?.title ??
                      'Simulation'}
                  </span>
                  <span className="eyebrow shrink-0">
                    {session.status === 'completed' ? 'Completed' : 'In progress'}
                  </span>
                </div>
              </li>
            ))}
            <li className="border-t hairline" aria-hidden="true" />
          </ol>
        </div>
      )}
    </section>
  )
}
