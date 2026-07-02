import type {
  ScoreDeltas,
  ScoringWeights,
  SessionEvent,
  SimulationResult,
} from './types'
import { DEFAULT_WEIGHTS } from './types'

export const ZERO_DELTAS: ScoreDeltas = { forbes: 0, lqa: 0, sop: 0, ei: 0 }

export function addDeltas(a: ScoreDeltas, b: ScoreDeltas): ScoreDeltas {
  return {
    forbes: a.forbes + b.forbes,
    lqa: a.lqa + b.lqa,
    sop: a.sop + b.sop,
    ei: a.ei + b.ei,
  }
}

export function accumulate(events: SessionEvent[]): ScoreDeltas {
  return events.reduce((total, event) => addDeltas(total, event.deltas), ZERO_DELTAS)
}

/**
 * Clamps a raw cumulative score into the 0-100 band.
 * Choice deltas are authored on a 0-100 scale per dimension across an
 * optimal path, so the clamp only guards against authoring drift.
 */
function clamp(value: number): number {
  return Math.min(100, Math.max(0, value))
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Weights must describe a complete distribution. Tenant-configured weights
 * from the Standards Engine are validated here at the point of use, so a
 * misconfigured tenant cannot silently deflate or inflate scores.
 */
export function assertValidWeights(weights: ScoringWeights): void {
  const sum = weights.forbes + weights.lqa + weights.sop + weights.ei
  if (Math.abs(sum - 1) > 0.0001) {
    throw new Error(`Scoring weights must sum to 1, received ${sum}`)
  }
  for (const [key, value] of Object.entries(weights)) {
    if (value < 0) {
      throw new Error(`Scoring weight ${key} must not be negative`)
    }
  }
}

export function computeResult(
  cumulative: ScoreDeltas,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): SimulationResult {
  assertValidWeights(weights)

  const forbesScore = clamp(cumulative.forbes)
  const lqaScore = clamp(cumulative.lqa)
  const sopScore = clamp(cumulative.sop)
  const eiScore = clamp(cumulative.ei)

  const finalScore = round2(
    forbesScore * weights.forbes +
      lqaScore * weights.lqa +
      sopScore * weights.sop +
      eiScore * weights.ei
  )

  return {
    forbesScore: round2(forbesScore),
    lqaScore: round2(lqaScore),
    sopScore: round2(sopScore),
    eiScore: round2(eiScore),
    finalScore,
  }
}
