import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handle, ok, parseBody, requireUser, ApiError } from '@/app/api/v1/_lib/api-helpers'
import { createClient } from '@/services/supabase/server'

const bodySchema = z.object({
  standardId: z.string().uuid(),
  weight: z.number().min(0).max(100),
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
    throw new ApiError('FORBIDDEN', 'Only administrators may manage standard weights', 403)
  }
  return supabase
}

/**
 * POST /api/v1/admin/standard-weights
 * Upserts on the (hotel_group_id, standard_id) unique constraint, so
 * setting a weight twice for the same standard updates it in place.
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
      .from('standard_weights')
      .upsert(
        {
          hotel_group_id: profile.hotel_group_id,
          standard_id: body.standardId,
          weight: body.weight,
        },
        { onConflict: 'hotel_group_id,standard_id' }
      )
      .select('id, standard_id, weight')
      .single()

    if (error || !data) {
      throw new ApiError('INTERNAL_ERROR', `Failed to set weight: ${error?.message}`, 500)
    }

    return ok(data, 201)
  })
}
