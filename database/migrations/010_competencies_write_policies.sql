-- =============================================================================
-- CHOSEN WORKFLOW LXP - COMPETENCIES WRITE POLICIES
-- Migration: 010_competencies_write_policies.sql
--
-- Same recurring gap as 006, 008, 009. competencies shipped select-only.
-- standard_weights already has insert and update policies from
-- 001_initial_schema.sql, no change needed there. Found while building
-- the Competencies management UI (RC1 Section 4.3).
-- =============================================================================

drop policy if exists competencies_insert on competencies;
create policy competencies_insert on competencies
  for insert with check (
    hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator')
  );

drop policy if exists competencies_update on competencies;
create policy competencies_update on competencies
  for update using (
    hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator')
  );

drop policy if exists competencies_delete on competencies;
create policy competencies_delete on competencies
  for delete using (
    hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator')
  );
