import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handle, ok, parseBody, requireUser, ApiError } from '@/app/api/v1/_lib/api-helpers'
import { createClient } from '@/services/supabase/server'

const bodySchema = z.object({
  storagePath: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().min(0),
  folder: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
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
    throw new ApiError('FORBIDDEN', 'Only administrators may manage the media library', 403)
  }
  return supabase
}

/**
 * POST /api/v1/admin/media
 * The browser uploads the file directly to Supabase Storage (storage RLS
 * enforces the {hotel_group_id}/... path prefix), then calls this route
 * to record the asset. If this fails, the object exists in storage but
 * has no library row, harmless orphan, cleaned up manually if it matters.
 */
export async function POST(request: Request): Promise<NextResponse> {
  return handle(async () => {
    const { userId } = await requireUser()
    const supabase = await requireAdminSupabase(userId)
    const body = await parseBody(request, bodySchema)

    const { data: profile } = await supabase
      .from('users')
      .select('hotel_group_id')
      .eq('id', userId)
      .single()

    if (!profile) {
      throw new ApiError('INTERNAL_ERROR', 'Could not resolve caller hotel group', 500)
    }

    const { data, error } = await supabase
      .from('media_assets')
      .insert({
        hotel_group_id: profile.hotel_group_id,
        storage_path: body.storagePath,
        file_name: body.fileName,
        mime_type: body.mimeType,
        size_bytes: body.sizeBytes,
        folder: body.folder ?? 'general',
        tags: body.tags ?? [],
        uploaded_by: userId,
      })
      .select('id, storage_path, file_name, mime_type, size_bytes, folder, tags, created_at')
      .single()

    if (error || !data) {
      throw new ApiError('INTERNAL_ERROR', `Failed to record asset: ${error?.message}`, 500)
    }

    return ok(data, 201)
  })
}
