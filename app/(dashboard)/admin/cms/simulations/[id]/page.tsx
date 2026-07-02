import { notFound } from 'next/navigation'
import { createClient } from '@/services/supabase/server'
import { SimulationEditor } from '@/components/simulation-editor'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SimulationEditPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: simulation } = await supabase
    .from('simulations')
    .select('id, title, status, entry_state_id')
    .eq('id', id)
    .single()

  if (!simulation) {
    notFound()
  }

  const { data: states } = await supabase
    .from('simulation_states')
    .select('id, name, is_terminal')
    .eq('simulation_id', id)
    .order('name', { ascending: true })

  const stateIds = (states ?? []).map((s) => s.id)

  const { data: choices } =
    stateIds.length > 0
      ? await supabase
          .from('simulation_choices')
          .select('id, state_id, label, next_state_id')
          .in('state_id', stateIds)
      : { data: [] }

  return (
    <section className="max-w-xl">
      <p className="eyebrow mb-2">Simulation</p>
      <h1 className="display mb-10 text-2xl text-ink">{simulation.title}</h1>

      <SimulationEditor
        simulationId={simulation.id}
        status={simulation.status}
        entryStateId={simulation.entry_state_id}
        states={states ?? []}
        choices={choices ?? []}
      />
    </section>
  )
}
