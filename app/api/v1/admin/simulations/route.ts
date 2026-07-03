import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handle, ok, parseBody, requireUser, ApiError, requireAdminSupabase } from '@/app/api/v1/_lib/api-helpers'

const bodySchema = z.object({
  title: z.string().min(1),
  type: z.enum([
    'in_room_dining',
    'concierge',
    'housekeeping',
    'front_office',
    'butler_service',
    'complaint_recovery',
    'vip_scenario',
  ]),
  difficulty: z.enum(['standard', 'advanced', 'vip']),
})

/**
 * POST /api/v1/admin/simulations
 * Creates a draft simulation shell with no states. States and choices
 * are added afterward via the editor; the simulation cannot be
 * published until it has a valid entry state and at least one terminal
 * state, enforced by the engine's own validateDefinition, not here.
 */
export async function POST(request: Request): Promise<NextResponse> {
  return handle(async () => {
    const { userId } = await requireUser()
    const supabase = await requireAdminSupabase(userId)
    const body = await parseBody(request, bodySchema)

    const { data: profile } = await supabase
      .from('users')
      .select('hotel_group_id')
      .eq('id', userId)
      .single()

    if (!profile) {
      throw new ApiError('INTERNAL_ERROR', 'Could not resolve caller hotel group', 500)
    }

    const { data, error } = await supabase
      .from('simulations')
      .insert({
        hotel_group_id: profile.hotel_group_id,
        title: body.title,
        type: body.type,
        difficulty: body.difficulty,
        status: 'draft',
      })
      .select('id, title, status')
      .single()

    if (error || !data) {
      throw new ApiError('INTERNAL_ERROR', `Failed to create simulation: ${error?.message}`, 500)
    }

    return ok(data, 201)
  })
}
