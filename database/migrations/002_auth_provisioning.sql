-- =============================================================================
-- CHOSEN WORKFLOW LXP - AUTH PROVISIONING
-- Migration: 002_auth_provisioning.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Auto-provision public.users on auth.users insert.
-- Invite metadata (hotel_group_id, hotel_id, department_id, team_id, full_name, role)
-- is passed via raw_user_meta_data at invite time.
-- -----------------------------------------------------------------------------

create or replace function handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := new.raw_user_meta_data;
  resolved_role_id uuid;
begin
  insert into public.users (id, hotel_group_id, hotel_id, department_id, team_id, full_name, email, status)
  values (
    new.id,
    (meta->>'hotel_group_id')::uuid,
    nullif(meta->>'hotel_id', '')::uuid,
    nullif(meta->>'department_id', '')::uuid,
    nullif(meta->>'team_id', '')::uuid,
    coalesce(meta->>'full_name', new.email),
    new.email,
    'invited'
  );

  select id into resolved_role_id
  from public.roles
  where name = coalesce(meta->>'role', 'staff');

  if resolved_role_id is not null then
    insert into public.user_roles (user_id, role_id)
    values (new.id, resolved_role_id);
  end if;

  return new;
end;
$$;

create trigger trg_handle_new_auth_user
after insert on auth.users
for each row execute function handle_new_auth_user();

-- -----------------------------------------------------------------------------
-- Flip status from 'invited' to 'active' on first successful login.
-- -----------------------------------------------------------------------------

create or replace function activate_user_on_first_login()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.last_sign_in_at is null and new.last_sign_in_at is not null then
    update public.users set status = 'active' where id = new.id and status = 'invited';
  end if;
  return new;
end;
$$;

create trigger trg_activate_user_on_first_login
after update on auth.users
for each row execute function activate_user_on_first_login();

-- -----------------------------------------------------------------------------
-- Custom access token hook.
-- Embeds app_role and app_hotel_group_id into the JWT for client/middleware
-- convenience only. Not used as an authorization source by RLS policies.
-- Must be registered in Supabase Auth config (see config.toml note below).
-- -----------------------------------------------------------------------------

create or replace function custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  resolved_hotel_group_id uuid;
  resolved_role text;
begin
  select hotel_group_id into resolved_hotel_group_id
  from public.users
  where id = (event->>'user_id')::uuid;

  select r.name into resolved_role
  from public.user_roles ur
  join public.roles r on r.id = ur.role_id
  where ur.user_id = (event->>'user_id')::uuid
  limit 1;

  claims := coalesce(event->'claims', '{}'::jsonb);
  claims := jsonb_set(claims, '{app_hotel_group_id}', to_jsonb(resolved_hotel_group_id));
  claims := jsonb_set(claims, '{app_role}', to_jsonb(coalesce(resolved_role, 'staff')));

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

-- Only the auth admin role may invoke this hook. Never grant to authenticated/anon.
revoke execute on function custom_access_token_hook(jsonb) from authenticated, anon, public;
grant execute on function custom_access_token_hook(jsonb) to supabase_auth_admin;

-- -----------------------------------------------------------------------------
-- Registration note (not executed by this migration):
-- In supabase/config.toml:
--
-- [auth.hook.custom_access_token]
-- enabled = true
-- uri = "pg-functions://postgres/public/custom_access_token_hook"
-- -----------------------------------------------------------------------------
