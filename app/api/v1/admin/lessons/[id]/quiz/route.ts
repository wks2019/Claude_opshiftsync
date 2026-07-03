import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handle, ok, parseBody, requireUser, ApiError, requireAdminSupabase } from '@/app/api/v1/_lib/api-helpers'

const bodySchema = z.object({
  passingScore: z.number().min(0).max(100),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/v1/admin/lessons/:id/quiz
 * One quiz per lesson. Questions attach separately once the quiz exists.
 */
export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
  return handle(async () => {
    const { userId } = await requireUser()
    const supabase = await requireAdminSupabase(userId)
    const { id: lessonId } = await params
    const body = await parseBody(request, bodySchema)

    const { data, error } = await supabase
      .from('quizzes')
      .insert({ lesson_id: lessonId, passing_score: body.passingScore })
      .select('id, passing_score')
      .single()

    if (error || !data) {
      throw new ApiError('INTERNAL_ERROR', `Failed to create quiz: ${error?.message}`, 500)
    }

    return ok(data, 201)
  })
}
