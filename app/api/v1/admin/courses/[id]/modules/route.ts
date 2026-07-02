import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handle, ok, parseBody, requireUser, ApiError } from '@/app/api/v1/_lib/api-helpers'
import { createClient } from '@/services/supabase/server'

const bodySchema = z.object({
  title: z.string().min(1),
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
 * POST /api/v1/admin/courses/:id/modules
 * Sequence is appended after the current highest module for the course.
 */
export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
  return handle(async () => {
    const { userId } = await requireUser()
    const supabase = await requireAdminSupabase(userId)
    const { id: courseId } = await params
    const body = await parseBody(request, bodySchema)

    const { data: existing } = await supabase
      .from('course_modules')
      .select('sequence')
      .eq('course_id', courseId)
      .order('sequence', { ascending: false })
      .limit(1)
      .maybeSingle()

    const sequence = (existing?.sequence ?? -1) + 1

    const { data, error } = await supabase
      .from('course_modules')
      .insert({ course_id: courseId, title: body.title, sequence })
      .select('id, title, sequence')
      .single()

    if (error || !data) {
      throw new ApiError('INTERNAL_ERROR', `Failed to create module: ${error?.message}`, 500)
    }

    return ok(data, 201)
  })
}
