import 'server-only'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * For server-rendered pages that read public, unauthenticated data
 * (RLS policy `using (true)`) and want to stay eligible for static
 * generation / ISR. The cookie-based server client in server.ts calls
 * next/headers' cookies(), which forces the whole route dynamic even
 * when nothing auth-related is actually needed.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
