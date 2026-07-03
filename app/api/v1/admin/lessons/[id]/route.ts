import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handle, ok, parseBody, requireUser, ApiError, requireAdminSupabase } from '@/app/api/v1/_lib/api-helpers'

const bodySchema = z.object({
  title: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  sequence: z.number().int().min(0).optional(),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/v1/admin/lessons/:id
 */
export async function PATCH(request: Request, { params }: RouteParams): Promise<NextResponse> {
  return handle(async () => {
    const { userId } = await requireUser()
    const supabase = await requireAdminSupabase(userId)
    const { id } = await params
    const parsed = await parseBody(request, bodySchema)

    const patch: Partial<{ title: string; sequence: number; content: { text: string } }> = {}
    if (parsed.title !== undefined) patch.title = parsed.title
    if (parsed.sequence !== undefined) patch.sequence = parsed.sequence
    if (parsed.body !== undefined) patch.content = { text: parsed.body }

    const { data, error } = await supabase
      .from('lessons')
      .update(patch)
      .eq('id', id)
      .select('id, title, content, sequence')
      .single()

    if (error || !data) {
      throw new ApiError('NOT_FOUND', 'Lesson not found or update failed', 404)
    }

    return ok(data)
  })
}

/**
 * DELETE /api/v1/admin/lessons/:id
 * Cascades to videos, quizzes, and quiz_questions via FK.
 */
export async function DELETE(_request: Request, { params }: RouteParams): Promise<NextResponse> {
  return handle(async () => {
    const { userId } = await requireUser()
    const supabase = await requireAdminSupabase(userId)
    const { id } = await params

    const { error } = await supabase.from('lessons').delete().eq('id', id)

    if (error) {
      throw new ApiError('INTERNAL_ERROR', `Failed to delete lesson: ${error.message}`, 500)
    }

    return ok({ id })
  })
}
