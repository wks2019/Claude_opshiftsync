'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { AuditLedger } from '@/components/audit-ledger'
import type { GuestMood, SimulationResult } from '@/modules/simulation-engine/engine/types'

interface ChoiceView {
  id: string
  label: string
}

interface StateView {
  id: string
  name: string
  guestContext: { mood: GuestMood; request: string; backstory?: string }
  isTerminal?: boolean
  choices: ChoiceView[]
}

interface StepResponse {
  data: {
    reaction: { dialogue: string; moodShift: GuestMood }
    currentState: StateView
    status: 'in_progress' | 'completed' | 'abandoned'
    result: SimulationResult | null
  }
  error?: { code: string; message: string }
}

interface SimulationPlayerProps {
  sessionId: string
  title: string
  initialState: StateView
}

const MOOD_LABEL: Record<GuestMood, string> = {
  delighted: 'Delighted',
  pleased: 'Pleased',
  neutral: 'Composed',
  impatient: 'Impatient',
  frustrated: 'Frustrated',
  angry: 'Angry',
}

const MOOD_TONE: Record<GuestMood, string> = {
  delighted: 'text-sage',
  pleased: 'text-sage',
  neutral: 'text-stone',
  impatient: 'text-brass',
  frustrated: 'text-claret',
  angry: 'text-claret',
}

async function submitStep(sessionId: string, choiceId: string): Promise<StepResponse['data']> {
  const response = await fetch(`/api/v1/sessions/${sessionId}/step`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ choiceId }),
  })
  const payload = (await response.json()) as StepResponse
  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message ?? 'The decision could not be submitted')
  }
  return payload.data
}

/**
 * The simulation player. Reads as a service moment, not a quiz:
 * the guest's words lead the screen in the display face, the guest's
 * mood is a single quiet word that shifts with each decision, and
 * decisions are full-sentence service actions, not A/B/C options.
 * Scores stay invisible until the scenario concludes, where the
 * Audit Ledger delivers the result.
 */
export function SimulationPlayer({ sessionId, title, initialState }: SimulationPlayerProps) {
  const [state, setState] = useState<StateView>(initialState)
  const [lastDialogue, setLastDialogue] = useState<string | null>(null)
  const [result, setResult] = useState<SimulationResult | null>(null)

  const mutation = useMutation({
    mutationFn: (choiceId: string) => submitStep(sessionId, choiceId),
    onSuccess: (data) => {
      setLastDialogue(data.reaction.dialogue)
      setState(data.currentState)
      if (data.result) setResult(data.result)
    },
  })

  const mood = state.guestContext.mood

  if (result) {
    return (
      <section aria-label="Scenario result" className="mx-auto max-w-xl">
        <p className="eyebrow">Scenario complete</p>
        <h1 className="display mt-2 text-2xl text-ink">{title}</h1>
        {lastDialogue && <p className="mt-6 text-ink-soft italic">"{lastDialogue}"</p>}
        <div className="mt-10">
          <AuditLedger result={result} finalScore={result.finalScore} />
        </div>
        <div className="mt-10 flex items-baseline gap-8">
          <a
            href=""
            className="border border-ink px-5 py-2 text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            Try again
          </a>
          <a
            href="/staff/simulations"
            className="border-b border-brass pb-0.5 text-ink transition-colors hover:text-brass"
          >
            Return to simulations
          </a>
        </div>
      </section>
    )
  }

  return (
    <section aria-label={`Simulation: ${title}`} className="mx-auto max-w-xl">
      <div className="flex items-baseline justify-between">
        <p className="eyebrow">{title}</p>
        <p className="eyebrow" aria-live="polite">
          Guest: <span className={MOOD_TONE[mood]}>{MOOD_LABEL[mood]}</span>
        </p>
      </div>

      <div aria-live="polite" className="mt-8 min-h-32">
        {lastDialogue && <p className="mb-6 text-ink-soft italic">"{lastDialogue}"</p>}
        <h1 className="display text-2xl leading-snug text-ink">{state.guestContext.request}</h1>
        {state.guestContext.backstory && (
          <p className="mt-3 text-sm text-stone">{state.guestContext.backstory}</p>
        )}
      </div>

      <div className="mt-10">
        <p className="eyebrow mb-1">Your response</p>
        <ol>
          {state.choices.map((choice) => (
            <li key={choice.id} className="border-t hairline">
              <button
                type="button"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate(choice.id)}
                className="w-full py-4 text-left text-ink-soft transition-colors hover:text-ink focus-visible:text-ink disabled:opacity-40"
              >
                {choice.label}
              </button>
            </li>
          ))}
        </ol>
        <div className="border-t hairline" aria-hidden="true" />
      </div>

      {mutation.isError && (
        <p role="alert" className="mt-6 text-sm text-claret">
          {(mutation.error as Error).message}. Choose again to retry.
        </p>
      )}
    </section>
  )
}
