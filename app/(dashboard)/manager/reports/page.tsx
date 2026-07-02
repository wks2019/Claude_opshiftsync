import { createClient } from '@/services/supabase/server'

export default async function ManagerReportsPage() {
  const supabase = await createClient()

  const { data: sessions } = await supabase
    .from('simulation_sessions')
    .select(
      'id, completed_at, users(full_name), simulations(title), simulation_results(final_score)'
    )
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(50)

  return (
    <section className="fade-in">
      <p className="eyebrow mb-2">Reports</p>
      <h1 className="display mb-8 text-2xl text-ink">Completed sessions</h1>

      {!sessions || sessions.length === 0 ? (
        <p className="text-stone">Nothing completed yet.</p>
      ) : (
        <ol>
          {sessions.map((session) => {
            const result = session.simulation_results as unknown as
              | { final_score: number }[]
              | { final_score: number }
              | null
            const finalScore = Array.isArray(result) ? result[0]?.final_score : result?.final_score

            return (
              <li key={session.id} className="border-t hairline py-3">
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <p className="text-ink-soft">
                      {(session.users as { full_name: string } | null)?.full_name ?? 'Unknown'}
                    </p>
                    <p className="text-sm text-stone">
                      {(session.simulations as { title: string } | null)?.title ?? 'Simulation'}
                    </p>
                  </div>
                  <span className="data shrink-0 text-ink">
                    {finalScore !== undefined ? finalScore.toFixed(1) : '—'}
                  </span>
                </div>
              </li>
            )
          })}
          <li className="border-t hairline" aria-hidden="true" />
        </ol>
      )}
    </section>
  )
}
