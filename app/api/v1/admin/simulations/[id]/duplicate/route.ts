import { NextResponse } from 'next/server'
import { handle, ok, requireUser, ApiError, requireAdminSupabase } from '@/app/api/v1/_lib/api-helpers'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/v1/admin/simulations/:id/duplicate
 * Clones the simulation, its states, and its choices as a new draft.
 * State IDs are remapped so choices point at the new states, not the
 * originals. RLS on simulations/simulation_states/simulation_choices
 * already allows admin inserts as of migration 006, no new policy needed.
 */
export async function POST(_request: Request, { params }: RouteParams): Promise<NextResponse> {
  return handle(async () => {
    const { userId } = await requireUser()
    const supabase = await requireAdminSupabase(userId)
    const { id: sourceId } = await params

    const { data: source, error: sourceError } = await supabase
      .from('simulations')
      .select('title, type, difficulty, hotel_group_id, entry_state_id')
      .eq('id', sourceId)
      .single()

    if (sourceError || !source) {
      throw new ApiError('NOT_FOUND', 'Simulation not found', 404)
    }

    const { data: states, error: statesError } = await supabase
      .from('simulation_states')
      .select('id, name, guest_context, is_terminal')
      .eq('simulation_id', sourceId)

    if (statesError) {
      throw new ApiError('INTERNAL_ERROR', `Failed to read states: ${statesError.message}`, 500)
    }

    const { data: choices, error: choicesError } =
      (states ?? []).length > 0
        ? await supabase
            .from('simulation_choices')
            .select(
              'state_id, label, next_state_id, forbes_delta, lqa_delta, sop_delta, ei_delta, sop_reference_id, guest_reaction'
            )
            .in(
              'state_id',
              (states ?? []).map((s) => s.id)
            )
        : { data: [], error: null }

    if (choicesError) {
      throw new ApiError('INTERNAL_ERROR', `Failed to read choices: ${choicesError.message}`, 500)
    }

    const { data: newSimulation, error: newSimError } = await supabase
      .from('simulations')
      .insert({
        hotel_group_id: source.hotel_group_id,
        title: `${source.title} (Copy)`,
        type: source.type,
        difficulty: source.difficulty,
        status: 'draft',
      })
      .select('id, title, status')
      .single()

    if (newSimError || !newSimulation) {
      throw new ApiError('INTERNAL_ERROR', `Failed to create copy: ${newSimError?.message}`, 500)
    }

    const idMap = new Map<string, string>()

    for (const state of states ?? []) {
      const { data: newState, error: newStateError } = await supabase
        .from('simulation_states')
        .insert({
          simulation_id: newSimulation.id,
          name: state.name,
          guest_context: state.guest_context,
          is_terminal: state.is_terminal,
        })
        .select('id')
        .single()

      if (newStateError || !newState) {
        throw new ApiError(
          'INTERNAL_ERROR',
          `Failed to copy state "${state.name}": ${newStateError?.message}`,
          500
        )
      }
      idMap.set(state.id, newState.id)
    }

    for (const choice of choices ?? []) {
      const newStateId = idMap.get(choice.state_id)
      const newNextStateId = idMap.get(choice.next_state_id)
      if (!newStateId || !newNextStateId) continue

      const { error: newChoiceError } = await supabase.from('simulation_choices').insert({
        state_id: newStateId,
        label: choice.label,
        next_state_id: newNextStateId,
        forbes_delta: choice.forbes_delta,
        lqa_delta: choice.lqa_delta,
        sop_delta: choice.sop_delta,
        ei_delta: choice.ei_delta,
        sop_reference_id: choice.sop_reference_id,
        guest_reaction: choice.guest_reaction,
      })

      if (newChoiceError) {
        throw new ApiError(
          'INTERNAL_ERROR',
          `Failed to copy choice "${choice.label}": ${newChoiceError.message}`,
          500
        )
      }
    }

    if (source.entry_state_id) {
      const newEntryStateId = idMap.get(source.entry_state_id)
      if (newEntryStateId) {
        await supabase
          .from('simulations')
          .update({ entry_state_id: newEntryStateId })
          .eq('id', newSimulation.id)
      }
    }

    return ok(newSimulation, 201)
  })
}
