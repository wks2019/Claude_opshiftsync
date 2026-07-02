import 'server-only'
import { createClient } from '@/services/supabase/server'
import { ApiError } from '@/app/api/v1/_lib/api-helpers'

interface RateLimitRule {
  maxHits: number
  windowSeconds: number
}

/**
 * Named limits per endpoint class. Buckets are user-scoped for
 * authenticated routes and IP-scoped for public ones.
 */
export const RATE_LIMITS = {
  step: { maxHits: 30, windowSeconds: 60 },
  sessionStart: { maxHits: 10, windowSeconds: 60 },
  login: { maxHits: 8, windowSeconds: 300 },
  certificateVerify: { maxHits: 20, windowSeconds: 60 },
  aiGenerate: { maxHits: 5, windowSeconds: 300 },
} satisfies Record<string, RateLimitRule>

export async function enforceRateLimit(
  name: keyof typeof RATE_LIMITS,
  subject: string
): Promise<void> {
  const rule = RATE_LIMITS[name]
  const supabase = await createClient()

  const { data: allowed, error } = await supabase.rpc('check_rate_limit', {
    p_bucket: `${name}:${subject}`,
    p_max_hits: rule.maxHits,
    p_window_seconds: rule.windowSeconds,
  })

  // Fail open on infrastructure error, fail closed on explicit denial.
  // A rate limiter outage must not take the product down with it.
  if (error) {
    console.error('Rate limit check failed', error)
    return
  }
  if (allowed === false) {
    throw new ApiError('FORBIDDEN', 'Too many requests, please slow down', 429)
  }
}

/**
 * Appends to the tenant audit log. Fire-and-forget from the caller's
 * perspective: an audit write failure is logged but never fails the
 * business operation it describes.
 */
export async function audit(
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.rpc('write_audit_log', {
    p_action: action,
    p_entity_type: entityType,
    p_entity_id: entityId,
    p_metadata: metadata,
  })
  if (error) {
    console.error(`Audit write failed for ${action} on ${entityType}/${entityId}`, error)
  }
}
