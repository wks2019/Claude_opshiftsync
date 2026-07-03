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

  const { count: certificateCount } = user
    ? await supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
    : { count: 0 }

  const { count: courseCount } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  // Your path: the first published simulation this person has not attempted.
  const { data: publishedSims } = await supabase
    .from('simulations')
    .select('id, title')
    .eq('status', 'published')
    .order('created_at', { ascending: true })

  const { data: attempted } = user
    ? await supabase.from('simulation_sessions').select('simulation_id').eq('user_id', user.id)
    : { data: [] }

  const attemptedIds = new Set((attempted ?? []).map((s) => s.simulation_id))
  const nextSimulation = (publishedSims ?? []).find((s) => !attemptedIds.has(s.id))

  return (
    <section className="fade-in">
      <p className="eyebrow mb-2">Today</p>
      <h1 className="display mb-8 text-2xl text-ink">
        {profile?.full_name ? `Welcome back, ${profile.full_name}` : 'Welcome'}
      </h1>

      {(recentSessions?.length ?? 0) === 0 && (certificateCount ?? 0) === 0 && (
        <div className="mb-10 border border-brass/30 bg-paper-raised p-6">
          <p className="display mb-2 text-lg text-ink">First time here? Here is how it works.</p>
          <p className="text-sm text-ink-soft">
            Start with a course to learn your property's standards. Then play through a simulation
            to practise a real guest scenario. Your scores build into an Audit Ledger, and when
            you are ready, your manager issues a certificate. Everything begins with the first
            scenario below.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 border-t hairline pt-6 sm:grid-cols-3">
        <Link href="/staff/courses" className="block">
          <p className="data text-3xl text-ink">{courseCount ?? 0}</p>
          <p className="eyebrow mt-1 transition-colors hover:text-brass">Courses available</p>
        </Link>
        <Link href="/staff/certificates" className="block">
          <p className="data text-3xl text-ink">{certificateCount ?? 0}</p>
          <p className="eyebrow mt-1 transition-colors hover:text-brass">Certificates earned</p>
        </Link>
      </div>

      {nextSimulation && (
        <div className="mt-10 border-t hairline pt-6">
          <p className="eyebrow mb-3">Your path</p>
          <Link
            href={`/staff/simulations/${nextSimulation.id}`}
            className="block border hairline p-5 transition-colors hover:border-brass"
          >
            <p className="eyebrow mb-1 text-brass">Next scenario</p>
            <p className="text-ink-soft">{nextSimulation.title}</p>
            <p className="mt-1 text-sm text-stone">
              You have not played this one yet. Complete it to build your Audit Ledger.
            </p>
          </Link>
        </div>
      )}

      <div className="mt-10 border-t hairline pt-6">
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
