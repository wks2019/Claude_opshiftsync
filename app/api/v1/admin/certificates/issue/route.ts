import { NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import { handle, ok, parseBody, requireUser, ApiError } from '@/app/api/v1/_lib/api-helpers'
import { createClient } from '@/services/supabase/server'
import { createAdminClient } from '@/services/supabase/admin'

const bodySchema = z.object({
  userId: z.string().uuid(),
  courseId: z.string().uuid(),
})

function generateCertificateNumber(): string {
  const year = new Date().getFullYear()
  const suffix = randomBytes(4).toString('hex').toUpperCase()
  return `CW-${year}-${suffix}`
}

function generateQrToken(): string {
  return randomBytes(24).toString('base64url')
}

/**
 * POST /api/v1/admin/certificates/issue
 * Administrator only. Issues via the admin client (service role),
 * bypassing RLS deliberately: certificate issuance is a trusted system
 * action, not something a user should be able to do to themselves, so
 * there is intentionally no user-facing INSERT policy on certificates.
 */
export async function POST(request: Request): Promise<NextResponse> {
  return handle(async () => {
    const { userId: callerId } = await requireUser()
    const supabase = await createClient()

    const { data: callerRole } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', callerId)
      .limit(1)
      .maybeSingle()

    const isAdmin = (callerRole?.roles as { name?: string } | null)?.name === 'administrator'
    if (!isAdmin) {
      throw new ApiError('FORBIDDEN', 'Only administrators may issue certificates', 403)
    }

    const { data: callerProfile } = await supabase
      .from('users')
      .select('hotel_group_id')
      .eq('id', callerId)
      .single()

    if (!callerProfile) {
      throw new ApiError('INTERNAL_ERROR', 'Caller profile not found', 500)
    }

    const body = await parseBody(request, bodySchema)

    // Confirm the recipient belongs to the same tenant before issuing,
    // since the admin client bypasses RLS entirely.
    const { data: recipient } = await supabase
      .from('users')
      .select('id, hotel_group_id')
      .eq('id', body.userId)
      .single()

    if (!recipient || recipient.hotel_group_id !== callerProfile.hotel_group_id) {
      throw new ApiError('NOT_FOUND', 'Recipient not found in your property', 404)
    }

    const admin = createAdminClient()
    const certificateNumber = generateCertificateNumber()
    const qrToken = generateQrToken()

    const { data: certificate, error } = await admin
      .from('certificates')
      .insert({
        user_id: body.userId,
        course_id: body.courseId,
        certificate_number: certificateNumber,
        qr_token: qrToken,
        storage_path: `certificates/${certificateNumber}.pdf`,
      })
      .select('id, certificate_number, qr_token, issued_at')
      .single()

    if (error || !certificate) {
      throw new ApiError('INTERNAL_ERROR', `Failed to issue certificate: ${error?.message}`, 500)
    }

    return ok(certificate, 201)
  })
}
