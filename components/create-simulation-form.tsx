'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/toast-provider'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'

const TYPES = [
  ['in_room_dining', 'In-Room Dining'],
  ['concierge', 'Concierge'],
  ['housekeeping', 'Housekeeping'],
  ['front_office', 'Front Office'],
  ['butler_service', 'Butler Service'],
  ['complaint_recovery', 'Complaint Recovery'],
  ['vip_scenario', 'VIP Scenario'],
] as const

export function CreateSimulationForm() {
  const router = useRouter()
  const { showToast } = useToast()
  const [title, setTitle] = useState('')
  const [type, setType] = useState<(typeof TYPES)[number][0]>('in_room_dining')
  const [difficulty, setDifficulty] = useState<'standard' | 'advanced' | 'vip'>('standard')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/v1/admin/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, type, difficulty }),
      })
      const payload = await response.json()
      if (!response.ok || payload.error) {
        throw new Error(payload.error?.message ?? 'Could not create the simulation')
      }
      showToast('Simulation created as a draft.')
      router.push(`/admin/cms/simulations/${payload.data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the simulation')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="simTitle" className="eyebrow mb-1.5 block">
          Title
        </label>
        <Input
          id="simTitle"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor="simType" className="eyebrow mb-1.5 block">
          Type
        </label>
        <Select
          id="simType"
          value={type}
          onChange={(event) => setType(event.target.value as typeof type)}
        >
          {TYPES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label htmlFor="simDifficulty" className="eyebrow mb-1.5 block">
          Difficulty
        </label>
        <Select
          id="simDifficulty"
          value={difficulty}
          onChange={(event) => setDifficulty(event.target.value as typeof difficulty)}
        >
          <option value="standard">Standard</option>
          <option value="advanced">Advanced</option>
          <option value="vip">VIP</option>
        </Select>
      </div>

      {error && (
        <p role="alert" className="text-sm text-claret">
          {error}
        </p>
      )}

      <Button type="submit" isLoading={isSubmitting} loadingLabel="Creating…">
        Create draft
      </Button>
    </form>
  )
}
