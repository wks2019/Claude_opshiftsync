import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handle, ok, parseBody, requireUser, ApiError, requireAdminSupabase } from '@/app/api/v1/_lib/api-helpers'

const bodySchema = z.object({
  name: z.string().min(1),
})

/**
 * POST /api/v1/admin/hotels
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
      throw new ApiError('INTERNAL_ERROR', 'Something went wrong on our side. Sign out and back in, then try again', 500)
    }

    const { data, error } = await supabase
      .from('hotels')
      .insert({ hotel_group_id: profile.hotel_group_id, name: body.name })
      .select('id, name')
      .single()

    if (error || !data) {
      throw new ApiError('INTERNAL_ERROR', `Failed to create hotel: ${error?.message}`, 500)
    }

    return ok(data, 201)
  })
}
