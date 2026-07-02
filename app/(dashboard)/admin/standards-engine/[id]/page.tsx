import { notFound } from 'next/navigation'
import { createClient } from '@/services/supabase/server'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SopDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: sop } = await supabase
    .from('sops')
    .select('id, title, current_version_id')
    .eq('id', id)
    .single()

  if (!sop) {
    notFound()
  }

  const { data: version } = sop.current_version_id
    ? await supabase
        .from('sop_versions')
        .select('version_number, steps, published_at')
        .eq('id', sop.current_version_id)
        .single()
    : { data: null }

  return (
    <section className="max-w-xl">
      <p className="eyebrow mb-2">SOP</p>
      <h1 className="display mb-2 text-2xl text-ink">{sop.title}</h1>
      {version && <p className="eyebrow mb-10 text-stone">Version {version.version_number}</p>}

      {version ? (
        <ol className="space-y-4">
          {(version.steps as string[]).map((step, index) => (
            <li key={index} className="flex gap-4 border-t hairline pt-4">
              <span className="data text-stone">{String(index + 1).padStart(2, '0')}</span>
              <span className="text-ink-soft">{step}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-stone">This SOP has no published version yet.</p>
      )}
    </section>
  )
}
