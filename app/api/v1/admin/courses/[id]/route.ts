import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handle, ok, parseBody, requireUser, ApiError } from '@/app/api/v1/_lib/api-helpers'
import { createClient } from '@/services/supabase/server'

const bodySchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

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
    throw new ApiError('FORBIDDEN', 'Only administrators may manage content', 403)
  }
  return supabase
}

/**
 * PATCH /api/v1/admin/courses/:id
 * Updates title, description, and/or status. RLS additionally scopes
 * this to the caller's own tenant.
 */
export async function PATCH(request: Request, { params }: RouteParams): Promise<NextResponse> {
  return handle(async () => {
    const { userId } = await requireUser()
    const supabase = await requireAdminSupabase(userId)
    const { id } = await params
    const body = await parseBody(request, bodySchema)

    const { data, error } = await supabase
      .from('courses')
      .update(body)
      .eq('id', id)
      .select('id, title, description, status')
      .single()

    if (error || !data) {
      throw new ApiError('NOT_FOUND', 'Course not found or update failed', 404)
    }

    return ok(data)
  })
}
