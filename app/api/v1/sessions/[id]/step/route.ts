import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handle, ok, parseBody, requireUser, ApiError } from '@/app/api/v1/_lib/api-helpers'
import { enforceRateLimit } from '@/app/api/v1/_lib/security-helpers'
import { createClient } from '@/services/supabase/server'
import {
  loadDefinition,
  persistStep,
  persistResult,
  persistCompetencyScores,
} from '@/modules/simulation-engine/services/session-service'
import { step } from '@/modules/simulation-engine/engine/state-machine'
import { accumulate } from '@/modules/simulation-engine/engine/scoring'
import type { SessionSnapshot } from '@/modules/simulation-engine/engine/types'

const stepSchema = z.object({
  choiceId: z.string().min(1),
  eventKey: z.string().uuid().optional(),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/v1/sessions/:id/step
 * Authoritative evaluation of one decision. The server rebuilds the
 * session from the persisted event log, never from client state.
 */
export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
  return handle(async () => {
    const { userId } = await requireUser()
    const { id: sessionId } = await params
    const { choiceId, eventKey } = await parseBody(request, stepSchema)

    await enforceRateLimit('step', userId)

    const supabase = await createClient()

    // 1. Load the session row. RLS restricts to owner (or manager/admin,
    //    but only the owner may step).
    const { data: sessionRow, error: sessionError } = await supabase
      .from('simulation_sessions')
      .select('id, user_id, simulation_id, current_state_id, status')
      .eq('id', sessionId)
      .single()

    if (sessionError || !sessionRow) {
      throw new ApiError('NOT_FOUND', 'Session not found', 404)
    }
    if (sessionRow.user_id !== userId) {
      throw new ApiError('FORBIDDEN', 'Only the session owner may submit decisions', 403)
    }

    // 2. Load definition and persisted event log.
    const definition = await loadDefinition(sessionRow.simulation_id)

    const { data: eventRows, error: eventError } = await supabase
      .from('simulation_session_events')
      .select('state_id, choice_id, occurred_at')
      .eq('session_id', sessionId)
      .order('occurred_at', { ascending: true })

    if (eventError) {
      throw new ApiError('INTERNAL_ERROR', 'Failed to load session history', 500)
    }

    // 3. Rebuild the snapshot from the event log (source of truth).
    const choiceIndex = new Map(
      Object.values(definition.states).flatMap((state) =>
        state.choices.map((choice) => [choice.id, choice] as const)
      )
    )

    const events = (eventRows ?? []).map((row) => {
      const choice = choiceIndex.get(row.choice_id)
      return {
        stateId: row.state_id,
        choiceId: row.choice_id,
        deltas: choice?.deltas ?? { forbes: 0, lqa: 0, sop: 0, ei: 0 },
        occurredAt: row.occurred_at,
      }
    })

    const snapshot: SessionSnapshot = {
      sessionId,
      simulationId: sessionRow.simulation_id,
      currentStateId: sessionRow.current_state_id ?? definition.entryStateId,
      status: sessionRow.status,
      events,
      cumulative: accumulate(events),
    }

    // 4. Evaluate. Engine errors map to API errors centrally.
    const outcome = step(definition, snapshot, choiceId)

    // 5. Persist event + session, and the result if complete.
    await persistStep({
      sessionId,
      stateId: snapshot.currentStateId,
      choiceId,
      nextStateId: outcome.nextState.id,
      isComplete: outcome.isComplete,
      eventKey,
    })

    if (outcome.isComplete && outcome.result) {
      await persistResult(sessionId, outcome.result)
      await persistCompetencyScores(sessionId, userId, outcome.result.finalScore)
    }

    // 6. Respond. Choices for the next state are returned without deltas:
    //    the client never sees scoring weights mid-session.
    return ok({
      reaction: outcome.reaction,
      currentState: {
        id: outcome.nextState.id,
        name: outcome.nextState.name,
        guestContext: outcome.nextState.guestContext,
        isTerminal: outcome.nextState.isTerminal,
        choices: outcome.nextState.choices.map((choice) => ({
          id: choice.id,
          label: choice.label,
        })),
      },
      status: outcome.session.status,
      result: outcome.result,
    })
  })
}
