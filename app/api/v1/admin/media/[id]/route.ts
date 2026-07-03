import { NextResponse } from 'next/server'
import { handle, ok, requireUser, ApiError, requireAdminSupabase } from '@/app/api/v1/_lib/api-helpers'

interface RouteParams {
  params: Promise<{ id: string }>
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
