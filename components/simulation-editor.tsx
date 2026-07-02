'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
            <button
              type="button"
              disabled={isBusy}
              onClick={() => setStatus('published')}
              className="eyebrow border-b border-sage pb-0.5 text-sage transition-opacity hover:opacity-70 disabled:opacity-40"
            >
              Publish
            </button>
          )}
          {status !== 'archived' && (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => setStatus('archived')}
              className="eyebrow border-b border-claret pb-0.5 text-claret transition-opacity hover:opacity-70 disabled:opacity-40"
            >
              Archive
            </button>
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
        <select
          id="entryState"
          value={entryStateId ?? ''}
          disabled={isBusy}
          onChange={(event) => setEntryState(event.target.value)}
          className="w-full max-w-sm border-b hairline bg-transparent py-2 text-ink outline-none transition-colors focus:border-brass"
        >
          <option value="" disabled>
            Choose a state
          </option>
          {states.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="border-t hairline pt-6">
        <p className="eyebrow mb-4">States</p>
        {states.length === 0 && <p className="mb-6 text-stone">No states yet.</p>}
        {states.map((s) => (
          <div key={s.id} className="mb-6 border hairline p-4">
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
          </div>
        ))}
      </div>

      <form onSubmit={addState} className="mt-10 space-y-4 border-t hairline pt-6">
        <p className="eyebrow mb-2">Add a state</p>
        <input
          required
          placeholder="State name"
          value={stateName}
          onChange={(event) => setStateName(event.target.value)}
          className="w-full border-b hairline bg-transparent py-2 text-ink outline-none focus:border-brass"
        />
        <input
          required
          placeholder="Guest request / narration"
          value={guestRequest}
          onChange={(event) => setGuestRequest(event.target.value)}
          className="w-full border-b hairline bg-transparent py-2 text-ink outline-none focus:border-brass"
        />
        <div className="flex items-center gap-4">
          <input
            placeholder="Guest mood"
            value={guestMood}
            onChange={(event) => setGuestMood(event.target.value)}
            className="border-b hairline bg-transparent py-2 text-ink outline-none focus:border-brass"
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
        <button
          type="submit"
          disabled={isBusy}
          className="border border-ink px-5 py-2 text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-40"
        >
          Add state
        </button>
      </form>

      {states.length >= 2 && (
        <form onSubmit={addChoice} className="mt-10 space-y-4 border-t hairline pt-6">
          <p className="eyebrow mb-2">Add a choice</p>
          <select
            required
            value={choiceStateId}
            onChange={(event) => setChoiceStateId(event.target.value)}
            className="w-full border-b hairline bg-transparent py-2 text-ink outline-none focus:border-brass"
          >
            <option value="" disabled>
              From state
            </option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <textarea
            required
            rows={2}
            placeholder="Choice label (what the staff member says or does)"
            value={choiceLabel}
            onChange={(event) => setChoiceLabel(event.target.value)}
            className="w-full border hairline bg-transparent p-2 text-ink outline-none focus:border-brass"
          />
          <select
            required
            value={choiceNextStateId}
            onChange={(event) => setChoiceNextStateId(event.target.value)}
            className="w-full border-b hairline bg-transparent py-2 text-ink outline-none focus:border-brass"
          >
            <option value="" disabled>
              Leads to state
            </option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <textarea
            required
            rows={2}
            placeholder="Guest reaction (dialogue)"
            value={choiceDialogue}
            onChange={(event) => setChoiceDialogue(event.target.value)}
            className="w-full border hairline bg-transparent p-2 text-ink outline-none focus:border-brass"
          />
          <input
            required
            placeholder="Guest mood shift"
            value={choiceMoodShift}
            onChange={(event) => setChoiceMoodShift(event.target.value)}
            className="w-full border-b hairline bg-transparent py-2 text-ink outline-none focus:border-brass"
          />
          <div className="grid grid-cols-4 gap-3">
            {[
              ['Forbes', forbesDelta, setForbesDelta],
              ['LQA', lqaDelta, setLqaDelta],
              ['SOP', sopDelta, setSopDelta],
              ['EI', eiDelta, setEiDelta],
            ].map(([label, value, setter]) => (
              <div key={label as string}>
                <label className="eyebrow mb-1 block">{label as string}</label>
                <input
                  type="number"
                  min={0}
                  max={25}
                  value={value as number}
                  onChange={(event) =>
                    (setter as (n: number) => void)(Number(event.target.value))
                  }
                  className="w-full border-b hairline bg-transparent py-1 text-ink outline-none focus:border-brass"
                />
              </div>
            ))}
          </div>
          <button
            type="submit"
            disabled={isBusy}
            className="border border-ink px-5 py-2 text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-40"
          >
            Add choice
          </button>
        </form>
      )}
    </div>
  )
}
