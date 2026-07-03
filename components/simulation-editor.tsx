'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/toast-provider'
import { Button } from '@/components/ui/button'
import { Input, Select, Textarea } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { FieldHint } from '@/components/ui/field-hint'

interface StateRow {
  id: string
  name: string
  is_terminal: boolean
}

interface ChoiceRow {
  id: string
  state_id: string
  label: string
  next_state_id: string
}

interface SimulationEditorProps {
  simulationId: string
  status: 'draft' | 'pending_approval' | 'published' | 'archived'
  entryStateId: string | null
  states: StateRow[]
  choices: ChoiceRow[]
}

export function SimulationEditor({
  simulationId,
  status,
  entryStateId,
  states,
  choices,
}: SimulationEditorProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [error, setError] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  // Add-state form
  const [stateName, setStateName] = useState('')
  const [guestRequest, setGuestRequest] = useState('')
  const [guestMood, setGuestMood] = useState('neutral')
  const [isTerminal, setIsTerminal] = useState(false)

  // Add-choice form
  const [choiceStateId, setChoiceStateId] = useState('')
  const [choiceLabel, setChoiceLabel] = useState('')
  const [choiceNextStateId, setChoiceNextStateId] = useState('')
  const [choiceDialogue, setChoiceDialogue] = useState('')
  const [choiceMoodShift, setChoiceMoodShift] = useState('neutral')
  const [forbesDelta, setForbesDelta] = useState(10)
  const [lqaDelta, setLqaDelta] = useState(10)
  const [sopDelta, setSopDelta] = useState(10)
  const [eiDelta, setEiDelta] = useState(10)

  async function callApi(path: string, method: 'POST' | 'PATCH', body: unknown) {
    const response = await fetch(path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const payload = await response.json()
    if (!response.ok || payload.error) {
      throw new Error(payload.error?.message ?? 'Request failed')
    }
    return payload.data
  }

  async function addState(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setIsBusy(true)
    try {
      await callApi(`/api/v1/admin/simulations/${simulationId}/states`, 'POST', {
        name: stateName,
        guestRequest,
        guestMood,
        isTerminal,
      })
      setStateName('')
      setGuestRequest('')
      setGuestMood('neutral')
      setIsTerminal(false)
      router.refresh()
      showToast('State added.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add state')
    } finally {
      setIsBusy(false)
    }
  }

  async function addChoice(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setIsBusy(true)
    try {
      await callApi(`/api/v1/admin/simulations/${simulationId}/choices`, 'POST', {
        stateId: choiceStateId,
        label: choiceLabel,
        nextStateId: choiceNextStateId,
        forbesDelta,
        lqaDelta,
        sopDelta,
        eiDelta,
        guestDialogue: choiceDialogue,
        guestMoodShift: choiceMoodShift,
      })
      setChoiceLabel('')
      setChoiceDialogue('')
      router.refresh()
      showToast('Choice added.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add choice')
    } finally {
      setIsBusy(false)
    }
  }

  async function setEntryState(newEntryStateId: string) {
    setError(null)
    setIsBusy(true)
    try {
      await callApi(`/api/v1/admin/simulations/${simulationId}`, 'PATCH', { entryStateId: newEntryStateId })
      router.refresh()
      showToast('Entry state set.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not set entry state')
    } finally {
      setIsBusy(false)
    }
  }

  async function setStatus(newStatus: string) {
    setError(null)
    setIsBusy(true)
    try {
      await callApi(`/api/v1/admin/simulations/${simulationId}`, 'PATCH', { status: newStatus })
      router.refresh()
      showToast(`Simulation ${newStatus}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update status')
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <div>
      <div className="mb-10 flex items-center justify-between gap-4">
        <span className="eyebrow">{status}</span>
        <div className="flex gap-4">
          {status !== 'published' && (
            <Button variant="subtle" tone="sage" disabled={isBusy} onClick={() => { if (confirm('Publishing makes this simulation visible to all staff immediately. Publish?')) setStatus('published') }}>
              Publish
            </Button>
          )}
          {status !== 'archived' && (
            <Button variant="subtle" tone="claret" disabled={isBusy} onClick={() => setStatus('archived')}>
              Archive
            </Button>
          )}
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-6 text-sm text-claret">
          {error}
        </p>
      )}

      <div className="mb-10 border-t hairline pt-6">
        <label htmlFor="entryState" className="eyebrow mb-1.5 block">
          Entry state
        </label>
        <Select
          id="entryState"
          value={entryStateId ?? ''}
          disabled={isBusy}
          onChange={(event) => setEntryState(event.target.value)}
          className="max-w-sm"
        >
          <option value="" disabled>
            Choose a state
          </option>
          {states.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="border-t hairline pt-6">
        <p className="eyebrow mb-4">States</p>
        {states.length === 0 && <p className="mb-6 text-stone">No states yet.</p>}
        {states.map((s) => (
          <Card key={s.id} className="fade-in mb-6">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-ink-soft">{s.name}</p>
              <span className="eyebrow shrink-0">
                {s.is_terminal ? 'Terminal' : 'In progress'}
                {s.id === entryStateId ? ' · Entry' : ''}
              </span>
            </div>
            <ul className="mt-3 space-y-1">
              {choices
                .filter((c) => c.state_id === s.id)
                .map((c) => (
                  <li key={c.id} className="text-sm text-stone">
                    → {c.label.slice(0, 60)}
                    {c.label.length > 60 ? '…' : ''}
                  </li>
                ))}
            </ul>
          </Card>
        ))}
      </div>

      <form onSubmit={addState} className="mt-10 space-y-4 border-t hairline pt-6">
        <p className="eyebrow mb-2">Add a state</p>
        <Input
          required
          placeholder="State name"
          value={stateName}
          onChange={(event) => setStateName(event.target.value)}
        />
        <Input
          required
          placeholder="Guest request / narration"
          value={guestRequest}
          onChange={(event) => setGuestRequest(event.target.value)}
        />
        <div className="flex items-center gap-4">
          <Input
            placeholder="Guest mood"
            value={guestMood}
            onChange={(event) => setGuestMood(event.target.value)}
            fullWidth={false}
          />
          <label className="eyebrow flex items-center gap-2">
            <input
              type="checkbox"
              checked={isTerminal}
              onChange={(event) => setIsTerminal(event.target.checked)}
            />
            Terminal state
          </label>
        </div>
        <Button type="submit" disabled={isBusy}>
          Add state
        </Button>
      </form>

      {states.length >= 2 && (
        <form onSubmit={addChoice} className="mt-10 space-y-4 border-t hairline pt-6">
          <p className="eyebrow mb-2">Add a choice</p>
          <Select
            required
            value={choiceStateId}
            onChange={(event) => setChoiceStateId(event.target.value)}
          >
            <option value="" disabled>
              From state
            </option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          <Textarea
            required
            rows={2}
            placeholder="Choice label (what the staff member says or does)"
            value={choiceLabel}
            onChange={(event) => setChoiceLabel(event.target.value)}
          />
          <Select
            required
            value={choiceNextStateId}
            onChange={(event) => setChoiceNextStateId(event.target.value)}
          >
            <option value="" disabled>
              Leads to state
            </option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          <Textarea
            required
            rows={2}
            placeholder="Guest reaction (dialogue)"
            value={choiceDialogue}
            onChange={(event) => setChoiceDialogue(event.target.value)}
          />
          <Input
            required
            placeholder="Guest mood shift"
            value={choiceMoodShift}
            onChange={(event) => setChoiceMoodShift(event.target.value)}
          />
          <div>
            <p className="eyebrow mb-1.5">
              Score impact
              <FieldHint example="Points this choice earns per dimension, 0 to 25. The best choice in a state should score highest; a poor choice can score 0. Example: a warm, by-the-book recovery might be Forbes 20, LQA 18, SOP 22, EI 20." />
            </p>
            <div className="grid grid-cols-4 gap-3">
              {[
                ['Forbes', forbesDelta, setForbesDelta],
                ['LQA', lqaDelta, setLqaDelta],
                ['SOP', sopDelta, setSopDelta],
                ['EI', eiDelta, setEiDelta],
              ].map(([label, value, setter]) => (
                <div key={label as string}>
                  <label className="eyebrow mb-1 block">{label as string}</label>
                  <Input
                    type="number"
                    min={0}
                    max={25}
                    value={value as number}
                    onChange={(event) =>
                      (setter as (n: number) => void)(Number(event.target.value))
                    }
                    dense
                  />
                </div>
              ))}
            </div>
          </div>
          <Button type="submit" disabled={isBusy}>
            Add choice
          </Button>
        </form>
      )}
    </div>
  )
}
