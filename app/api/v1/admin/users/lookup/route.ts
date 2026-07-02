import { NextResponse } from 'next/server'
import { handle, ok, requireUser, ApiError } from '@/app/api/v1/_lib/api-helpers'
import { createClient } from '@/services/supabase/server'

/**
 * GET /api/v1/admin/users/lookup?email=...
 * Administrator only. RLS additionally scopes results to the caller's
 * own tenant.
 */
export async function GET(request: Request): Promise<NextResponse> {
  return handle(async () => {
    const { userId: callerId } = await requireUser()
    const supabase = await createClient()

    const { data: callerRole } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', callerId)
      .limit(1)
      .maybeSingle()

    const isAdmin = (callerRole?.roles as { name?: string } | null)?.name === 'administrator'
    if (!isAdmin) {
      throw new ApiError('FORBIDDEN', 'Only administrators may look up users', 403)
    }

    const email = new URL(request.url).searchParams.get('email')
    if (!email) {
      throw new ApiError('VALIDATION_ERROR', 'email query parameter is required', 400)
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('email', email)
      .single()

    if (error || !data) {
      throw new ApiError('NOT_FOUND', 'No user found with that email', 404)
    }

    return ok(data)
  })
}
