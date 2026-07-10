-- 017_sop_document_meta.sql
-- Document-level metadata for the CMS Engine editor: company header,
-- document info grid, scope statement, and card orientation.
-- Idempotent: safe to rerun.

alter table sop_versions
  add column if not exists meta jsonb not null default '{}';

comment on column sop_versions.meta is
  'Document-level CMS fields: { header: {companyName, website, address, logoUrl}, docInfo: {sopNumber, dateCreated, implementationDate, revisionNumber, lastUpdated, preparedBy, showPreparedBy}, scope, orientation, styles }.';
