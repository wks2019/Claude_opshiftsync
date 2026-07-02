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

  return (
    <section className="fade-in">
      <p className="eyebrow mb-2">My standards</p>
      <h1 className="display mb-8 text-2xl text-ink">Competencies</h1>

      {!scores || scores.length === 0 ? (
        <p className="text-stone">
          Nothing recorded yet. Competency scores are drawn from simulation performance;
          automatic scoring on completion is not wired up yet, so this stays empty until that is
          built.
        </p>
      ) : (
        <ol>
          {scores.map((row) => (
            <li key={row.id} className="border-t hairline py-4">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-ink-soft">
                  {(row.competencies as { name: string } | null)?.name ?? 'Competency'}
                </span>
                <span className="data text-lg text-ink">{row.score}</span>
              </div>
            </li>
          ))}
          <li className="border-t hairline" aria-hidden="true" />
        </ol>
      )}
    </section>
  )
}
