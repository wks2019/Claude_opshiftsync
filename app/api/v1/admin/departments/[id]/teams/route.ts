import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handle, ok, parseBody, requireUser, ApiError, requireAdminSupabase } from '@/app/api/v1/_lib/api-helpers'

const bodySchema = z.object({
  name: z.string().min(1),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/v1/admin/departments/:id/teams
 */
export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
  return handle(async () => {
    const { userId } = await requireUser()
    const supabase = await requireAdminSupabase(userId)
    const { id: departmentId } = await params
    const body = await parseBody(request, bodySchema)

    const { data, error } = await supabase
      .from('teams')
      .insert({ department_id: departmentId, name: body.name })
      .select('id, name')
      .single()

    if (error || !data) {
      throw new ApiError('INTERNAL_ERROR', `Failed to create team: ${error?.message}`, 500)
    }

    return ok(data, 201)
  })
}
