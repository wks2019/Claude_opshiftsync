import 'server-only'
import { createAdminClient } from '@/services/supabase/admin'
import { z } from 'zod'

const inviteUserSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  role: z.enum(['staff', 'manager', 'administrator']),
  hotelGroupId: z.string().uuid(),
  hotelId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
})

export type InviteUserInput = z.infer<typeof inviteUserSchema>

function generateTempPassword(): string {
  const bytes = new Uint8Array(12)
  crypto.getRandomValues(bytes)
  const random = Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 16)
  return `Cw-${random}!1`
}

/**
 * Creates the user directly with a generated password rather than sending
 * a magic-link invite email. Supabase's default email sending has no
 * custom SMTP configured for this project and is rate-limited, so it is
 * not a dependable delivery path yet. The admin shares the returned
 * temporary password with the new user directly; a proper email flow is
 * a Phase 1 hardening item once SMTP is set up.
 */
export async function inviteUser(input: InviteUserInput) {
  const parsed = inviteUserSchema.parse(input)
  const admin = createAdminClient()
  const tempPassword = generateTempPassword()

  const { data, error } = await admin.auth.admin.createUser({
    email: parsed.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.fullName,
      role: parsed.role,
      hotel_group_id: parsed.hotelGroupId,
      hotel_id: parsed.hotelId ?? '',
      department_id: parsed.departmentId ?? '',
      team_id: parsed.teamId ?? '',
    },
  })

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`)
  }

  return { user: data.user, tempPassword }
}
