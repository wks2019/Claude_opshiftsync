-- =============================================================================
-- CHOSEN WORKFLOW LXP - COMPETENCY SCORES WRITE POLICY
-- Migration: 015_competency_scores_write_policy.sql
--
-- competency_scores shipped with select-only policies. The auto-scoring
-- system writes scores on simulation completion, running as the
-- completing user's session, so the insert policy checks user_id = uid.
-- =============================================================================

create policy competency_scores_insert on competency_scores
  for insert with check (user_id = auth.uid());
