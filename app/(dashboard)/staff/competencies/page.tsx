import { createClient } from '@/services/supabase/server'

export default async function StaffCompetenciesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: scores } = user
    ? await supabase
        .from('competency_scores')
        .select('id, score, recorded_at, competencies(name)')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
    : { data: null }

  // Group by competency, keep the most recent score for each.
  const latestByCompetency = new Map<string, { name: string; score: number; recordedAt: string }>()
  for (const row of scores ?? []) {
    const name = (row.competencies as { name: string } | null)?.name ?? 'Competency'
    if (!latestByCompetency.has(name)) {
      latestByCompetency.set(name, {
        name,
        score: Number(row.score),
        recordedAt: row.recorded_at,
      })
    }
  }

  const competencyList = Array.from(latestByCompetency.values())

  return (
    <section className="fade-in">
      <p className="eyebrow mb-2">My standards</p>
      <h1 className="display mb-8 text-2xl text-ink">Competencies</h1>

      {competencyList.length === 0 ? (
        <p className="text-stone">
          No scores yet. Complete a simulation and your competency scores will appear here
          automatically.
        </p>
      ) : (
        <ol>
          {competencyList.map((entry) => (
            <li key={entry.name} className="border-t hairline py-4">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <p className="text-ink-soft">{entry.name}</p>
                  <p className="eyebrow mt-1 text-stone">
                    Last scored {new Date(entry.recordedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="data text-2xl text-ink">{entry.score.toFixed(1)}</span>
              </div>
            </li>
          ))}
          <li className="border-t hairline" aria-hidden="true" />
        </ol>
      )}
    </section>
  )
}
