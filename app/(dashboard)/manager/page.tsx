import { createClient } from '@/services/supabase/server'
import { AuditLedger } from '@/components/audit-ledger'

export default async function ManagerTeamPage() {
  const supabase = await createClient()
  const { data: rollup, error } = await supabase.rpc('get_team_analytics')

  return (
    <section className="fade-in">
      <p className="eyebrow mb-2">Team</p>
      <h1 className="display mb-8 text-2xl text-ink">Standing</h1>

      {error && (
        <p className="text-sm text-claret">
          Could not load team analytics. This view requires the manager or administrator role.
        </p>
      )}

      {!error && (!rollup || rollup.length === 0) && (
        <p className="text-stone">
          No completed simulations yet. Once your team plays through a scenario, their scores
          appear here as an Audit Ledger.
        </p>
      )}

      {rollup && rollup.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-6 border-t hairline pt-6 sm:grid-cols-4">
            <div>
              <p className="data text-3xl text-ink">{rollup.length}</p>
              <p className="eyebrow mt-1">Active staff</p>
            </div>
            <div>
              <p className="data text-3xl text-ink">
                {rollup.reduce((sum, row) => sum + row.simulations_completed, 0)}
              </p>
              <p className="eyebrow mt-1">Simulations completed</p>
            </div>
            <div>
              <p className="data text-3xl text-ink">
                {rollup.filter((row) => row.simulations_completed === 0).length}
              </p>
              <p className="eyebrow mt-1">Not yet started</p>
            </div>
            <div>
              <p className="data text-3xl text-ink">
                {(
                  rollup.reduce((sum, row) => sum + (row.avg_final_score ?? 0), 0) / rollup.length
                ).toFixed(1)}
              </p>
              <p className="eyebrow mt-1">Team average</p>
            </div>
          </div>

          <div className="mt-12 grid gap-10 border-t hairline pt-8 sm:grid-cols-2">
            {rollup.map((row) => (
              <div key={row.user_id}>
                <p className="eyebrow mb-3">
                  {row.simulations_completed} simulation{row.simulations_completed === 1 ? '' : 's'}{' '}
                  completed
                </p>
                <AuditLedger
                  compact
                  result={{
                    forbesScore: row.avg_forbes_score ?? 0,
                    lqaScore: row.avg_lqa_score ?? 0,
                    sopScore: row.avg_sop_score ?? 0,
                    eiScore: row.avg_ei_score ?? 0,
                  }}
                  finalScore={row.avg_final_score ?? undefined}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
