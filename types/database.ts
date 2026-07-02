/**
 * Placeholder until the first migration is pushed to a live Supabase
 * project. Regenerate with: npm run db:types
 *
 * Supabase clients are typed against this file; an untyped `any` here
 * would silently defeat that type safety, so it stays minimal and
 * explicit rather than falling back to a blanket `any`.
 */
export type Database = {
  public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
