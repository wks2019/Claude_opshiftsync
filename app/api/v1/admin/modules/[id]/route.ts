import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handle, ok, parseBody, requireUser, ApiError } from '@/app/api/v1/_lib/api-helpers'
import { createClient } from '@/services/supabase/server'

const bodySchema = z.object({
  title: z.string().min(1).optional(),
  sequence: z.number().int().min(0).optional(),
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
    throw new ApiError('FORBIDDEN', 'Only administrators may author courses', 403)
  }
  return supabase
}

/**
 * PATCH /api/v1/admin/modules/:id
 */
export async function PATCH(request: Request, { params }: RouteParams): Promise<NextResponse> {
  return handle(async () => {
    const { userId } = await requireUser()
    const supabase = await requireAdminSupabase(userId)
    const { id } = await params
    const body = await parseBody(request, bodySchema)

    const { data, error } = await supabase
      .from('course_modules')
      .update(body)
      .eq('id', id)
      .select('id, title, sequence')
      .single()

    if (error || !data) {
      throw new ApiError('NOT_FOUND', 'Module not found or update failed', 404)
    }

    return ok(data)
  })
}

/**
 * DELETE /api/v1/admin/modules/:id
 * Cascades to lessons, videos, quizzes, and quiz_questions via FK.
 */
export async function DELETE(_request: Request, { params }: RouteParams): Promise<NextResponse> {
  return handle(async () => {
    const { userId } = await requireUser()
    const supabase = await requireAdminSupabase(userId)
    const { id } = await params

    const { error } = await supabase.from('course_modules').delete().eq('id', id)

    if (error) {
      throw new ApiError('INTERNAL_ERROR', `Failed to delete module: ${error.message}`, 500)
    }

    return ok({ id })
  })
}
