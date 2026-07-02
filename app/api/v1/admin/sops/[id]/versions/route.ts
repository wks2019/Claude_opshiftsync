import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handle, ok, parseBody, requireUser, ApiError } from '@/app/api/v1/_lib/api-helpers'
import { createClient } from '@/services/supabase/server'

const bodySchema = z.object({
  steps: z.array(z.string().min(1)).min(1),
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
    throw new ApiError('FORBIDDEN', 'Only administrators may manage SOPs', 403)
  }
  return supabase
}

/**
 * POST /api/v1/admin/sops/:id/versions
 * Appends the next version_number for the SOP and sets it as current.
 * Prior versions stay in sop_versions, unchanged, that is the history.
 */
export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
  return handle(async () => {
    const { userId } = await requireUser()
    const supabase = await requireAdminSupabase(userId)
    const { id: sopId } = await params
    const body = await parseBody(request, bodySchema)

    const { data: latest } = await supabase
      .from('sop_versions')
      .select('version_number')
      .eq('sop_id', sopId)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextVersionNumber = (latest?.version_number ?? 0) + 1

    const { data: version, error: versionError } = await supabase
      .from('sop_versions')
      .insert({
        sop_id: sopId,
        version_number: nextVersionNumber,
        steps: body.steps,
        published_at: new Date().toISOString(),
      })
      .select('id, version_number, steps, published_at')
      .single()

    if (versionError || !version) {
      throw new ApiError('INTERNAL_ERROR', `Failed to create version: ${versionError?.message}`, 500)
    }

    const { error: linkError } = await supabase
      .from('sops')
      .update({ current_version_id: version.id })
      .eq('id', sopId)

    if (linkError) {
      throw new ApiError('INTERNAL_ERROR', `Failed to set current version: ${linkError.message}`, 500)
    }

    return ok(version, 201)
  })
}
