import type {
  ScoringWeights,
  SessionSnapshot,
  SimulationDefinition,
  StepOutcome,
} from './types'
import { DEFAULT_WEIGHTS } from './types'
import { accumulate, addDeltas, computeResult, ZERO_DELTAS } from './scoring'
import { assertValidDefinition } from './validate'

export class SimulationEngineError extends Error {
  constructor(
    public readonly code:
      | 'SESSION_NOT_IN_PROGRESS'
      | 'STATE_NOT_FOUND'
      | 'CHOICE_NOT_FOUND'
      | 'STATE_IS_TERMINAL',
    message: string
  ) {
    super(message)
    this.name = 'SimulationEngineError'
  }
}

/**
 * Creates a fresh session snapshot at the definition's entry state.
 * Validates the definition first: a structurally broken definition
 * must fail at session start, not mid-play.
 */
export function createSession(
  definition: SimulationDefinition,
  sessionId: string
): SessionSnapshot {
  assertValidDefinition(definition)

  return {
    sessionId,
    simulationId: definition.id,
    currentStateId: definition.entryStateId,
    status: 'in_progress',
    events: [],
    cumulative: ZERO_DELTAS,
  }
}

/**
 * Evaluates one user decision. Pure function: returns a new snapshot,
 * never mutates the input. The caller persists the outcome.
 */
export function step(
  definition: SimulationDefinition,
  session: SessionSnapshot,
  choiceId: string,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
  now: () => string = () => new Date().toISOString()
): StepOutcome {
  if (session.status !== 'in_progress') {
    throw new SimulationEngineError(
      'SESSION_NOT_IN_PROGRESS',
      `Session ${session.sessionId} has status ${session.status}`
    )
  }

  const currentState = definition.states[session.currentStateId]
  if (!currentState) {
    throw new SimulationEngineError(
      'STATE_NOT_FOUND',
      `State ${session.currentStateId} not found in definition ${definition.id}`
    )
  }

  if (currentState.isTerminal) {
    throw new SimulationEngineError(
      'STATE_IS_TERMINAL',
      `State ${currentState.id} is terminal, no further choices allowed`
    )
  }

  const choice = currentState.choices.find((candidate) => candidate.id === choiceId)
  if (!choice) {
    throw new SimulationEngineError(
      'CHOICE_NOT_FOUND',
      `Choice ${choiceId} is not available in state ${currentState.id}`
    )
  }

  const nextState = definition.states[choice.nextStateId]
  if (!nextState) {
    throw new SimulationEngineError(
      'STATE_NOT_FOUND',
      `Next state ${choice.nextStateId} not found in definition ${definition.id}`
    )
  }

  const event = {
    stateId: currentState.id,
    choiceId: choice.id,
    deltas: choice.deltas,
    occurredAt: now(),
  }

  const cumulative = addDeltas(session.cumulative, choice.deltas)
  const isComplete = nextState.isTerminal

  const nextSession: SessionSnapshot = {
    ...session,
    currentStateId: nextState.id,
    status: isComplete ? 'completed' : 'in_progress',
    events: [...session.events, event],
    cumulative,
  }

  return {
    session: nextSession,
    reaction: choice.guestReaction,
    nextState,
    isComplete,
    result: isComplete ? computeResult(cumulative, weights) : null,
  }
}

/**
 * Recomputes a session's cumulative score from its event log.
 * Used server-side to verify a client-reported result: the event log
 * is the source of truth, never the client's cumulative figure.
 */
export function replaySession(
  definition: SimulationDefinition,
  session: SessionSnapshot,
  weights: ScoringWeights = DEFAULT_WEIGHTS
) {
  const cumulative = accumulate(session.events)
  return computeResult(cumulative, weights)
}
