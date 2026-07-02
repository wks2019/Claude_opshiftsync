import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handle, ok, parseBody, requireUser, ApiError } from '@/app/api/v1/_lib/api-helpers'
import { createClient } from '@/services/supabase/server'

const bodySchema = z.object({
  name: z.string().min(1),
  guestRequest: z.string().min(1),
  guestMood: z.string().min(1),
  guestBackstory: z.string().optional(),
  isTerminal: z.boolean().default(false),
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
    throw new ApiError('FORBIDDEN', 'Only administrators may author simulations', 403)
  }
  return supabase
}

/**
 * POST /api/v1/admin/simulations/:id/states
 */
export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
  return handle(async () => {
    const { userId } = await requireUser()
    const supabase = await requireAdminSupabase(userId)
    const { id: simulationId } = await params
    const body = await parseBody(request, bodySchema)

    const { data, error } = await supabase
      .from('simulation_states')
      .insert({
        simulation_id: simulationId,
        name: body.name,
        guest_context: {
          request: body.guestRequest,
          mood: body.guestMood,
          ...(body.guestBackstory ? { backstory: body.guestBackstory } : {}),
        },
        is_terminal: body.isTerminal,
      })
      .select('id, name, is_terminal')
      .single()

    if (error || !data) {
      throw new ApiError('INTERNAL_ERROR', `Failed to create state: ${error?.message}`, 500)
    }

    return ok(data, 201)
  })
}
