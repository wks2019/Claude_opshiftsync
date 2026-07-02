-- =============================================================================
-- CHOSEN WORKFLOW LXP - ANALYTICS ROLLUP
-- Migration: 004_analytics_rollup.sql
-- Manager and admin dashboards read this view, never live aggregates
-- across sessions/results/progress. Refreshed every 15 minutes via
-- pg_cron (or a scheduled Edge Function calling refresh_analytics()).
-- =============================================================================

create materialized view analytics_user_rollup as
select
  u.id as user_id,
  u.hotel_group_id,
  u.hotel_id,
  u.department_id,
  u.team_id,
  count(distinct e.id) filter (where e.status = 'completed') as courses_completed,
  count(distinct e.id) as courses_enrolled,
  count(distinct ss.id) filter (where ss.status = 'completed') as simulations_completed,
  avg(sr.final_score) as avg_final_score,
  avg(sr.forbes_score) as avg_forbes_score,
  avg(sr.lqa_score) as avg_lqa_score,
  avg(sr.sop_score) as avg_sop_score,
  avg(sr.ei_score) as avg_ei_score,
  max(ss.completed_at) as last_simulation_at
from users u
left join enrollments e on e.user_id = u.id
left join simulation_sessions ss on ss.user_id = u.id
left join simulation_results sr on sr.session_id = ss.id
group by u.id, u.hotel_group_id, u.hotel_id, u.department_id, u.team_id;

-- Unique index required for REFRESH ... CONCURRENTLY, and it is the
-- primary lookup key anyway.
create unique index idx_analytics_user_rollup_user on analytics_user_rollup(user_id);
create index idx_analytics_user_rollup_tenant on analytics_user_rollup(hotel_group_id);
create index idx_analytics_user_rollup_team on analytics_user_rollup(team_id);

-- Materialised views do not support RLS. Access goes exclusively through
-- this security definer function, which applies tenant and role scoping
-- itself. Direct selects are revoked.
revoke all on analytics_user_rollup from authenticated, anon;

create or replace function get_team_analytics()
returns setof analytics_user_rollup
language sql
security definer
stable
set search_path = public
as $$
  select r.*
  from analytics_user_rollup r
  where r.hotel_group_id = auth_hotel_group_id()
    and (auth_has_role('administrator') or auth_has_role('manager'));
$$;

grant execute on function get_team_analytics() to authenticated;

create or replace function refresh_analytics()
returns void
language sql
security definer
set search_path = public
as $$
  refresh materialized view concurrently analytics_user_rollup;
$$;
