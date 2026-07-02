import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handle, ok, parseBody, requireUser, ApiError } from '@/app/api/v1/_lib/api-helpers'
import { createClient } from '@/services/supabase/server'

const bodySchema = z.object({
  title: z.string().min(1),
  steps: z.array(z.string().min(1)).min(1),
})

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
    throw new ApiError('FORBIDDEN', 'Only administrators may manage SOPs', 403)
  }

  const { data: profile } = await supabase
    .from('users')
    .select('hotel_group_id')
    .eq('id', userId)
    .single()

  if (!profile) {
    throw new ApiError('INTERNAL_ERROR', 'Caller profile not found', 500)
  }
  return { supabase, hotelGroupId: profile.hotel_group_id }
}

/**
 * POST /api/v1/admin/sops
 * Creates an SOP and its first version (version_number 1) in one call.
 */
export async function POST(request: Request): Promise<NextResponse> {
  return handle(async () => {
    const { userId } = await requireUser()
    const { supabase, hotelGroupId } = await requireAdminSupabase(userId)
    const body = await parseBody(request, bodySchema)

    const { data: sop, error: sopError } = await supabase
      .from('sops')
      .insert({ hotel_group_id: hotelGroupId, title: body.title })
      .select('id, title')
      .single()

    if (sopError || !sop) {
      throw new ApiError('INTERNAL_ERROR', `Failed to create SOP: ${sopError?.message}`, 500)
    }

    const { data: version, error: versionError } = await supabase
      .from('sop_versions')
      .insert({
        sop_id: sop.id,
        version_number: 1,
        steps: body.steps,
        published_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (versionError || !version) {
      throw new ApiError(
        'INTERNAL_ERROR',
        `SOP created but first version failed: ${versionError?.message}`,
        500
      )
    }

    const { error: linkError } = await supabase
      .from('sops')
      .update({ current_version_id: version.id })
      .eq('id', sop.id)

    if (linkError) {
      throw new ApiError('INTERNAL_ERROR', `Failed to link current version: ${linkError.message}`, 500)
    }

    return ok({ id: sop.id, title: sop.title, versionId: version.id }, 201)
  })
}
