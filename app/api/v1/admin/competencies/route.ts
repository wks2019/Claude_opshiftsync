import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handle, ok, parseBody, requireUser, ApiError } from '@/app/api/v1/_lib/api-helpers'
import { createClient } from '@/services/supabase/server'

const bodySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
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
    throw new ApiError('FORBIDDEN', 'Only administrators may manage competencies', 403)
  }
  return supabase
}

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
