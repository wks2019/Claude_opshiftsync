import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handle, ok, parseBody, requireUser, ApiError, requireAdminSupabase } from '@/app/api/v1/_lib/api-helpers'

const bodySchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
  correctOptionIndex: z.number().int().min(0),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/v1/admin/quizzes/:id/questions
 */
export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
  return handle(async () => {
    const { userId } = await requireUser()
    const supabase = await requireAdminSupabase(userId)
    const { id: quizId } = await params
    const body = await parseBody(request, bodySchema)

    if (body.correctOptionIndex >= body.options.length) {
      throw new ApiError('VALIDATION_ERROR', 'correctOptionIndex is out of range', 400)
    }

    const { data: existing } = await supabase
      .from('quiz_questions')
      .select('sequence')
      .eq('quiz_id', quizId)
      .order('sequence', { ascending: false })
      .limit(1)
      .maybeSingle()

    const sequence = (existing?.sequence ?? -1) + 1

    const { data, error } = await supabase
      .from('quiz_questions')
      .insert({
        quiz_id: quizId,
        question: body.question,
        options: body.options,
        correct_option_index: body.correctOptionIndex,
        sequence,
      })
      .select('id, question, options, correct_option_index, sequence')
      .single()

    if (error || !data) {
      throw new ApiError('INTERNAL_ERROR', `Failed to add question: ${error?.message}`, 500)
    }

    return ok(data, 201)
  })
}
