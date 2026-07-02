-- =============================================================================
-- CHOSEN WORKFLOW LXP - HOTEL GROUP WRITE POLICY
-- Migration: 007_hotel_group_update_policy.sql
--
-- Same recurring gap found again while building the admin Property page:
-- hotel_groups had only a select policy, no update. Fourth instance of
-- this exact class of miss from the original schema (simulation_results,
-- sops/sop_versions, simulations/states/choices, now hotel_groups).
-- =============================================================================

create policy hotel_groups_update on hotel_groups
  for update using (id = auth_hotel_group_id() and auth_has_role('administrator'));
