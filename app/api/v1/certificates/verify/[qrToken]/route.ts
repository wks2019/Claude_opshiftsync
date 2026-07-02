import { NextResponse } from 'next/server'
import { handle, ok, ApiError } from '@/app/api/v1/_lib/api-helpers'
import { createAdminClient } from '@/services/supabase/admin'

interface RouteParams {
  params: Promise<{ qrToken: string }>
}

/**
 * GET /api/v1/certificates/verify/:qrToken
 * Public, unauthenticated. The QR token is the credential. Uses the
 * admin client because the verifier has no session; the projection is
 * deliberately narrow so nothing sensitive can leak.
 */
export async function GET(_request: Request, { params }: RouteParams): Promise<NextResponse> {
  return handle(async () => {
    const { qrToken } = await params

    if (!/^[A-Za-z0-9_-]{16,128}$/.test(qrToken)) {
      throw new ApiError('VALIDATION_ERROR', 'Invalid verification token format', 400)
    }

    const admin = createAdminClient()

    const { data, error } = await admin
      .from('certificates')
      .select('certificate_number, issued_at, revoked_at, expires_at, users(full_name), courses(title)')
      .eq('qr_token', qrToken)
      .single()

    if (error || !data) {
      throw new ApiError('NOT_FOUND', 'Certificate not found', 404)
    }

    const isExpired = data.expires_at !== null && new Date(data.expires_at) < new Date()

    return ok({
      certificateNumber: data.certificate_number,
      holderName: (data.users as { full_name: string } | null)?.full_name ?? 'Unknown',
      courseTitle: (data.courses as { title: string } | null)?.title ?? null,
      issuedAt: data.issued_at,
      expiresAt: data.expires_at,
      valid: data.revoked_at === null && !isExpired,
      revokedAt: data.revoked_at,
      expired: isExpired,
    })
  })
}
