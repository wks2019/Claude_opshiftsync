-- =============================================================================
-- CHOSEN WORKFLOW LXP - INITIAL SCHEMA
-- Migration: 001_initial_schema.sql
-- Applies to: PostgreSQL 15+ (Supabase)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- EXTENSIONS
-- -----------------------------------------------------------------------------

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- SHARED FUNCTIONS
-- -----------------------------------------------------------------------------

-- Generic updated_at trigger
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Returns the caller's hotel_group_id (tenant root) without recursive RLS lookups.
-- SECURITY DEFINER bypasses RLS on users table for this single, narrow lookup.
-- Defined after TENANCY & IDENTITY below: language sql functions are parsed
-- and validated against real tables at CREATE FUNCTION time (unlike plpgsql,
-- which defers checking), so this must come after users/roles/user_roles exist.

-- -----------------------------------------------------------------------------
-- TENANCY & IDENTITY
-- -----------------------------------------------------------------------------

create table hotel_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  branding jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table hotels (
  id uuid primary key default gen_random_uuid(),
  hotel_group_id uuid not null references hotel_groups(id) on delete restrict,
  name text not null,
  standard_profile text,
  branding_override jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table departments (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotels(id) on delete restrict,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table teams (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references departments(id) on delete restrict,
  name text not null,
  manager_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  hotel_group_id uuid not null references hotel_groups(id) on delete restrict,
  hotel_id uuid references hotels(id) on delete set null,
  department_id uuid references departments(id) on delete set null,
  team_id uuid references teams(id) on delete set null,
  full_name text not null,
  email text unique not null,
  status text not null default 'invited' check (status in ('active', 'suspended', 'invited')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table teams
  add constraint teams_manager_id_fkey
  foreign key (manager_id) references users(id) on delete set null;

create table roles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null check (name in ('guest', 'staff', 'manager', 'administrator'))
);

create table user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  role_id uuid not null references roles(id) on delete restrict,
  unique (user_id, role_id)
);

-- Returns the caller's hotel_group_id (tenant root) without recursive RLS lookups.
-- SECURITY DEFINER bypasses RLS on users table for this single, narrow lookup.
create or replace function auth_hotel_group_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select hotel_group_id from users where id = auth.uid();
$$;

-- Returns true if the caller holds the given role name.
create or replace function auth_has_role(role_name text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from user_roles ur
    join roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.name = role_name
  );
$$;

-- -----------------------------------------------------------------------------
-- LMS
-- -----------------------------------------------------------------------------

create table courses (
  id uuid primary key default gen_random_uuid(),
  hotel_group_id uuid not null references hotel_groups(id) on delete restrict,
  title text not null,
  description text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  standard_tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  sequence int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  course_module_id uuid not null references course_modules(id) on delete cascade,
  title text not null,
  content jsonb not null default '{}',
  sequence int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table videos (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  storage_path text not null,
  duration_seconds int,
  created_at timestamptz not null default now()
);

create table quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  passing_score numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  question text not null,
  options jsonb not null,
  correct_option_index int not null,
  sequence int not null
);

create table enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, course_id)
);

create table lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  quiz_score numeric,
  completed_at timestamptz,
  unique (user_id, lesson_id)
);

-- -----------------------------------------------------------------------------
-- SOP SYSTEM
-- (created before simulations so simulation_choices can reference sops)
-- -----------------------------------------------------------------------------

create table sops (
  id uuid primary key default gen_random_uuid(),
  hotel_group_id uuid not null references hotel_groups(id) on delete restrict,
  title text not null,
  department_id uuid references departments(id) on delete set null,
  current_version_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table sop_versions (
  id uuid primary key default gen_random_uuid(),
  sop_id uuid not null references sops(id) on delete cascade,
  version_number int not null,
  steps jsonb not null,
  failure_modes jsonb not null default '[]',
  published_at timestamptz,
  unique (sop_id, version_number)
);

alter table sops
  add constraint sops_current_version_id_fkey
  foreign key (current_version_id) references sop_versions(id) on delete set null;

-- -----------------------------------------------------------------------------
-- SIMULATION ENGINE
-- -----------------------------------------------------------------------------

create table simulations (
  id uuid primary key default gen_random_uuid(),
  hotel_group_id uuid not null references hotel_groups(id) on delete restrict,
  title text not null,
  type text not null check (type in (
    'in_room_dining', 'concierge', 'housekeeping', 'front_office',
    'butler_service', 'complaint_recovery', 'vip_scenario'
  )),
  status text not null default 'draft' check (status in ('draft', 'pending_approval', 'published', 'archived')),
  entry_state_id uuid,
  difficulty text not null default 'standard' check (difficulty in ('standard', 'advanced', 'vip')),
  generated_by_ai boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table simulation_states (
  id uuid primary key default gen_random_uuid(),
  simulation_id uuid not null references simulations(id) on delete cascade,
  name text not null,
  guest_context jsonb not null default '{}',
  is_terminal boolean not null default false,
  created_at timestamptz not null default now()
);

alter table simulations
  add constraint simulations_entry_state_id_fkey
  foreign key (entry_state_id) references simulation_states(id) on delete set null;

create table simulation_choices (
  id uuid primary key default gen_random_uuid(),
  state_id uuid not null references simulation_states(id) on delete cascade,
  label text not null,
  next_state_id uuid not null references simulation_states(id) on delete restrict,
  forbes_delta numeric not null default 0,
  lqa_delta numeric not null default 0,
  sop_delta numeric not null default 0,
  ei_delta numeric not null default 0,
  sop_reference_id uuid references sops(id) on delete set null,
  guest_reaction jsonb not null default '{}'
);

create table simulation_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  simulation_id uuid not null references simulations(id) on delete restrict,
  current_state_id uuid references simulation_states(id) on delete set null,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table simulation_session_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references simulation_sessions(id) on delete cascade,
  state_id uuid not null references simulation_states(id) on delete restrict,
  choice_id uuid not null references simulation_choices(id) on delete restrict,
  occurred_at timestamptz not null default now()
);

create table simulation_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references simulation_sessions(id) on delete cascade,
  forbes_score numeric not null,
  lqa_score numeric not null,
  sop_score numeric not null,
  ei_score numeric not null,
  final_score numeric not null,
  created_at timestamptz not null default now()
);

create table sop_simulation_links (
  id uuid primary key default gen_random_uuid(),
  sop_id uuid not null references sops(id) on delete cascade,
  simulation_id uuid not null references simulations(id) on delete cascade,
  unique (sop_id, simulation_id)
);

-- -----------------------------------------------------------------------------
-- COMPETENCY
-- -----------------------------------------------------------------------------

create table competencies (
  id uuid primary key default gen_random_uuid(),
  hotel_group_id uuid not null references hotel_groups(id) on delete restrict,
  name text not null,
  description text
);

create table competency_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  competency_id uuid not null references competencies(id) on delete restrict,
  score numeric not null,
  source_session_id uuid references simulation_sessions(id) on delete cascade,
  recorded_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- CERTIFICATION
-- -----------------------------------------------------------------------------

create table certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  course_id uuid references courses(id) on delete set null,
  competency_id uuid references competencies(id) on delete set null,
  certificate_number text unique not null,
  qr_token text unique not null,
  storage_path text not null,
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  constraint certificates_source_check check (course_id is not null or competency_id is not null)
);

-- -----------------------------------------------------------------------------
-- STANDARDS ENGINE
-- -----------------------------------------------------------------------------

create table standards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_global boolean not null default true,
  hotel_group_id uuid references hotel_groups(id) on delete cascade
);

create table standard_weights (
  id uuid primary key default gen_random_uuid(),
  hotel_group_id uuid not null references hotel_groups(id) on delete cascade,
  standard_id uuid not null references standards(id) on delete restrict,
  weight numeric not null check (weight >= 0 and weight <= 100),
  unique (hotel_group_id, standard_id)
);

-- -----------------------------------------------------------------------------
-- PLATFORM
-- -----------------------------------------------------------------------------

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  hotel_group_id uuid not null references hotel_groups(id) on delete cascade,
  actor_id uuid references users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

create index idx_hotels_hotel_group_id on hotels(hotel_group_id);
create index idx_departments_hotel_id on departments(hotel_id);
create index idx_teams_department_id on teams(department_id);
create index idx_users_hotel_group_id on users(hotel_group_id);
create index idx_users_hotel_id on users(hotel_id);
create index idx_users_team_id on users(team_id);
create index idx_user_roles_user_id on user_roles(user_id);

create index idx_courses_hotel_group_id_status on courses(hotel_group_id, status);
create index idx_course_modules_course_id on course_modules(course_id);
create index idx_lessons_course_module_id on lessons(course_module_id);
create index idx_videos_lesson_id on videos(lesson_id);
create index idx_quizzes_lesson_id on quizzes(lesson_id);
create index idx_quiz_questions_quiz_id on quiz_questions(quiz_id);
create index idx_enrollments_user_id on enrollments(user_id);
create index idx_enrollments_course_id on enrollments(course_id);
create index idx_lesson_progress_user_id on lesson_progress(user_id);
create index idx_lesson_progress_lesson_id on lesson_progress(lesson_id);

create index idx_simulations_hotel_group_id_status on simulations(hotel_group_id, status);
create index idx_simulation_states_simulation_id on simulation_states(simulation_id);
create index idx_simulation_choices_state_id on simulation_choices(state_id);
create index idx_simulation_sessions_user_id on simulation_sessions(user_id);
create index idx_simulation_sessions_simulation_id on simulation_sessions(simulation_id);
create index idx_simulation_session_events_session_id on simulation_session_events(session_id);
create index idx_simulation_results_session_id on simulation_results(session_id);

create index idx_competencies_hotel_group_id on competencies(hotel_group_id);
create index idx_competency_scores_user_id on competency_scores(user_id);
create index idx_competency_scores_competency_id on competency_scores(competency_id);

create index idx_sops_hotel_group_id on sops(hotel_group_id);
create index idx_sop_versions_sop_id on sop_versions(sop_id);
create index idx_sop_simulation_links_sop_id on sop_simulation_links(sop_id);
create index idx_sop_simulation_links_simulation_id on sop_simulation_links(simulation_id);

create index idx_certificates_user_id on certificates(user_id);
create index idx_certificates_qr_token on certificates(qr_token);

create index idx_standards_hotel_group_id on standards(hotel_group_id);
create index idx_standard_weights_hotel_group_id on standard_weights(hotel_group_id);

create index idx_notifications_user_id_read_at on notifications(user_id, read_at);
create index idx_audit_logs_hotel_group_id on audit_logs(hotel_group_id);
create index idx_audit_logs_entity on audit_logs(entity_type, entity_id);

-- =============================================================================
-- UPDATED_AT TRIGGERS
-- =============================================================================

create trigger trg_hotel_groups_updated_at before update on hotel_groups for each row execute function set_updated_at();
create trigger trg_hotels_updated_at before update on hotels for each row execute function set_updated_at();
create trigger trg_departments_updated_at before update on departments for each row execute function set_updated_at();
create trigger trg_teams_updated_at before update on teams for each row execute function set_updated_at();
create trigger trg_users_updated_at before update on users for each row execute function set_updated_at();
create trigger trg_courses_updated_at before update on courses for each row execute function set_updated_at();
create trigger trg_course_modules_updated_at before update on course_modules for each row execute function set_updated_at();
create trigger trg_lessons_updated_at before update on lessons for each row execute function set_updated_at();
create trigger trg_quizzes_updated_at before update on quizzes for each row execute function set_updated_at();
create trigger trg_simulations_updated_at before update on simulations for each row execute function set_updated_at();
create trigger trg_sops_updated_at before update on sops for each row execute function set_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

alter table hotel_groups enable row level security;
alter table hotels enable row level security;
alter table departments enable row level security;
alter table teams enable row level security;
alter table users enable row level security;
alter table roles enable row level security;
alter table user_roles enable row level security;
alter table courses enable row level security;
alter table course_modules enable row level security;
alter table lessons enable row level security;
alter table videos enable row level security;
alter table quizzes enable row level security;
alter table quiz_questions enable row level security;
alter table enrollments enable row level security;
alter table lesson_progress enable row level security;
alter table simulations enable row level security;
alter table simulation_states enable row level security;
alter table simulation_choices enable row level security;
alter table simulation_sessions enable row level security;
alter table simulation_session_events enable row level security;
alter table simulation_results enable row level security;
alter table sop_simulation_links enable row level security;
alter table competencies enable row level security;
alter table competency_scores enable row level security;
alter table sops enable row level security;
alter table sop_versions enable row level security;
alter table certificates enable row level security;
alter table standards enable row level security;
alter table standard_weights enable row level security;
alter table notifications enable row level security;
alter table audit_logs enable row level security;

-- -----------------------------------------------------------------------------
-- TENANCY & IDENTITY POLICIES
-- -----------------------------------------------------------------------------

create policy hotel_groups_select on hotel_groups
  for select using (id = auth_hotel_group_id());

create policy hotels_select on hotels
  for select using (hotel_group_id = auth_hotel_group_id());

create policy departments_select on departments
  for select using (
    hotel_id in (select id from hotels where hotel_group_id = auth_hotel_group_id())
  );

create policy teams_select on teams
  for select using (
    department_id in (
      select d.id from departments d
      join hotels h on h.id = d.hotel_id
      where h.hotel_group_id = auth_hotel_group_id()
    )
  );

create policy users_select on users
  for select using (hotel_group_id = auth_hotel_group_id());

create policy users_update_self on users
  for update using (id = auth.uid());

create policy roles_select on roles
  for select using (true);

create policy user_roles_select on user_roles
  for select using (
    user_id in (select id from users where hotel_group_id = auth_hotel_group_id())
  );

-- -----------------------------------------------------------------------------
-- LMS POLICIES
-- -----------------------------------------------------------------------------

create policy courses_select on courses
  for select using (hotel_group_id = auth_hotel_group_id());

create policy courses_write on courses
  for insert with check (hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator'));

create policy courses_update on courses
  for update using (hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator'));

create policy course_modules_select on course_modules
  for select using (
    course_id in (select id from courses where hotel_group_id = auth_hotel_group_id())
  );

create policy lessons_select on lessons
  for select using (
    course_module_id in (
      select cm.id from course_modules cm
      join courses c on c.id = cm.course_id
      where c.hotel_group_id = auth_hotel_group_id()
    )
  );

create policy videos_select on videos
  for select using (
    lesson_id in (
      select l.id from lessons l
      join course_modules cm on cm.id = l.course_module_id
      join courses c on c.id = cm.course_id
      where c.hotel_group_id = auth_hotel_group_id()
    )
  );

create policy quizzes_select on quizzes
  for select using (
    lesson_id in (
      select l.id from lessons l
      join course_modules cm on cm.id = l.course_module_id
      join courses c on c.id = cm.course_id
      where c.hotel_group_id = auth_hotel_group_id()
    )
  );

create policy quiz_questions_select on quiz_questions
  for select using (
    quiz_id in (
      select q.id from quizzes q
      join lessons l on l.id = q.lesson_id
      join course_modules cm on cm.id = l.course_module_id
      join courses c on c.id = cm.course_id
      where c.hotel_group_id = auth_hotel_group_id()
    )
  );

create policy enrollments_select on enrollments
  for select using (
    user_id = auth.uid()
    or user_id in (select id from users where hotel_group_id = auth_hotel_group_id())
       and auth_has_role('manager')
    or auth_has_role('administrator')
  );

create policy enrollments_insert_self on enrollments
  for insert with check (user_id = auth.uid());

create policy lesson_progress_select on lesson_progress
  for select using (
    user_id = auth.uid()
    or auth_has_role('manager')
    or auth_has_role('administrator')
  );

create policy lesson_progress_write_self on lesson_progress
  for insert with check (user_id = auth.uid());

create policy lesson_progress_update_self on lesson_progress
  for update using (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- SIMULATION ENGINE POLICIES
-- -----------------------------------------------------------------------------

create policy simulations_select on simulations
  for select using (hotel_group_id = auth_hotel_group_id());

create policy simulations_write on simulations
  for insert with check (hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator'));

create policy simulation_states_select on simulation_states
  for select using (
    simulation_id in (select id from simulations where hotel_group_id = auth_hotel_group_id())
  );

create policy simulation_choices_select on simulation_choices
  for select using (
    state_id in (
      select ss.id from simulation_states ss
      join simulations s on s.id = ss.simulation_id
      where s.hotel_group_id = auth_hotel_group_id()
    )
  );

create policy simulation_sessions_select on simulation_sessions
  for select using (
    user_id = auth.uid()
    or auth_has_role('manager')
    or auth_has_role('administrator')
  );

create policy simulation_sessions_insert_self on simulation_sessions
  for insert with check (user_id = auth.uid());

create policy simulation_sessions_update_self on simulation_sessions
  for update using (user_id = auth.uid());

create policy simulation_session_events_select on simulation_session_events
  for select using (
    session_id in (select id from simulation_sessions where user_id = auth.uid())
    or auth_has_role('manager')
    or auth_has_role('administrator')
  );

create policy simulation_session_events_insert_self on simulation_session_events
  for insert with check (
    session_id in (select id from simulation_sessions where user_id = auth.uid())
  );

create policy simulation_results_select on simulation_results
  for select using (
    session_id in (select id from simulation_sessions where user_id = auth.uid())
    or auth_has_role('manager')
    or auth_has_role('administrator')
  );

create policy sop_simulation_links_select on sop_simulation_links
  for select using (
    simulation_id in (select id from simulations where hotel_group_id = auth_hotel_group_id())
  );

-- -----------------------------------------------------------------------------
-- COMPETENCY POLICIES
-- -----------------------------------------------------------------------------

create policy competencies_select on competencies
  for select using (hotel_group_id = auth_hotel_group_id());

create policy competency_scores_select on competency_scores
  for select using (
    user_id = auth.uid()
    or auth_has_role('manager')
    or auth_has_role('administrator')
  );

-- -----------------------------------------------------------------------------
-- SOP SYSTEM POLICIES
-- -----------------------------------------------------------------------------

create policy sops_select on sops
  for select using (hotel_group_id = auth_hotel_group_id());

create policy sops_write on sops
  for insert with check (hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator'));

create policy sop_versions_select on sop_versions
  for select using (
    sop_id in (select id from sops where hotel_group_id = auth_hotel_group_id())
  );

-- -----------------------------------------------------------------------------
-- CERTIFICATION POLICIES
-- -----------------------------------------------------------------------------

create policy certificates_select on certificates
  for select using (
    user_id = auth.uid()
    or auth_has_role('manager')
    or auth_has_role('administrator')
  );

-- -----------------------------------------------------------------------------
-- STANDARDS ENGINE POLICIES
-- -----------------------------------------------------------------------------

create policy standards_select on standards
  for select using (is_global = true or hotel_group_id = auth_hotel_group_id());

create policy standard_weights_select on standard_weights
  for select using (hotel_group_id = auth_hotel_group_id());

create policy standard_weights_write on standard_weights
  for insert with check (hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator'));

create policy standard_weights_update on standard_weights
  for update using (hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator'));

-- -----------------------------------------------------------------------------
-- PLATFORM POLICIES
-- -----------------------------------------------------------------------------

create policy notifications_select_self on notifications
  for select using (user_id = auth.uid());

create policy notifications_update_self on notifications
  for update using (user_id = auth.uid());

create policy audit_logs_select on audit_logs
  for select using (hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator'));
