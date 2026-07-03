import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handle, ok, parseBody, requireUser, ApiError, requireAdminSupabase } from '@/app/api/v1/_lib/api-helpers'

const bodySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

/**
 * POST /api/v1/admin/competencies
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
      .from('competencies')
      .insert({
        hotel_group_id: profile.hotel_group_id,
        name: body.name,
        description: body.description ?? null,
      })
      .select('id, name, description')
      .single()

    if (error || !data) {
      throw new ApiError('INTERNAL_ERROR', `Failed to create competency: ${error?.message}`, 500)
    }

    return ok(data, 201)
  })
}
