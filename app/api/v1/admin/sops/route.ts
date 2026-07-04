import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handle, ok, parseBody, requireUser, ApiError, requireAdminSupabase } from '@/app/api/v1/_lib/api-helpers'

const blockSchema = z.discriminatedUnion('type', [
  z.object({ id: z.string(), type: z.literal('procedure'), steps: z.array(z.string()) }),
  z.object({
    id: z.string(),
    type: z.literal('checklist'),
    items: z.array(z.object({ id: z.string(), text: z.string(), checked: z.boolean() })),
  }),
  z.object({
    id: z.string(),
    type: z.literal('media'),
    content: z.string(),
    alt: z.string(),
    caption: z.string(),
  }),
])

const bodySchema = z.object({
  title: z.string().min(1),
  standard: z.string().min(1),
  blocks: z.array(blockSchema).min(1),
})

/** Flattens every procedure block's steps, in block order, for the legacy
 *  `steps` column that the simulation engine and detail page still read. */
function deriveSteps(blocks: z.infer<typeof bodySchema>['blocks']): string[] {
  return blocks
    .filter((block): block is Extract<typeof block, { type: 'procedure' }> => block.type === 'procedure')
    .flatMap((block) => block.steps.map((step) => step.trim()).filter(Boolean))
}

/**
 * POST /api/v1/admin/sops
 * Creates an SOP and its first version (version_number 1) in one call.
 */
export async function POST(request: Request): Promise<NextResponse> {
  return handle(async () => {
    const { userId } = await requireUser()
    const supabase = await requireAdminSupabase(userId)
    const body = await parseBody(request, bodySchema)

    const steps = deriveSteps(body.blocks)
    if (steps.length === 0) {
      throw new ApiError('VALIDATION_ERROR', 'Add at least one procedure step.', 400)
    }

    const { data: profile } = await supabase
      .from('users')
      .select('hotel_group_id')
      .eq('id', userId)
      .single()

    if (!profile) {
      throw new ApiError('INTERNAL_ERROR', 'Something went wrong on our side. Sign out and back in, then try again', 500)
    }

    const { data: sop, error: sopError } = await supabase
      .from('sops')
      .insert({ hotel_group_id: profile.hotel_group_id, title: body.title })
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
        standard: body.standard,
        blocks: body.blocks,
        steps,
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
