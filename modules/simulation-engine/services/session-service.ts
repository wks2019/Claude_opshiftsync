import 'server-only'
import { createClient } from '@/services/supabase/server'
import type {
  ScoreDeltas,
  SimulationChoice,
  SimulationDefinition,
  SimulationState,
} from '../engine/types'

interface StateRow {
  id: string
  name: string
  guest_context: { mood?: string; request?: string; backstory?: string }
  is_terminal: boolean
}

interface ChoiceRow {
  id: string
  state_id: string
  label: string
  next_state_id: string
  forbes_delta: number
  lqa_delta: number
  sop_delta: number
  ei_delta: number
  sop_reference_id: string | null
  guest_reaction: { dialogue?: string; moodShift?: string }
}

/**
 * Loads a simulation and assembles the in-memory definition the engine
 * operates on. RLS scopes rows to the caller's tenant. By default only
 * published simulations load, matching the real session-start flow;
 * pass requirePublished: false for pre-publish validation, where the
 * simulation is by definition not yet published.
 */
export async function loadDefinition(
  simulationId: string,
  options: { requirePublished?: boolean } = {}
): Promise<SimulationDefinition> {
  const { requirePublished = true } = options
  const supabase = await createClient()

  let query = supabase
    .from('simulations')
    .select('id, title, type, difficulty, entry_state_id, status')
    .eq('id', simulationId)

  if (requirePublished) {
    query = query.eq('status', 'published')
  }

  const { data: simulation, error: simError } = await query.single()

  if (simError || !simulation) {
    throw new Error(`Simulation ${simulationId} not found or not published`)
  }
  if (!simulation.entry_state_id) {
    throw new Error(`Simulation ${simulationId} has no entry state configured`)
  }

  const { data: stateRows, error: stateError } = await supabase
    .from('simulation_states')
    .select('id, name, guest_context, is_terminal')
    .eq('simulation_id', simulationId)

  if (stateError) throw new Error(`Failed to load states: ${stateError.message}`)

  const stateIds = (stateRows ?? []).map((row) => row.id)

  const { data: choiceRows, error: choiceError } = await supabase
    .from('simulation_choices')
    .select(
      'id, state_id, label, next_state_id, forbes_delta, lqa_delta, sop_delta, ei_delta, sop_reference_id, guest_reaction'
    )
    .in('state_id', stateIds)

  if (choiceError) throw new Error(`Failed to load choices: ${choiceError.message}`)

  const choicesByState = new Map<string, SimulationChoice[]>()
  for (const row of (choiceRows ?? []) as ChoiceRow[]) {
    const deltas: ScoreDeltas = {
      forbes: Number(row.forbes_delta),
      lqa: Number(row.lqa_delta),
      sop: Number(row.sop_delta),
      ei: Number(row.ei_delta),
    }
    const choice: SimulationChoice = {
      id: row.id,
      label: row.label,
      nextStateId: row.next_state_id,
      deltas,
      sopReferenceId: row.sop_reference_id ?? undefined,
      guestReaction: {
        dialogue: row.guest_reaction?.dialogue ?? '',
        moodShift: (row.guest_reaction?.moodShift ?? 'neutral') as SimulationState['guestContext']['mood'],
      },
    }
    const existing = choicesByState.get(row.state_id) ?? []
    existing.push(choice)
    choicesByState.set(row.state_id, existing)
  }

  const states: Record<string, SimulationState> = {}
  for (const row of (stateRows ?? []) as StateRow[]) {
    states[row.id] = {
      id: row.id,
      name: row.name,
      guestContext: {
        mood: (row.guest_context?.mood ?? 'neutral') as SimulationState['guestContext']['mood'],
        request: row.guest_context?.request ?? '',
        backstory: row.guest_context?.backstory,
      },
      isTerminal: row.is_terminal,
      choices: choicesByState.get(row.id) ?? [],
    }
  }

  return {
    id: simulation.id,
    title: simulation.title,
    type: simulation.type,
    difficulty: simulation.difficulty,
    entryStateId: simulation.entry_state_id,
    states,
  }
}

export async function createSessionRow(simulationId: string, entryStateId: string, userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('simulation_sessions')
    .insert({
      user_id: userId,
      simulation_id: simulationId,
      current_state_id: entryStateId,
      status: 'in_progress',
    })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to create session: ${error.message}`)
  return data.id as string
}

export async function persistStep(params: {
  sessionId: string
  stateId: string
  choiceId: string
  nextStateId: string
  isComplete: boolean
  eventKey?: string
}) {
  const supabase = await createClient()

  const { error: eventError } = await supabase.from('simulation_session_events').insert({
    session_id: params.sessionId,
    state_id: params.stateId,
    choice_id: params.choiceId,
    event_key: params.eventKey ?? null,
  })
  if (eventError) {
    // 23505: unique violation on (session_id, event_key). The decision was
    // already recorded by an earlier attempt; the retry must not double-count.
    if (eventError.code === '23505') {
      throw new Error('DUPLICATE_EVENT')
    }
    throw new Error(`Failed to persist event: ${eventError.message}`)
  }

  const { error: sessionError } = await supabase
    .from('simulation_sessions')
    .update({
      current_state_id: params.nextStateId,
      status: params.isComplete ? 'completed' : 'in_progress',
      completed_at: params.isComplete ? new Date().toISOString() : null,
    })
    .eq('id', params.sessionId)
  if (sessionError) throw new Error(`Failed to update session: ${sessionError.message}`)
}

export async function persistResult(
  sessionId: string,
  result: { forbesScore: number; lqaScore: number; sopScore: number; eiScore: number; finalScore: number }
) {
  const supabase = await createClient()

  const { error } = await supabase.from('simulation_results').insert({
    session_id: sessionId,
    forbes_score: result.forbesScore,
    lqa_score: result.lqaScore,
    sop_score: result.sopScore,
    ei_score: result.eiScore,
    final_score: result.finalScore,
  })

  if (error) throw new Error(`Failed to persist result: ${error.message}`)
}

/**
 * After a simulation result is written, score the user against every
 * competency defined for their tenant. The score per competency is the
 * session's final_score. This is a flat mapping today: every simulation
 * contributes to every competency equally. A future refinement could
 * link specific competencies to specific simulations or weight
 * dimensions differently per competency. For now, having any data at
 * all is the unlock that makes the staff competencies page functional.
 */
export async function persistCompetencyScores(
  sessionId: string,
  userId: string,
  finalScore: number
) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('users')
    .select('hotel_group_id')
    .eq('id', userId)
    .single()

  if (!profile) return

  const { data: competencies } = await supabase
    .from('competencies')
    .select('id')
    .eq('hotel_group_id', profile.hotel_group_id)

  if (!competencies || competencies.length === 0) return

  const rows = competencies.map((c) => ({
    user_id: userId,
    competency_id: c.id,
    score: finalScore,
    source_session_id: sessionId,
  }))

  const { error } = await supabase.from('competency_scores').insert(rows)

  if (error) {
    // Non-fatal. The simulation result is already saved. Log but do not
    // throw, so the user still sees their Audit Ledger even if scoring
    // fails for an infrastructure reason.
    console.error(`Failed to persist competency scores: ${error.message}`)
  }
}
