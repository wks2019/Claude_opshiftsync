import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/services/supabase/server'
import { loadDefinition, createSessionRow } from '@/modules/simulation-engine/services/session-service'
import { createSession } from '@/modules/simulation-engine/engine/state-machine'
import { SimulationPlayer } from '@/modules/simulation-engine/components/simulation-player'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SimulationSessionPage({ params }: PageProps) {
  const { id: simulationId } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const definition = await loadDefinition(simulationId).catch(() => null)
  if (!definition) {
    notFound()
  }

  // createSession validates the definition (throws on structural issues)
  // before a session row is ever created; its returned snapshot itself is
  // not needed here, the client player drives state via /step from here on.
  createSession(definition, 'pending')

  const sessionId = await createSessionRow(simulationId, definition.entryStateId, user.id)
  const entryState = definition.states[definition.entryStateId]

  if (!entryState) {
    notFound()
  }

  return (
    <SimulationPlayer
      sessionId={sessionId}
      title={definition.title}
      initialState={{
        id: entryState.id,
        name: entryState.name,
        guestContext: entryState.guestContext,
        choices: entryState.choices.map((choice) => ({ id: choice.id, label: choice.label })),
      }}
    />
  )
}
