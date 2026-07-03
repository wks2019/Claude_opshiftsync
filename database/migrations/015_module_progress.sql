-- =============================================================================
-- CHOSEN WORKFLOW LXP - MODULE PROGRESS ROLLUP
-- Migration: 015_module_progress.sql
--
-- lesson_progress tracks per-lesson status only. No rollup existed at
-- course_module level, so the frontend had no completion percent to render
-- on module cards. This adds get_module_progress(), self-scoped to the
-- calling user, following the get_team_analytics() security pattern.
-- =============================================================================

create or replace function get_module_progress()
returns table (
  course_module_id uuid,
  course_id uuid,
  title text,
  sequence int,
  total_lessons bigint,
  completed_lessons bigint,
  percent_complete numeric,
  status text
)
language sql
security definer
stable
set search_path = public
as $$
  select
    cm.id as course_module_id,
    cm.course_id,
    cm.title,
    cm.sequence,
    count(l.id) as total_lessons,
    count(lp.id) filter (where lp.status = 'completed') as completed_lessons,
    case when count(l.id) = 0 then 0
      else round(count(lp.id) filter (where lp.status = 'completed') * 100.0 / count(l.id), 1)
    end as percent_complete,
    case
      when count(l.id) = 0 then 'not_started'
      when count(lp.id) filter (where lp.status = 'completed') = count(l.id) then 'completed'
      when count(lp.id) filter (where lp.status in ('completed', 'in_progress')) > 0 then 'in_progress'
      else 'not_started'
    end as status
  from course_modules cm
  join courses c on c.id = cm.course_id
  left join lessons l on l.course_module_id = cm.id
  left join lesson_progress lp on lp.lesson_id = l.id and lp.user_id = auth.uid()
  where c.hotel_group_id = auth_hotel_group_id()
  group by cm.id, cm.course_id, cm.title, cm.sequence
  order by cm.sequence;
$$;

grant execute on function get_module_progress() to authenticated;
