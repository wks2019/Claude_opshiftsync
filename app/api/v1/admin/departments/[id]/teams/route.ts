import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handle, ok, parseBody, requireUser, ApiError } from '@/app/api/v1/_lib/api-helpers'
import { createClient } from '@/services/supabase/server'

const bodySchema = z.object({
  name: z.string().min(1),
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
    throw new ApiError('FORBIDDEN', 'Only administrators may manage hotels', 403)
  }
  return supabase
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
