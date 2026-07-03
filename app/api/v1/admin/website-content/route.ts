import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  handle,
  ok,
  parseBody,
  requireUser,
  requireAdminSupabase,
  ApiError,
} from '@/app/api/v1/_lib/api-helpers'

const bodySchema = z.object({
  heroEyebrow: z.string().min(1).optional(),
  heroTitle: z.string().min(1).optional(),
  heroSubtitle: z.string().min(1).optional(),
  footerText: z.string().min(1).optional(),
})

/**
 * PATCH /api/v1/admin/website-content
 * Updates the single website_content row. RLS restricts writes to the
 * administrator role, see the migration for the single-tenant scope note.
 */
export async function PATCH(request: Request): Promise<NextResponse> {
  return handle(async () => {
    const { userId } = await requireUser()
    const supabase = await requireAdminSupabase(userId)
    const body = await parseBody(request, bodySchema)

    const patch: Partial<{
      hero_eyebrow: string
      hero_title: string
      hero_subtitle: string
      footer_text: string
    }> = {}
    if (body.heroEyebrow !== undefined) patch.hero_eyebrow = body.heroEyebrow
    if (body.heroTitle !== undefined) patch.hero_title = body.heroTitle
    if (body.heroSubtitle !== undefined) patch.hero_subtitle = body.heroSubtitle
    if (body.footerText !== undefined) patch.footer_text = body.footerText

    if (Object.keys(patch).length === 0) {
      throw new ApiError('VALIDATION_ERROR', 'No fields to update', 400)
    }

    const { data, error } = await supabase
      .from('website_content')
      .update(patch)
      .eq('is_singleton', true)
      .select('hero_eyebrow, hero_title, hero_subtitle, footer_text')
      .single()

    if (error || !data) {
      throw new ApiError('INTERNAL_ERROR', `Failed to update website content: ${error?.message}`, 500)
    }

    return ok(data)
  })
}
