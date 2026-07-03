import { createClient } from '@/services/supabase/server'

async function count(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: 'users' | 'simulations' | 'courses' | 'certificates' | 'hotels' | 'departments' | 'teams',
  filter?: { column: string; value: string }
) {
  let query = supabase.from(table).select('*', { count: 'exact', head: true })
  if (filter) query = query.eq(filter.column, filter.value)
  const { count: total } = await query
  return total ?? 0
}

export default async function AdminOverviewPage() {
  const supabase = await createClient()

  const [
    users,
    simulations,
    courses,
    certificates,
    hotels,
    departments,
    teams,
    draftSimulations,
    draftCourses,
  ] = await Promise.all([
    count(supabase, 'users'),
    count(supabase, 'simulations'),
    count(supabase, 'courses'),
    count(supabase, 'certificates'),
    count(supabase, 'hotels'),
    count(supabase, 'departments'),
    count(supabase, 'teams'),
    count(supabase, 'simulations', { column: 'status', value: 'draft' }),
    count(supabase, 'courses', { column: 'status', value: 'draft' }),
  ])

  const { data: recentCertificates } = await supabase
    .from('certificates')
    .select('id, certificate_number, issued_at, users(full_name), courses(title)')
    .order('issued_at', { ascending: false })
    .limit(5)

  const stats = [
    { label: 'People', value: users, href: '/admin/user-management' },
    { label: 'Simulations', value: simulations, href: '/admin/cms' },
    { label: 'Courses', value: courses, href: '/admin/cms' },
    { label: 'Certificates issued', value: certificates, href: null },
    { label: 'Hotels', value: hotels, href: '/admin/tenant-settings' },
    { label: 'Departments', value: departments, href: '/admin/tenant-settings' },
    { label: 'Teams', value: teams, href: '/admin/tenant-settings' },
  ]

  const needsAttention = [
    draftSimulations > 0 && `${draftSimulations} simulation${draftSimulations === 1 ? '' : 's'} in draft`,
    draftCourses > 0 && `${draftCourses} course${draftCourses === 1 ? '' : 's'} in draft`,
  ].filter(Boolean) as string[]

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

      {needsAttention.length > 0 && (
        <div className="mt-12 border-t hairline pt-8">
          <p className="eyebrow mb-3">Needs attention</p>
          <ul className="space-y-1">
            {needsAttention.map((item) => (
              <li key={item} className="text-ink-soft">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-12 border-t hairline pt-8">
        <p className="eyebrow mb-4">Recent certificates</p>
        {recentCertificates && recentCertificates.length > 0 ? (
          <ol>
            {recentCertificates.map((cert) => (
              <li key={cert.id} className="border-t hairline py-3">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-ink-soft">
                    {(cert.users as { full_name: string } | null)?.full_name ?? 'Unknown'}
                    {', '}
                    {(cert.courses as { title: string } | null)?.title ?? 'Certificate'}
                  </span>
                  <span className="eyebrow shrink-0 text-stone">
                    {new Date(cert.issued_at).toLocaleDateString()}
                  </span>
                </div>
              </li>
            ))}
            <li className="border-t hairline" aria-hidden="true" />
          </ol>
        ) : (
          <p className="text-stone">None issued yet.</p>
        )}
      </div>
    </section>
  )
}
