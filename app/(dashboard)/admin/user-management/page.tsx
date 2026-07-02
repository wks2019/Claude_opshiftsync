import { createClient } from '@/services/supabase/server'
import { InviteUserForm } from '@/components/invite-user-form'

export default async function AdminUserManagementPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, email, status, user_roles(roles(name))')
    .order('created_at', { ascending: false })

  return (
    <section className="fade-in">
      <p className="eyebrow mb-2">People</p>
      <h1 className="display mb-10 text-2xl text-ink">Your team</h1>

      <div className="grid gap-16 sm:grid-cols-2">
        <div>
          <p className="eyebrow mb-4">Everyone</p>
          <ol>
            {(users ?? []).map((person) => {
              const roleName =
                (person.user_roles?.[0]?.roles as unknown as { name?: string } | null)?.name ??
                'staff'
              return (
                <li key={person.id} className="border-t hairline py-3">
                  <div className="flex items-baseline justify-between gap-4">
                    <div>
                      <p className="text-ink-soft">{person.full_name}</p>
                      <p className="text-sm text-stone">{person.email}</p>
                    </div>
                    <span className="eyebrow shrink-0">
                      {roleName} · {person.status}
                    </span>
                  </div>
                </li>
              )
            })}
            <li className="border-t hairline" aria-hidden="true" />
          </ol>
        </div>

        <div>
          <p className="eyebrow mb-4">Add someone</p>
          <InviteUserForm />
        </div>
      </div>
    </section>
  )
}
