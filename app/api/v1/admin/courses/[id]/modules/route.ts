import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handle, ok, parseBody, requireUser, ApiError, requireAdminSupabase } from '@/app/api/v1/_lib/api-helpers'

const bodySchema = z.object({
  title: z.string().min(1),
})

interface RouteParams {
  params: Promise<{ id: string }>
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
