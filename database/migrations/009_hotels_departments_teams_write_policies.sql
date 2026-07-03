-- =============================================================================
-- CHOSEN WORKFLOW LXP - HOTELS, DEPARTMENTS, TEAMS WRITE POLICIES
-- Migration: 009_hotels_departments_teams_write_policies.sql
--
-- Same recurring gap as 006 and 008. hotels, departments, and teams
-- shipped with select-only policies in 001_initial_schema.sql. Found
-- while building the Hotels management UI (RC1 Section 4.2).
-- =============================================================================

drop policy if exists hotels_insert on hotels;
create policy hotels_insert on hotels
  for insert with check (
    hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator')
  );

drop policy if exists hotels_update on hotels;
create policy hotels_update on hotels
  for update using (
    hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator')
  );

drop policy if exists hotels_delete on hotels;
create policy hotels_delete on hotels
  for delete using (
    hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator')
  );

drop policy if exists departments_insert on departments;
create policy departments_insert on departments
  for insert with check (
    hotel_id in (
      select id from hotels
      where hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator')
    )
  );

drop policy if exists departments_update on departments;
create policy departments_update on departments
  for update using (
    hotel_id in (
      select id from hotels
      where hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator')
    )
  );

drop policy if exists departments_delete on departments;
create policy departments_delete on departments
  for delete using (
    hotel_id in (
      select id from hotels
      where hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator')
    )
  );

drop policy if exists teams_insert on teams;
create policy teams_insert on teams
  for insert with check (
    department_id in (
      select d.id from departments d
      join hotels h on h.id = d.hotel_id
      where h.hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator')
    )
  );

drop policy if exists teams_update on teams;
create policy teams_update on teams
  for update using (
    department_id in (
      select d.id from departments d
      join hotels h on h.id = d.hotel_id
      where h.hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator')
    )
  );

drop policy if exists teams_delete on teams;
create policy teams_delete on teams
  for delete using (
    department_id in (
      select d.id from departments d
      join hotels h on h.id = d.hotel_id
      where h.hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator')
    )
  );
