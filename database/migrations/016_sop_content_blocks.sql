-- 016_sop_content_blocks.sql
-- Adds structured content to sop_versions for the block-based SOP editor.
-- steps stays populated (derived from procedure blocks) so the simulation
-- engine and the existing detail page keep working unchanged.

alter table sop_versions
  add column if not exists standard text,
  add column if not exists blocks jsonb not null default '[]';

comment on column sop_versions.standard is
  'FTG/LQA compliance statement for this SOP version. Required going forward, nullable for pre-existing rows.';
comment on column sop_versions.blocks is
  'Ordered flexible content blocks: procedure, checklist, media. steps remains the flattened procedure text for scoring compatibility.';
