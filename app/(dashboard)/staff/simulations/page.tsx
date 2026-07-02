import Link from 'next/link'
import { createClient } from '@/services/supabase/server'

const TYPE_LABEL: Record<string, string> = {
  in_room_dining: 'In-Room Dining',
  concierge: 'Concierge',
  housekeeping: 'Housekeeping',
  front_office: 'Front Office',
  butler_service: 'Butler Service',
  complaint_recovery: 'Complaint Recovery',
  vip_scenario: 'VIP Scenario',
}

export default async function StaffSimulationsPage() {
  const supabase = await createClient()
  const { data: simulations } = await supabase
    .from('simulations')
    .select('id, title, type, difficulty')
    .eq('status', 'published')
    .order('title', { ascending: true })

  return (
    <section>
      <p className="eyebrow mb-2">Simulations</p>
      <h1 className="display mb-8 text-2xl text-ink">Choose a scenario</h1>

      {!simulations || simulations.length === 0 ? (
        <p className="text-stone">
          No simulations are published for your property yet. Check back once your administrator
          has added one.
        </p>
      ) : (
        <ol>
          {simulations.map((simulation) => (
            <li key={simulation.id} className="border-t hairline">
              <Link
                href={`/staff/simulations/${simulation.id}`}
                className="flex items-baseline justify-between gap-4 py-4 transition-colors hover:text-brass"
              >
                <span className="text-ink-soft">{simulation.title}</span>
                <span className="eyebrow shrink-0">
                  {TYPE_LABEL[simulation.type] ?? simulation.type} · {simulation.difficulty}
                </span>
              </Link>
            </li>
          ))}
          <li className="border-t hairline" aria-hidden="true" />
        </ol>
      )}
    </section>
  )
}
