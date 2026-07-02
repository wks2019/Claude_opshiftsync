import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handle, ok, parseBody, requireUser, ApiError } from '@/app/api/v1/_lib/api-helpers'
import { createClient } from '@/services/supabase/server'
import { inviteUser } from '@/services/auth/invite-user'

const bodySchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  role: z.enum(['staff', 'manager', 'administrator']),
})

/**
 * POST /api/v1/admin/users/invite
 * Administrator only. Creates the user within the caller's own tenant.
 */
export async function POST(request: Request): Promise<NextResponse> {
  return handle(async () => {
    const { userId } = await requireUser()
    const supabase = await createClient()

    const { data: callerRole } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle()

    const isAdmin = (callerRole?.roles as { name?: string } | null)?.name === 'administrator'
    if (!isAdmin) {
      throw new ApiError('FORBIDDEN', 'Only administrators may invite users', 403)
    }

    const { data: callerProfile } = await supabase
      .from('users')
      .select('hotel_group_id')
      .eq('id', userId)
      .single()

    if (!callerProfile) {
      throw new ApiError('INTERNAL_ERROR', 'Caller profile not found', 500)
    }

    const body = await parseBody(request, bodySchema)

    const result = await inviteUser({
      email: body.email,
      fullName: body.fullName,
      role: body.role,
      hotelGroupId: callerProfile.hotel_group_id,
    })

    return ok(
      {
        userId: result.user?.id,
        email: body.email,
        tempPassword: result.tempPassword,
      },
      201
    )
  })
}
