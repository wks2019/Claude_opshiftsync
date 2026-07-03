import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handle, ok, parseBody, requireUser, ApiError, requireAdminSupabase } from '@/app/api/v1/_lib/api-helpers'

const bodySchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/v1/admin/modules/:id/lessons
 * `content` is stored as jsonb; { text: string } is the Phase 1 shape.
 * Video and quiz blocks attach to a lesson separately once it exists.
 */
export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
  return handle(async () => {
    const { userId } = await requireUser()
    const supabase = await requireAdminSupabase(userId)
    const { id: courseModuleId } = await params
    const body = await parseBody(request, bodySchema)

    const { data: existing } = await supabase
      .from('lessons')
      .select('sequence')
      .eq('course_module_id', courseModuleId)
      .order('sequence', { ascending: false })
      .limit(1)
      .maybeSingle()

    const sequence = (existing?.sequence ?? -1) + 1

    const { data, error } = await supabase
      .from('lessons')
      .insert({
        course_module_id: courseModuleId,
        title: body.title,
        content: { text: body.body },
        sequence,
      })
      .select('id, title, content, sequence')
      .single()

    if (error || !data) {
      throw new ApiError('INTERNAL_ERROR', `Failed to create lesson: ${error?.message}`, 500)
    }

    return ok(data, 201)
  })
}
