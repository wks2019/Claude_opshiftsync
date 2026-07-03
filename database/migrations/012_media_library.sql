-- =============================================================================
-- CHOSEN WORKFLOW LXP - MEDIA LIBRARY
-- Migration: 012_media_library.sql
--
-- New subsystem, not the recurring RLS gap pattern. Adds a storage
-- bucket, a media_assets table, and RLS on both the table and
-- storage.objects. Files live at path {hotel_group_id}/{uuid}-{name},
-- the folder prefix is what storage RLS checks against auth_hotel_group_id().
-- =============================================================================

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create table media_assets (
  id uuid primary key default gen_random_uuid(),
  hotel_group_id uuid not null references hotel_groups(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  folder text not null default 'general',
  tags text[] not null default '{}',
  uploaded_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index media_assets_hotel_group_id_idx on media_assets(hotel_group_id);

alter table media_assets enable row level security;

create policy media_assets_select on media_assets
  for select using (hotel_group_id = auth_hotel_group_id());

create policy media_assets_insert on media_assets
  for insert with check (
    hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator')
  );

create policy media_assets_delete on media_assets
  for delete using (
    hotel_group_id = auth_hotel_group_id() and auth_has_role('administrator')
  );

-- Storage RLS: path convention is {hotel_group_id}/{uuid}-{filename}, so
-- the first path segment is checked against the caller's tenant.
create policy media_storage_select on storage.objects
  for select using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = auth_hotel_group_id()::text
  );

create policy media_storage_insert on storage.objects
  for insert with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = auth_hotel_group_id()::text
    and auth_has_role('administrator')
  );

create policy media_storage_delete on storage.objects
  for delete using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = auth_hotel_group_id()::text
    and auth_has_role('administrator')
  );
