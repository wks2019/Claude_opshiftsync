import type { SimulationResult } from '@/modules/simulation-engine/engine/types'

interface AuditLedgerProps {
  result: Pick<SimulationResult, 'forbesScore' | 'lqaScore' | 'sopScore' | 'eiScore'>
  finalScore?: number
  compact?: boolean
}

const DIMENSIONS = [
  { key: 'forbesScore', label: 'Forbes Travel Guide', weight: '35' },
  { key: 'lqaScore', label: 'LQA', weight: '30' },
  { key: 'sopScore', label: 'Standard Procedure', weight: '25' },
  { key: 'eiScore', label: 'Emotional Intelligence', weight: '10' },
] as const

/**
 * The Audit Ledger. Every score in the product renders through this
 * component: simulation results, staff dashboards, manager rollups.
 * Four hairline rules with brass fills, mirroring a physical
 * standards inspection sheet.
 */
export function AuditLedger({ result, finalScore, compact = false }: AuditLedgerProps) {
  return (
    <div role="group" aria-label="Score by standard">
      <ol className="space-y-0">
        {DIMENSIONS.map(({ key, label, weight }) => {
          const value = result[key]
          return (
            <li
              key={key}
              className={`border-t hairline ${compact ? 'py-2.5' : 'py-4'}`}
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-ink-soft">{label}</span>
                <span className="flex items-baseline gap-3">
                  {!compact && (
                    <span className="eyebrow" aria-hidden="true">
                      wt {weight}
                    </span>
                  )}
                  <span className="data text-lg text-ink" aria-label={`${label} score ${value} out of 100`}>
                    {value.toFixed(0)}
                  </span>
                </span>
              </div>
              <div className="service-bar mt-2" aria-hidden="true">
                <span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
              </div>
            </li>
          )
        })}
      </ol>

      {finalScore !== undefined && (
        <div className="mt-1 flex items-baseline justify-between border-t-2 border-ink pt-4">
          <span className="eyebrow">Composite</span>
          <span className="data text-3xl text-brass" aria-label={`Final score ${finalScore} out of 100`}>
            {finalScore.toFixed(1)}
          </span>
        </div>
      )}
    </div>
  )
}
