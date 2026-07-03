import { NextResponse } from 'next/server'
import { handle, ok, requireUser, ApiError } from '@/app/api/v1/_lib/api-helpers'
import { createClient } from '@/services/supabase/server'

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
    throw new ApiError('FORBIDDEN', 'Only administrators may manage the media library', 403)
  }
  return supabase
}

/**
 * DELETE /api/v1/admin/media/:id
 */
export async function DELETE(_request: Request, { params }: RouteParams): Promise<NextResponse> {
  return handle(async () => {
    const { userId } = await requireUser()
    const supabase = await requireAdminSupabase(userId)
    const { id } = await params

    const { data: asset } = await supabase
      .from('media_assets')
      .select('storage_path')
      .eq('id', id)
      .single()

    if (!asset) {
      throw new ApiError('NOT_FOUND', 'Asset not found', 404)
    }

    const { error: storageError } = await supabase.storage.from('media').remove([asset.storage_path])
    if (storageError) {
      throw new ApiError('INTERNAL_ERROR', `Failed to delete file: ${storageError.message}`, 500)
    }

    const { error: rowError } = await supabase.from('media_assets').delete().eq('id', id)
    if (rowError) {
      throw new ApiError('INTERNAL_ERROR', `Failed to delete record: ${rowError.message}`, 500)
    }

    return ok({ id })
  })
}
