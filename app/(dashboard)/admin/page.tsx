import { createClient } from '@/services/supabase/server'

async function count(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: 'users' | 'simulations' | 'courses' | 'certificates'
) {
  const { count: total } = await supabase.from(table).select('*', { count: 'exact', head: true })
  return total ?? 0
}

export default async function AdminOverviewPage() {
  const supabase = await createClient()

  const [users, simulations, courses, certificates] = await Promise.all([
    count(supabase, 'users'),
    count(supabase, 'simulations'),
    count(supabase, 'courses'),
    count(supabase, 'certificates'),
  ])

  const stats = [
    { label: 'People', value: users, href: '/admin/user-management' },
    { label: 'Simulations', value: simulations, href: '/admin/cms' },
    { label: 'Courses', value: courses, href: '/admin/cms' },
    { label: 'Certificates issued', value: certificates, href: null },
  ]

  return (
    <section className="fade-in">
      <p className="eyebrow mb-2">Overview</p>
      <h1 className="display mb-8 text-2xl text-ink">Your property</h1>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="border-t hairline pt-3">
            <p className="data text-3xl text-ink">{stat.value}</p>
            <p className="eyebrow mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 border-t hairline pt-8">
        <p className="text-stone">
          Content authoring (CMS), user invitations, and tenant branding are on the way. For now,
          simulations are seeded directly, and your own account was provisioned as the first
          administrator.
        </p>
      </div>
    </section>
  )
}
