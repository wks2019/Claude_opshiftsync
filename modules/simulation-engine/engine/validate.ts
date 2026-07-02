import type { SimulationDefinition } from './types'

export interface ValidationIssue {
  code:
    | 'MISSING_ENTRY_STATE'
    | 'UNKNOWN_NEXT_STATE'
    | 'TERMINAL_WITH_CHOICES'
    | 'NON_TERMINAL_WITHOUT_CHOICES'
    | 'UNREACHABLE_STATE'
    | 'NO_TERMINAL_STATE'
  message: string
  stateId?: string
  choiceId?: string
}

/**
 * Validates the structural integrity of a simulation definition.
 * A definition failing any check must not be published or played.
 */
export function validateDefinition(definition: SimulationDefinition): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const states = definition.states

  if (!states[definition.entryStateId]) {
    issues.push({
      code: 'MISSING_ENTRY_STATE',
      message: `Entry state ${definition.entryStateId} does not exist`,
    })
  }

  let hasTerminal = false

  for (const state of Object.values(states)) {
    if (state.isTerminal) {
      hasTerminal = true
      if (state.choices.length > 0) {
        issues.push({
          code: 'TERMINAL_WITH_CHOICES',
          message: `Terminal state ${state.id} must not have choices`,
          stateId: state.id,
        })
      }
    } else if (state.choices.length === 0) {
      issues.push({
        code: 'NON_TERMINAL_WITHOUT_CHOICES',
        message: `Non-terminal state ${state.id} has no choices, session would dead-end`,
        stateId: state.id,
      })
    }

    for (const choice of state.choices) {
      if (!states[choice.nextStateId]) {
        issues.push({
          code: 'UNKNOWN_NEXT_STATE',
          message: `Choice ${choice.id} points to unknown state ${choice.nextStateId}`,
          stateId: state.id,
          choiceId: choice.id,
        })
      }
    }
  }

  if (!hasTerminal) {
    issues.push({
      code: 'NO_TERMINAL_STATE',
      message: 'Definition has no terminal state, sessions could never complete',
    })
  }

  // Reachability: BFS from entry state.
  const reachable = new Set<string>()
  const queue: string[] = states[definition.entryStateId] ? [definition.entryStateId] : []

  while (queue.length > 0) {
    const stateId = queue.shift() as string
    if (reachable.has(stateId)) continue
    reachable.add(stateId)

    const state = states[stateId]
    if (!state) continue

    for (const choice of state.choices) {
      if (states[choice.nextStateId] && !reachable.has(choice.nextStateId)) {
        queue.push(choice.nextStateId)
      }
    }
  }

  for (const stateId of Object.keys(states)) {
    if (!reachable.has(stateId)) {
      issues.push({
        code: 'UNREACHABLE_STATE',
        message: `State ${stateId} is unreachable from the entry state`,
        stateId,
      })
    }
  }

  return issues
}

export function assertValidDefinition(definition: SimulationDefinition): void {
  const issues = validateDefinition(definition)
  if (issues.length > 0) {
    const summary = issues.map((issue) => issue.message).join('; ')
    throw new Error(`Invalid simulation definition: ${summary}`)
  }
}
