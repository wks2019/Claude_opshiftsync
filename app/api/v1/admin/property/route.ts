import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handle, ok, parseBody, requireUser, ApiError } from '@/app/api/v1/_lib/api-helpers'
import { createClient } from '@/services/supabase/server'

const bodySchema = z.object({
  name: z.string().min(1).optional(),
  branding: z
    .object({
      logoUrl: z.string().url().optional(),
      accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    })
    .optional(),
})

/**
 * PATCH /api/v1/admin/property
 * Updates the caller's own hotel_group. RLS additionally scopes this
 * to the caller's tenant and requires the administrator role.
 */
export async function PATCH(request: Request): Promise<NextResponse> {
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
      throw new ApiError('FORBIDDEN', 'Only administrators may edit property settings', 403)
    }

    const { data: profile } = await supabase
      .from('users')
      .select('hotel_group_id')
      .eq('id', userId)
      .single()

    if (!profile) {
      throw new ApiError('INTERNAL_ERROR', 'Caller profile not found', 500)
    }

    const body = await parseBody(request, bodySchema)

    const patch: Partial<{ name: string; branding: Record<string, unknown> }> = {}
    if (body.name !== undefined) patch.name = body.name

    if (body.branding !== undefined) {
      const { data: current } = await supabase
        .from('hotel_groups')
        .select('branding')
        .eq('id', profile.hotel_group_id)
        .single()

      patch.branding = { ...(current?.branding ?? {}), ...body.branding }
    }

    if (Object.keys(patch).length === 0) {
      throw new ApiError('VALIDATION_ERROR', 'No fields to update', 400)
    }

    const { data, error } = await supabase
      .from('hotel_groups')
      .update(patch)
      .eq('id', profile.hotel_group_id)
      .select('id, name, branding')
      .single()

    if (error || !data) {
      throw new ApiError('INTERNAL_ERROR', `Failed to update property: ${error?.message}`, 500)
    }

    return ok(data)
  })
}
