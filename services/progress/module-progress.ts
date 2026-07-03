import { createClient } from '@/services/supabase/server'

export type ModuleProgress = {
  course_module_id: string
  course_id: string
  title: string
  sequence: number
  total_lessons: number
  completed_lessons: number
  percent_complete: number
  status: 'not_started' | 'in_progress' | 'completed'
}

/**
 * Returns completion percent per module for the current authenticated user.
 * Scoped server-side by get_module_progress() to their hotel_group_id and
 * auth.uid(). Requires migration 015_module_progress.sql to be applied.
 */
export async function getModuleProgress(): Promise<ModuleProgress[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_module_progress')

  if (error) {
    throw new Error(`getModuleProgress failed: ${error.message}`)
  }

  return (data ?? []) as ModuleProgress[]
}
