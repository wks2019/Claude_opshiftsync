import { NextResponse } from 'next/server'
import { handle, ok, requireUser, ApiError } from '@/app/api/v1/_lib/api-helpers'
import { loadDefinition, createSessionRow } from '@/modules/simulation-engine/services/session-service'
import { createSession } from '@/modules/simulation-engine/engine/state-machine'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/v1/simulations/:id/sessions
 * Starts a new session at the simulation's entry state.
 */
export async function POST(_request: Request, { params }: RouteParams): Promise<NextResponse> {
  return handle(async () => {
    const { userId } = await requireUser()
    const { id: simulationId } = await params

    // loadDefinition enforces published status; RLS enforces tenant scope.
    const definition = await loadDefinition(simulationId).catch(() => {
      throw new ApiError('NOT_FOUND', 'Simulation not found or not published', 404)
    })

    // Validates the definition and produces the initial snapshot.
    const snapshot = createSession(definition, 'pending')
    const sessionId = await createSessionRow(simulationId, definition.entryStateId, userId)

    const entryState = definition.states[definition.entryStateId]

    return ok(
      {
        sessionId,
        simulationId,
        title: definition.title,
        currentState: {
          id: entryState.id,
          name: entryState.name,
          guestContext: entryState.guestContext,
          choices: entryState.choices.map((choice) => ({
            id: choice.id,
            label: choice.label,
          })),
        },
        cumulativeHidden: true,
        status: snapshot.status,
      },
      201
    )
  })
}
