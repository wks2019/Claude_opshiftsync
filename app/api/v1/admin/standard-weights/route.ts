import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handle, ok, parseBody, requireUser, ApiError, requireAdminSupabase } from '@/app/api/v1/_lib/api-helpers'

const bodySchema = z.object({
  standardId: z.string().uuid(),
  weight: z.number().min(0).max(100),
})

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
