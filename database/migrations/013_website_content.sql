-- =============================================================================
-- CHOSEN WORKFLOW LXP - WEBSITE CONTENT
-- Migration: 013_website_content.sql
--
-- Scope note: the landing page is a single shared public marketing site,
-- not scoped per hotel_group_id, there is no subdomain routing and no
-- platform-owner role distinct from hotel-group administrator. This
-- table is a global singleton, editable by any administrator. Correct
-- for the current effectively-single-tenant deployment. If true
-- multi-tenant marketing pages are ever needed, this needs a real
-- platform-admin role, not a bigger table.
-- =============================================================================

create table website_content (
  id uuid primary key default gen_random_uuid(),
  is_singleton boolean not null default true unique,
  hero_eyebrow text not null default 'For luxury hospitality',
  hero_title text not null default 'Train the moment, not the manual.',
  hero_subtitle text not null default 'A learning and simulation platform built on Forbes Travel Guide and LQA standards. Every scenario is a real guest interaction. Every score is one your inspectors would recognise.',
  footer_text text not null default 'Chosen Workflow',
  updated_at timestamptz not null default now()
);

insert into website_content (is_singleton) values (true);

alter table website_content enable row level security;

-- Public marketing site reads this unauthenticated.
create policy website_content_select on website_content
  for select using (true);

create policy website_content_update on website_content
  for update using (auth_has_role('administrator'));
