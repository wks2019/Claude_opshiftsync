'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/toast-provider'
import { Button } from '@/components/ui/button'

interface SimulationRow {
  id: string
  title: string
  status: string
  type: string
}

export function SimulationsList({ simulations }: { simulations: SimulationRow[] }) {
  return (
    <ol>
      {simulations.map((sim) => (
        <SimulationListItem key={sim.id} simulation={sim} />
      ))}
      {simulations.length === 0 && (
        <li className="border-t hairline py-3 text-stone">No simulations yet.</li>
      )}
      <li className="border-t hairline" aria-hidden="true" />
    </ol>
  )
}

function SimulationListItem({ simulation }: { simulation: SimulationRow }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [isDuplicating, setIsDuplicating] = useState(false)

  async function duplicate() {
    setIsDuplicating(true)
    try {
      const response = await fetch(`/api/v1/admin/simulations/${simulation.id}/duplicate`, {
        method: 'POST',
      })
      const payload = await response.json()
      if (!response.ok || payload.error) {
        throw new Error(payload.error?.message ?? 'Could not duplicate simulation')
      }
      router.refresh()
      showToast('Simulation duplicated as a draft.')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not duplicate simulation', 'error')
    } finally {
      setIsDuplicating(false)
    }
  }

  return (
    <li className="border-t hairline py-3">
      <div className="flex items-baseline justify-between gap-4">
        <Link
          href={`/admin/cms/simulations/${simulation.id}`}
          className="flex-1 text-ink-soft transition-colors hover:text-brass"
        >
          {simulation.title}
        </Link>
        <span className="eyebrow shrink-0">{simulation.status}</span>
        <Button
          variant="subtle"
          tone="stone"
          isLoading={isDuplicating}
          loadingLabel="Duplicating…"
          onClick={duplicate}
        >
          Duplicate
        </Button>
      </div>
    </li>
  )
}
