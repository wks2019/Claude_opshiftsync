import { NextResponse } from 'next/server'
import { handle, ok, requireUser } from '@/app/api/v1/_lib/api-helpers'
import { createClient } from '@/services/supabase/server'

/**
 * GET /api/v1/simulations
 * Lists published simulations. RLS scopes results to the caller's tenant.
 */
export async function GET(): Promise<NextResponse> {
  return handle(async () => {
    await requireUser()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('simulations')
      .select('id, title, type, difficulty, status')
      .eq('status', 'published')
      .order('title', { ascending: true })

    if (error) {
      throw new Error(`Failed to load simulations: ${error.message}`)
    }

    return ok(data ?? [])
  })
}
