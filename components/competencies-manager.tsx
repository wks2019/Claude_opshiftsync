'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/toast-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { FieldHint } from '@/components/ui/field-hint'

interface CompetencyRow {
  id: string
  name: string
  description: string | null
}

interface StandardRow {
  id: string
  name: string
  is_global: boolean
}

interface WeightRow {
  id: string
  standard_id: string
  weight: number
}

interface CompetenciesManagerProps {
  competencies: CompetencyRow[]
  standards: StandardRow[]
  weights: WeightRow[]
}

export function CompetenciesManager({ competencies, standards, weights }: CompetenciesManagerProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  async function addCompetency(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setIsBusy(true)
    try {
      const response = await fetch('/api/v1/admin/competencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: description || undefined }),
      })
      const payload = await response.json()
      if (!response.ok || payload.error) {
        throw new Error(payload.error?.message ?? 'Could not add competency')
      }
      setName('')
      setDescription('')
      router.refresh()
      showToast('Competency added.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add competency')
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <div className="grid gap-16 sm:grid-cols-2">
      <div>
        <p className="eyebrow mb-4">Competencies</p>
        <ol className="mb-8">
          {competencies.map((competency) => (
            <li key={competency.id} className="border-t hairline py-3">
              <p className="text-ink-soft">{competency.name}</p>
              {competency.description && (
                <p className="mt-1 text-sm text-stone">{competency.description}</p>
              )}
            </li>
          ))}
          {competencies.length === 0 && (
            <li className="border-t hairline py-3 text-stone">No competencies yet.</li>
          )}
          <li className="border-t hairline" aria-hidden="true" />
        </ol>

        <form onSubmit={addCompetency} className="space-y-4">
          <div>
            <label htmlFor="competencyName" className="eyebrow mb-1.5 block">
              Competency name
              <FieldHint example="Guest Recovery" />
            </label>
            <Input
              id="competencyName"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="competencyDescription" className="eyebrow mb-1.5 block">
              Description (optional)
              <FieldHint example="Turning a service failure into a moment the guest remembers positively." />
            </label>
            <Input
              id="competencyDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-claret">
              {error}
            </p>
          )}
          <Button type="submit" isLoading={isBusy} loadingLabel="Adding…">
            Add competency
          </Button>
        </form>
      </div>

      <div>
        <p className="eyebrow mb-4">Standard weighting</p>
        <div className="space-y-4">
          {standards.map((standard) => (
            <WeightRow key={standard.id} standard={standard} weights={weights} />
          ))}
          {standards.length === 0 && <p className="text-stone">No standards seeded yet.</p>}
        </div>
      </div>
    </div>
  )
}

function WeightRow({ standard, weights }: { standard: StandardRow; weights: WeightRow[] }) {
  const router = useRouter()
  const { showToast } = useToast()
  const existing = weights.find((w) => w.standard_id === standard.id)
  const [weight, setWeight] = useState(existing?.weight ?? 0)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setError(null)
    setIsSaving(true)
    try {
      const response = await fetch('/api/v1/admin/standard-weights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ standardId: standard.id, weight }),
      })
      const payload = await response.json()
      if (!response.ok || payload.error) {
        throw new Error(payload.error?.message ?? 'Could not save weight')
      }
      router.refresh()
      showToast(`${standard.name} weight saved.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save weight')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card padding="sm">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-ink-soft">
          {standard.name}
          {standard.is_global && <span className="eyebrow ml-2 text-stone">Global</span>}
        </span>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            max={100}
            value={weight}
            onChange={(event) => setWeight(Number(event.target.value))}
            onBlur={save}
            fullWidth={false}
            dense
          />
          <span className="eyebrow text-stone">%</span>
        </div>
      </div>
      {isSaving && <p className="eyebrow mt-2 text-stone">Saving…</p>}
      {error && (
        <p role="alert" className="mt-2 text-sm text-claret">
          {error}
        </p>
      )}
    </Card>
  )
}
