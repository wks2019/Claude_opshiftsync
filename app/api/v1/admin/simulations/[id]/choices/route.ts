import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handle, ok, parseBody, requireUser, ApiError } from '@/app/api/v1/_lib/api-helpers'
import { createClient } from '@/services/supabase/server'

const bodySchema = z.object({
  stateId: z.string().uuid(),
  label: z.string().min(1),
  nextStateId: z.string().uuid(),
  forbesDelta: z.number().min(0).max(25),
  lqaDelta: z.number().min(0).max(25),
  sopDelta: z.number().min(0).max(25),
  eiDelta: z.number().min(0).max(25),
  guestDialogue: z.string().min(1),
  guestMoodShift: z.string().min(1),
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
 * POST /api/v1/admin/simulations/:id/choices
 * The simulation id in the URL is not directly referenced in the insert
 * (choices belong to states, not simulations directly); it is kept in
 * the route for consistency with the states endpoint and future
 * ownership checks.
 */
export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
  return handle(async () => {
    const { userId } = await requireUser()
    const supabase = await requireAdminSupabase(userId)
    await params
    const body = await parseBody(request, bodySchema)

    const { data, error } = await supabase
      .from('simulation_choices')
      .insert({
        state_id: body.stateId,
        label: body.label,
        next_state_id: body.nextStateId,
        forbes_delta: body.forbesDelta,
        lqa_delta: body.lqaDelta,
        sop_delta: body.sopDelta,
        ei_delta: body.eiDelta,
        guest_reaction: { dialogue: body.guestDialogue, moodShift: body.guestMoodShift },
      })
      .select('id, label')
      .single()

    if (error || !data) {
      throw new ApiError('INTERNAL_ERROR', `Failed to create choice: ${error?.message}`, 500)
    }

    return ok(data, 201)
  })
}
