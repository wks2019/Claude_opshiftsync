import Link from 'next/link'
import { createClient } from '@/services/supabase/server'
import { CreateSopForm } from '@/components/create-sop-form'
import { CompetenciesManager } from '@/components/competencies-manager'

export default async function AdminStandardsPage() {
  const supabase = await createClient()

  const { data: sops } = await supabase
    .from('sops')
    .select('id, title, updated_at')
    .order('updated_at', { ascending: false })

  const { data: competencies } = await supabase
    .from('competencies')
    .select('id, name, description')
    .order('name', { ascending: true })

  const { data: standards } = await supabase
    .from('standards')
    .select('id, name, is_global')
    .order('is_global', { ascending: false })

  const { data: weights } = await supabase
    .from('standard_weights')
    .select('id, standard_id, weight')

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

      <div className="mt-16 border-t hairline pt-8">
        <p className="eyebrow mb-6">Competencies and weighting</p>
        <CompetenciesManager
          competencies={competencies ?? []}
          standards={standards ?? []}
          weights={weights ?? []}
        />
      </div>
    </section>
  )
}
