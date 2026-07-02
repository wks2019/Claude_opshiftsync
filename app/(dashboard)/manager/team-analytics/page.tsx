import { createClient } from '@/services/supabase/server'

export default async function ManagerAnalyticsPage() {
  const supabase = await createClient()
  const { data: rollup } = await supabase.rpc('get_team_analytics')

  const rows = rollup ?? []
  const totalCompleted = rows.reduce((sum, row) => sum + (row.simulations_completed ?? 0), 0)
  const average = (key: keyof (typeof rows)[number]) => {
    const values = rows
      .map((row) => row[key])
      .filter((value): value is number => typeof value === 'number')
    if (values.length === 0) return null
    return values.reduce((sum, value) => sum + value, 0) / values.length
  }

  const stats = [
    { label: 'Team members with activity', value: rows.length },
    { label: 'Simulations completed', value: totalCompleted },
    { label: 'Average composite score', value: average('avg_final_score')?.toFixed(1) ?? '—' },
    { label: 'Average Forbes score', value: average('avg_forbes_score')?.toFixed(1) ?? '—' },
  ]

  return (
    <section className="fade-in">
      <p className="eyebrow mb-2">Analytics</p>
      <h1 className="display mb-10 text-2xl text-ink">Team-wide standing</h1>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="border-t hairline pt-3">
            <p className="data text-3xl text-ink">{stat.value}</p>
            <p className="eyebrow mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {rows.length === 0 && (
        <p className="mt-10 text-stone">No completed simulations yet across your team.</p>
      )}
    </section>
  )
}
