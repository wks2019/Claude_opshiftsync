'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/toast-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface HotelRow {
  id: string
  name: string
}

interface DepartmentRow {
  id: string
  hotel_id: string
  name: string
}

interface TeamRow {
  id: string
  department_id: string
  name: string
}

interface HotelsManagerProps {
  hotels: HotelRow[]
  departments: DepartmentRow[]
  teams: TeamRow[]
}

export function HotelsManager({ hotels, departments, teams }: HotelsManagerProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [newHotelName, setNewHotelName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  async function addHotel(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setIsBusy(true)
    try {
      const response = await fetch('/api/v1/admin/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newHotelName }),
      })
      const payload = await response.json()
      if (!response.ok || payload.error) {
        throw new Error(payload.error?.message ?? 'Could not add hotel')
      }
      setNewHotelName('')
      router.refresh()
      showToast('Hotel added.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add hotel')
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <div className="space-y-8">
      {hotels.map((hotel) => (
        <Card key={hotel.id} className="fade-in">
          <p className="text-ink-soft">{hotel.name}</p>
          <div className="mt-4 space-y-4 border-t hairline pt-4">
            {departments
              .filter((department) => department.hotel_id === hotel.id)
              .map((department) => (
                <DepartmentRow key={department.id} department={department} teams={teams} />
              ))}
          </div>
          <AddDepartmentForm hotelId={hotel.id} />
        </Card>
      ))}

      {hotels.length === 0 && <p className="text-stone">No hotels yet. Add your first property below.</p>}

      {error && (
        <p role="alert" className="text-sm text-claret">
          {error}
        </p>
      )}

      <form onSubmit={addHotel} className="flex items-end gap-4">
        <div className="flex-1">
          <label htmlFor="newHotelName" className="eyebrow mb-1.5 block">
            New hotel
          </label>
          <Input
            id="newHotelName"
            required
            value={newHotelName}
            onChange={(event) => setNewHotelName(event.target.value)}
          />
        </div>
        <Button type="submit" isLoading={isBusy} loadingLabel="Adding…">
          Add hotel
        </Button>
      </form>
    </div>
  )
}

function DepartmentRow({ department, teams }: { department: DepartmentRow; teams: TeamRow[] }) {
  return (
    <div>
      <p className="eyebrow text-stone">{department.name}</p>
      <ul className="mt-2 space-y-1">
        {teams
          .filter((team) => team.department_id === department.id)
          .map((team) => (
            <li key={team.id} className="text-sm text-ink-soft">
              {team.name}
            </li>
          ))}
      </ul>
      <AddTeamForm departmentId={department.id} />
    </div>
  )
}

function AddDepartmentForm({ hotelId }: { hotelId: string }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/v1/admin/hotels/${hotelId}/departments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const payload = await response.json()
      if (!response.ok || payload.error) {
        throw new Error(payload.error?.message ?? 'Could not add department')
      }
      setName('')
      router.refresh()
      showToast('Department added.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add department')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex items-end gap-3">
      <Input
        required
        placeholder="Department name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        fullWidth={false}
      />
      <Button type="submit" variant="subtle" tone="brass" isLoading={isSubmitting} loadingLabel="Adding…">
        Add department
      </Button>
      {error && (
        <p role="alert" className="text-sm text-claret">
          {error}
        </p>
      )}
    </form>
  )
}

function AddTeamForm({ departmentId }: { departmentId: string }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/v1/admin/departments/${departmentId}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const payload = await response.json()
      if (!response.ok || payload.error) {
        throw new Error(payload.error?.message ?? 'Could not add team')
      }
      setName('')
      router.refresh()
      showToast('Team added.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add team')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex items-end gap-3">
      <Input
        required
        placeholder="Team name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        fullWidth={false}
      />
      <Button type="submit" variant="subtle" tone="stone" isLoading={isSubmitting} loadingLabel="Adding…">
        Add team
      </Button>
      {error && (
        <p role="alert" className="text-sm text-claret">
          {error}
        </p>
      )}
    </form>
  )
}
