import { QueryClient } from '@tanstack/react-query'

/**
 * Cache policy by data volatility, not one global default.
 * Keys are namespaced by domain: ['courses', ...], ['session', id], etc.
 */
export const STALE_TIMES = {
  // Authored content changes rarely; a CMS publish invalidates explicitly.
  courses: 5 * 60 * 1000,
  simulations: 5 * 60 * 1000,
  sops: 5 * 60 * 1000,
  // Own progress and scores: fresh enough to feel live, cached enough to
  // avoid refetch storms while navigating.
  progress: 30 * 1000,
  competencies: 60 * 1000,
  // Session state is server-authoritative per step; never cache-served.
  session: 0,
  // Manager analytics read a materialised rollup refreshed on a schedule,
  // so client cache can be generous.
  analytics: 5 * 60 * 1000,
} as const

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  })
}
