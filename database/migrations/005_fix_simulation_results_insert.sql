-- =============================================================================
-- CHOSEN WORKFLOW LXP - FIX MISSING INSERT POLICY
-- Migration: 005_fix_simulation_results_insert.sql
--
-- 001_initial_schema.sql defined simulation_results_select but never a
-- matching insert policy. With RLS enabled and no insert policy, every
-- session completion silently failed at the final save (discovered via
-- live testing: 42501 row-level security violation). This adds the
-- missing policy, matching the ownership pattern already used for
-- simulation_sessions and simulation_session_events.
-- =============================================================================

create policy simulation_results_insert_self on simulation_results
  for insert with check (
    session_id in (select id from simulation_sessions where user_id = auth.uid())
  );
