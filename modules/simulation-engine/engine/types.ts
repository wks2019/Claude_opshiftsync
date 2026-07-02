/**
 * Core simulation engine types.
 * This module has no framework or database dependencies.
 */

export type SimulationType =
  | 'in_room_dining'
  | 'concierge'
  | 'housekeeping'
  | 'front_office'
  | 'butler_service'
  | 'complaint_recovery'
  | 'vip_scenario'

export type Difficulty = 'standard' | 'advanced' | 'vip'

export type GuestMood =
  | 'delighted'
  | 'pleased'
  | 'neutral'
  | 'impatient'
  | 'frustrated'
  | 'angry'

export interface GuestContext {
  mood: GuestMood
  request: string
  backstory?: string
}

export interface GuestReaction {
  dialogue: string
  moodShift: GuestMood
}

export interface ScoreDeltas {
  forbes: number
  lqa: number
  sop: number
  ei: number
}

export interface SimulationChoice {
  id: string
  label: string
  nextStateId: string
  deltas: ScoreDeltas
  sopReferenceId?: string
  guestReaction: GuestReaction
}

export interface SimulationState {
  id: string
  name: string
  guestContext: GuestContext
  isTerminal: boolean
  choices: SimulationChoice[]
}

export interface SimulationDefinition {
  id: string
  title: string
  type: SimulationType
  difficulty: Difficulty
  entryStateId: string
  states: Record<string, SimulationState>
}

export interface SessionEvent {
  stateId: string
  choiceId: string
  deltas: ScoreDeltas
  occurredAt: string
}

export type SessionStatus = 'in_progress' | 'completed' | 'abandoned'

export interface SessionSnapshot {
  sessionId: string
  simulationId: string
  currentStateId: string
  status: SessionStatus
  events: SessionEvent[]
  cumulative: ScoreDeltas
}

export interface ScoringWeights {
  forbes: number
  lqa: number
  sop: number
  ei: number
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  forbes: 0.35,
  lqa: 0.3,
  sop: 0.25,
  ei: 0.1,
}

export interface SimulationResult {
  forbesScore: number
  lqaScore: number
  sopScore: number
  eiScore: number
  finalScore: number
}

export interface StepOutcome {
  session: SessionSnapshot
  reaction: GuestReaction
  nextState: SimulationState
  isComplete: boolean
  result: SimulationResult | null
}
