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

export async function inviteUser(input: InviteUserInput) {
  const parsed = inviteUserSchema.parse(input)
  const admin = createAdminClient()

  const { data, error } = await admin.auth.admin.inviteUserByEmail(parsed.email, {
    data: {
      full_name: parsed.fullName,
      role: parsed.role,
      hotel_group_id: parsed.hotelGroupId,
      hotel_id: parsed.hotelId ?? '',
      department_id: parsed.departmentId ?? '',
      team_id: parsed.teamId ?? '',
    },
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/set-password`,
  })

  if (error) {
    throw new Error(`Failed to invite user: ${error.message}`)
  }

  return data.user
}
