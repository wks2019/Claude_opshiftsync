import { createClient } from '@/services/supabase/server'
import { AuditLedger } from '@/components/audit-ledger'

export default async function ManagerTeamPage() {
  const supabase = await createClient()
  const { data: rollup, error } = await supabase.rpc('get_team_analytics')

  return (
    <section>
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
        <div className="grid gap-10 sm:grid-cols-2">
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
      )}
    </section>
  )
}
