-- =============================================================================
-- CHOSEN WORKFLOW LXP - SECURITY HARDENING
-- Migration: 003_security_hardening.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Rate limiting (fixed window, Postgres-backed)
-- Works across serverless instances; in-memory counters do not.
-- -----------------------------------------------------------------------------

create table rate_limits (
  bucket text not null,
  window_start timestamptz not null,
  hits int not null default 1,
  primary key (bucket, window_start)
);

-- No RLS policies are added: with RLS enabled and no policy, the anon and
-- authenticated roles have no access. Only the security definer function
-- below and the service role can touch this table.
alter table rate_limits enable row level security;

-- Atomically counts a hit and reports whether the caller is over limit.
-- bucket: caller-defined key, e.g. 'step:{user_id}' or 'verify:{ip}'.
create or replace function check_rate_limit(
  p_bucket text,
  p_max_hits int,
  p_window_seconds int
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window_start timestamptz;
  v_hits int;
begin
  v_window_start := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  insert into rate_limits (bucket, window_start, hits)
  values (p_bucket, v_window_start, 1)
  on conflict (bucket, window_start)
  do update set hits = rate_limits.hits + 1
  returning hits into v_hits;

  return v_hits <= p_max_hits;
end;
$$;

grant execute on function check_rate_limit(text, int, int) to authenticated, anon;

-- Periodic cleanup of expired windows (invoke via pg_cron or scheduled Edge Function).
create or replace function prune_rate_limits()
returns void
language sql
security definer
set search_path = public
as $$
  delete from rate_limits where window_start < now() - interval '1 hour';
$$;

-- -----------------------------------------------------------------------------
-- 2. Step idempotency
-- A client retry with the same event key is rejected by the constraint
-- instead of double-counting a decision.
-- -----------------------------------------------------------------------------

alter table simulation_session_events
  add column event_key text;

create unique index idx_session_events_idempotency
  on simulation_session_events (session_id, event_key)
  where event_key is not null;

-- -----------------------------------------------------------------------------
-- 3. Audit log write function
-- Security definer so any authenticated caller can append (never read back:
-- select remains admin-only per the 001 policy). Insert path is append-only.
-- -----------------------------------------------------------------------------

create or replace function write_audit_log(
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_metadata jsonb default '{}'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into audit_logs (hotel_group_id, actor_id, action, entity_type, entity_id, metadata)
  values (auth_hotel_group_id(), auth.uid(), p_action, p_entity_type, p_entity_id, p_metadata);
end;
$$;

grant execute on function write_audit_log(text, text, uuid, jsonb) to authenticated;
