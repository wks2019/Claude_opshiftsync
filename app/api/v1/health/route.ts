import { NextResponse } from 'next/server'
import { createClient } from '@/services/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/health
 * Used by the deployment smoke check. Verifies the app can reach the
 * database; returns no internal detail beyond up/degraded.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('roles').select('id').limit(1)
    if (error) throw error
    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch {
    return NextResponse.json({ status: 'degraded' }, { status: 503 })
  }
}
