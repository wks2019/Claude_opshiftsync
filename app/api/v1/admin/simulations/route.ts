import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handle, ok, parseBody, requireUser, ApiError } from '@/app/api/v1/_lib/api-helpers'
import { createClient } from '@/services/supabase/server'

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

async function requireAdminSupabase(userId: string) {
  const supabase = await createClient()
  const { data: callerRole } = await supabase
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  const isAdmin = (callerRole?.roles as { name?: string } | null)?.name === 'administrator'
  if (!isAdmin) {
    throw new ApiError('FORBIDDEN', 'Only administrators may author simulations', 403)
  }

  const { data: profile } = await supabase
    .from('users')
    .select('hotel_group_id')
    .eq('id', userId)
    .single()

  if (!profile) {
    throw new ApiError('INTERNAL_ERROR', 'Caller profile not found', 500)
  }
  return { supabase, hotelGroupId: profile.hotel_group_id }
}

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
    const { supabase, hotelGroupId } = await requireAdminSupabase(userId)
    const body = await parseBody(request, bodySchema)

    const { data, error } = await supabase
      .from('simulations')
      .insert({
        hotel_group_id: hotelGroupId,
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
