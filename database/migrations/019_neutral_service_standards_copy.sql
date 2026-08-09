-- =============================================================================
-- CHOSEN WORKFLOW - NEUTRAL SERVICE STANDARDS COPY
-- Migration: 019_neutral_service_standards_copy.sql
--
-- Removes third-party inspection-body references from stored content and
-- column documentation. Migration 013 set the original default and 016 set
-- the original comment; editing those files changes nothing in a database
-- that has already run them, so the live values are corrected here.
--
-- No schema change, no data loss. Column names are deliberately untouched:
-- renaming forbes_score / lqa_score is a coordinated code-and-schema change
-- and is out of scope for a copy migration.
-- =============================================================================

-- 1. Column default for any future website_content row.
alter table website_content
  alter column hero_subtitle set default
    'A learning and simulation platform built on five-star service principles and luxury guest experience principles. Every scenario is a real guest interaction. Every score is one your quality team can act on.';

-- 2. The existing singleton row, only if an administrator has not already
--    edited it away from the original seeded text.
update website_content
set hero_subtitle =
      'A learning and simulation platform built on five-star service principles and luxury guest experience principles. Every scenario is a real guest interaction. Every score is one your quality team can act on.',
    updated_at = now()
where hero_subtitle =
      'A learning and simulation platform built on Forbes Travel Guide and LQA standards. Every scenario is a real guest interaction. Every score is one your inspectors would recognise.';

-- 3. Any administrator-edited copy that still carries the old terms is
--    rewritten term-by-term rather than overwritten, so bespoke edits survive.
update website_content
set hero_subtitle = replace(
      replace(
        replace(hero_subtitle, 'Forbes Travel Guide and LQA standards',
                'five-star service principles and luxury guest experience principles'),
        'Forbes Travel Guide', 'five-star service principles'),
      'LQA', 'luxury guest experience principles'),
    updated_at = now()
where hero_subtitle ilike '%forbes%' or hero_subtitle ilike '%lqa%';

update website_content
set hero_eyebrow = replace(replace(hero_eyebrow, 'Forbes Travel Guide', 'five-star service'), 'LQA', 'luxury guest experience'),
    hero_title = replace(replace(hero_title, 'Forbes Travel Guide', 'five-star service'), 'LQA', 'luxury guest experience'),
    updated_at = now()
where hero_eyebrow ilike '%forbes%' or hero_eyebrow ilike '%lqa%'
   or hero_title ilike '%forbes%' or hero_title ilike '%lqa%';

-- 4. Column documentation.
comment on column sop_versions.standard is
  'Service standards alignment statement for this SOP version. Required going forward, nullable for pre-existing rows.';

-- 5. Author-entered SOP standard statements carrying the old terms.
update sop_versions
set standard = replace(
      replace(
        replace(standard, 'FTG/LQA', 'service standards'),
        'Forbes Travel Guide', 'five-star service principles'),
      'LQA', 'luxury guest experience principles')
where standard is not null
  and (standard ilike '%forbes%' or standard ilike '%lqa%' or standard ilike '%ftg%');
