import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handle, ok, parseBody, requireUser, ApiError, requireAdminSupabase } from '@/app/api/v1/_lib/api-helpers'
import { assertValidDefinition } from '@/modules/simulation-engine/engine/validate'
import { loadDefinition } from '@/modules/simulation-engine/services/session-service'

const bodySchema = z.object({
  entryStateId: z.string().uuid().optional(),
  status: z.enum(['draft', 'pending_approval', 'published', 'archived']).optional(),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/v1/admin/simulations/:id
 * Publishing runs the same assertValidDefinition the engine itself uses
 * before a session can start, so a broken simulation (missing terminal
 * state, dangling next_state_id, no entry state) cannot be published.
 */
export async function PATCH(request: Request, { params }: RouteParams): Promise<NextResponse> {
  return handle(async () => {
    const { userId } = await requireUser()
    const supabase = await requireAdminSupabase(userId)
    const { id } = await params
    const body = await parseBody(request, bodySchema)

    if (body.status === 'published') {
      const definition = await loadDefinition(id, { requirePublished: false }).catch(() => null)
      if (!definition) {
        throw new ApiError('VALIDATION_ERROR', 'Simulation has no entry state set yet', 422)
      }
      try {
        assertValidDefinition(definition)
      } catch (validationError) {
        const message =
          validationError instanceof Error ? validationError.message : 'Invalid simulation'
        throw new ApiError('VALIDATION_ERROR', message, 422)
      }
    }

    const updatePayload: { entry_state_id?: string; status?: typeof body.status } = {}
    if (body.entryStateId) updatePayload.entry_state_id = body.entryStateId
    if (body.status) updatePayload.status = body.status

    const { data, error } = await supabase
      .from('simulations')
      .update(updatePayload)
      .eq('id', id)
      .select('id, title, status, entry_state_id')
      .single()

    if (error || !data) {
      throw new ApiError('NOT_FOUND', 'Simulation not found or update failed', 404)
    }

    return ok(data)
  })
}
