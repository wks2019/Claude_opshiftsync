-- =============================================================================
-- CHOSEN WORKFLOW LXP - SOP WRITE POLICIES
-- Migration: 006_sop_write_policies.sql
--
-- 001_initial_schema.sql added sops_select and sops_write (insert) but no
-- update policy, and sop_versions had only a select policy with no insert
-- at all. Found before building the SOP CMS on top of these tables,
-- the same class of gap as simulation_results earlier this session.
-- =============================================================================

create policy sops_update on sops
  for update using (hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator'));

create policy sop_versions_insert on sop_versions
  for insert with check (
    sop_id in (
      select id from sops
      where hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator')
    )
  );

-- Same gap, found again while building simulation authoring: simulations
-- had select+insert but no update, and simulation_states/simulation_choices
-- had only select, no insert at all.

create policy simulations_update on simulations
  for update using (hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator'));

create policy simulation_states_insert on simulation_states
  for insert with check (
    simulation_id in (
      select id from simulations
      where hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator')
    )
  );

create policy simulation_choices_insert on simulation_choices
  for insert with check (
    state_id in (
      select ss.id from simulation_states ss
      join simulations s on s.id = ss.simulation_id
      where s.hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator')
    )
  );
