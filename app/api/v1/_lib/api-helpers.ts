import 'server-only'
import { NextResponse } from 'next/server'
import { ZodError, type ZodSchema } from 'zod'
import { createClient } from '@/services/supabase/server'
import { SimulationEngineError } from '@/modules/simulation-engine/engine/state-machine'

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'SESSION_NOT_IN_PROGRESS'
  | 'STATE_NOT_FOUND'
  | 'CHOICE_NOT_FOUND'
  | 'STATE_IS_TERMINAL'
  | 'INTERNAL_ERROR'

export class ApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly status: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status })
}

export function fail(code: ApiErrorCode, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status })
}

const ENGINE_ERROR_STATUS: Record<string, number> = {
  SESSION_NOT_IN_PROGRESS: 409,
  STATE_NOT_FOUND: 404,
  CHOICE_NOT_FOUND: 400,
  STATE_IS_TERMINAL: 409,
}

/**
 * Central error mapper. Every route handler wraps its body in this.
 * Unknown errors are logged server-side and returned as an opaque 500.
 */
export async function handle(fn: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await fn()
  } catch (error) {
    if (error instanceof ApiError) {
      return fail(error.code, error.message, error.status)
    }
    if (error instanceof SimulationEngineError) {
      return fail(error.code, error.message, ENGINE_ERROR_STATUS[error.code] ?? 400)
    }
    if (error instanceof ZodError) {
      const message = error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')
      return fail('VALIDATION_ERROR', message, 400)
    }
    console.error('Unhandled API error', error)
    return fail('INTERNAL_ERROR', 'An unexpected error occurred', 500)
  }
}

export async function parseBody<T>(request: Request, schema: ZodSchema<T>): Promise<T> {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    throw new ApiError('VALIDATION_ERROR', 'Request body must be valid JSON', 400)
  }
  return schema.parse(raw)
}

export interface AuthContext {
  userId: string
}

/**
 * Resolves the authenticated user. Middleware already gates routes,
 * but handlers re-check so a route is safe even if the matcher drifts.
 */
export async function requireUser(): Promise<AuthContext> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new ApiError('UNAUTHENTICATED', 'Authentication required', 401)
  }
  return { userId: user.id }
}
