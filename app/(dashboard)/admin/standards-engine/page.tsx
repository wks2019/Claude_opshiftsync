import Link from 'next/link'
import { createClient } from '@/services/supabase/server'
import { CreateSopForm } from '@/components/create-sop-form'

export default async function AdminStandardsPage() {
  const supabase = await createClient()

  const { data: sops } = await supabase
    .from('sops')
    .select('id, title, updated_at')
    .order('updated_at', { ascending: false })

  return (
    <section className="fade-in">
      <p className="eyebrow mb-2">Standards</p>
      <h1 className="display mb-10 text-2xl text-ink">SOP library</h1>

      <div className="grid gap-16 sm:grid-cols-2">
        <div>
          <p className="eyebrow mb-4">All SOPs</p>
          <ol>
            {(sops ?? []).map((sop) => (
              <li key={sop.id} className="border-t hairline py-3">
                <Link
                  href={`/admin/standards-engine/${sop.id}`}
                  className="block text-ink-soft transition-colors hover:text-brass"
                >
                  {sop.title}
                </Link>
              </li>
            ))}
            {(!sops || sops.length === 0) && (
              <li className="border-t hairline py-3 text-stone">No SOPs yet.</li>
            )}
            <li className="border-t hairline" aria-hidden="true" />
          </ol>
        </div>

        <div>
          <p className="eyebrow mb-4">New SOP</p>
          <CreateSopForm />
        </div>
      </div>
    </section>
  )
}
