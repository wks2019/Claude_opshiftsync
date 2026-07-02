import { describe, expect, it } from 'vitest'
import { createSession, replaySession, SimulationEngineError, step } from '../engine/state-machine'
import { computeResult, assertValidWeights } from '../engine/scoring'
import { validateDefinition } from '../engine/validate'
import type { SimulationDefinition } from '../engine/types'

function buildDefinition(): SimulationDefinition {
  return {
    id: 'sim-1',
    title: 'Test Simulation',
    type: 'in_room_dining',
    difficulty: 'standard',
    entryStateId: 'state-1',
    states: {
      'state-1': {
        id: 'state-1',
        name: 'Guest calls',
        guestContext: { mood: 'neutral', request: 'Order breakfast' },
        isTerminal: false,
        choices: [
          {
            id: 'choice-good',
            label: 'Warm greeting with name',
            nextStateId: 'state-2',
            deltas: { forbes: 50, lqa: 40, sop: 50, ei: 60 },
            guestReaction: { dialogue: 'Lovely, thank you.', moodShift: 'pleased' },
          },
          {
            id: 'choice-bad',
            label: 'Abrupt response',
            nextStateId: 'state-2',
            deltas: { forbes: 10, lqa: 5, sop: 10, ei: 0 },
            guestReaction: { dialogue: 'Right...', moodShift: 'impatient' },
          },
        ],
      },
      'state-2': {
        id: 'state-2',
        name: 'Delivery',
        guestContext: { mood: 'neutral', request: 'Awaiting delivery' },
        isTerminal: false,
        choices: [
          {
            id: 'choice-finish',
            label: 'Deliver with full setup',
            nextStateId: 'state-3',
            deltas: { forbes: 50, lqa: 60, sop: 50, ei: 40 },
            guestReaction: { dialogue: 'Wonderful.', moodShift: 'delighted' },
          },
        ],
      },
      'state-3': {
        id: 'state-3',
        name: 'Complete',
        guestContext: { mood: 'delighted', request: '' },
        isTerminal: true,
        choices: [],
      },
    },
  }
}

describe('validateDefinition', () => {
  it('passes a well-formed definition', () => {
    expect(validateDefinition(buildDefinition())).toEqual([])
  })

  it('flags unknown next states', () => {
    const definition = buildDefinition()
    definition.states['state-1'].choices[0].nextStateId = 'ghost-state'
    const issues = validateDefinition(definition)
    expect(issues.some((issue) => issue.code === 'UNKNOWN_NEXT_STATE')).toBe(true)
  })

  it('flags missing terminal state', () => {
    const definition = buildDefinition()
    definition.states['state-3'].isTerminal = false
    const issues = validateDefinition(definition)
    expect(issues.some((issue) => issue.code === 'NO_TERMINAL_STATE')).toBe(true)
  })

  it('flags unreachable states', () => {
    const definition = buildDefinition()
    definition.states['orphan'] = {
      id: 'orphan',
      name: 'Orphan',
      guestContext: { mood: 'neutral', request: '' },
      isTerminal: true,
      choices: [],
    }
    const issues = validateDefinition(definition)
    expect(issues.some((issue) => issue.code === 'UNREACHABLE_STATE' && issue.stateId === 'orphan')).toBe(true)
  })
})

describe('createSession', () => {
  it('starts at the entry state with zero score', () => {
    const session = createSession(buildDefinition(), 'session-1')
    expect(session.currentStateId).toBe('state-1')
    expect(session.status).toBe('in_progress')
    expect(session.cumulative).toEqual({ forbes: 0, lqa: 0, sop: 0, ei: 0 })
  })

  it('rejects invalid definitions', () => {
    const definition = buildDefinition()
    definition.entryStateId = 'missing'
    expect(() => createSession(definition, 'session-1')).toThrow(/Invalid simulation definition/)
  })
})

describe('step', () => {
  it('applies deltas, records event, moves to next state', () => {
    const definition = buildDefinition()
    const session = createSession(definition, 'session-1')

    const outcome = step(definition, session, 'choice-good')

    expect(outcome.session.currentStateId).toBe('state-2')
    expect(outcome.session.events).toHaveLength(1)
    expect(outcome.session.cumulative.forbes).toBe(50)
    expect(outcome.reaction.moodShift).toBe('pleased')
    expect(outcome.isComplete).toBe(false)
    expect(outcome.result).toBeNull()
  })

  it('does not mutate the input session', () => {
    const definition = buildDefinition()
    const session = createSession(definition, 'session-1')
    step(definition, session, 'choice-good')
    expect(session.events).toHaveLength(0)
    expect(session.currentStateId).toBe('state-1')
  })

  it('completes on reaching a terminal state and returns weighted result', () => {
    const definition = buildDefinition()
    let session = createSession(definition, 'session-1')
    session = step(definition, session, 'choice-good').session

    const outcome = step(definition, session, 'choice-finish')

    expect(outcome.isComplete).toBe(true)
    expect(outcome.session.status).toBe('completed')
    expect(outcome.result).not.toBeNull()
    // forbes 100 * .35 + lqa 100 * .30 + sop 100 * .25 + ei 100 * .10 = 100
    expect(outcome.result?.finalScore).toBe(100)
  })

  it('rejects choices not offered by the current state', () => {
    const definition = buildDefinition()
    const session = createSession(definition, 'session-1')
    expect(() => step(definition, session, 'choice-finish')).toThrow(SimulationEngineError)
  })

  it('rejects steps on completed sessions', () => {
    const definition = buildDefinition()
    let session = createSession(definition, 'session-1')
    session = step(definition, session, 'choice-good').session
    session = step(definition, session, 'choice-finish').session
    expect(() => step(definition, session, 'choice-finish')).toThrow(/has status completed/)
  })
})

describe('scoring', () => {
  it('clamps dimensions into 0-100', () => {
    const result = computeResult({ forbes: 150, lqa: -20, sop: 50, ei: 50 })
    expect(result.forbesScore).toBe(100)
    expect(result.lqaScore).toBe(0)
  })

  it('applies default 35/30/25/10 weighting', () => {
    const result = computeResult({ forbes: 80, lqa: 60, sop: 40, ei: 100 })
    // 80*.35 + 60*.30 + 40*.25 + 100*.10 = 28 + 18 + 10 + 10 = 66
    expect(result.finalScore).toBe(66)
  })

  it('rejects weights that do not sum to 1', () => {
    expect(() => assertValidWeights({ forbes: 0.5, lqa: 0.5, sop: 0.5, ei: 0.5 })).toThrow(
      /must sum to 1/
    )
  })
})

describe('replaySession', () => {
  it('recomputes result from the event log, ignoring the stored cumulative', () => {
    const definition = buildDefinition()
    let session = createSession(definition, 'session-1')
    session = step(definition, session, 'choice-good').session
    session = step(definition, session, 'choice-finish').session

    // Tamper with the client-reported cumulative
    const tampered = { ...session, cumulative: { forbes: 999, lqa: 999, sop: 999, ei: 999 } }

    const result = replaySession(definition, tampered)
    expect(result.finalScore).toBe(100)
  })
})
