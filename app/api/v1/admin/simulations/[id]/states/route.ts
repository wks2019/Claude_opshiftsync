import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handle, ok, parseBody, requireUser, ApiError, requireAdminSupabase } from '@/app/api/v1/_lib/api-helpers'

const bodySchema = z.object({
  name: z.string().min(1),
  guestRequest: z.string().min(1),
  guestMood: z.string().min(1),
  guestBackstory: z.string().optional(),
  isTerminal: z.boolean().default(false),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/v1/admin/simulations/:id/states
 */
export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
  return handle(async () => {
    const { userId } = await requireUser()
    const supabase = await requireAdminSupabase(userId)
    const { id: simulationId } = await params
    const body = await parseBody(request, bodySchema)

    const { data, error } = await supabase
      .from('simulation_states')
      .insert({
        simulation_id: simulationId,
        name: body.name,
        guest_context: {
          request: body.guestRequest,
          mood: body.guestMood,
          ...(body.guestBackstory ? { backstory: body.guestBackstory } : {}),
        },
        is_terminal: body.isTerminal,
      })
      .select('id, name, is_terminal')
      .single()

    if (error || !data) {
      throw new ApiError('INTERNAL_ERROR', `Failed to create state: ${error?.message}`, 500)
    }

    return ok(data, 201)
  })
}
