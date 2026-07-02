-- =============================================================================
-- CHOSEN WORKFLOW LXP - CERTIFICATE EXPIRY RULES
-- Migration: 011_certificate_expiry.sql
--
-- Adds expires_at to certificates. Nullable: certificates issued before
-- this migration, and any issued without an explicit expiry, never
-- expire. Found while building RC1 Section 4.6, certificate templates
-- and PDF generation are deferred, expiry rules are the scoped part
-- of Certifications management shipped here.
-- =============================================================================

alter table certificates
  add column expires_at timestamptz;
