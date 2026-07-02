# Phase 1 Scope — Chosen Workflow LXP

Status at scaffold time: engine, schema, auth, and one full vertical slice
(simulation start -> step -> result) are built and verified. Everything
below is what Phase 1 adds to reach a usable product for a single pilot
property. AI Coach, Scenario Generator, and everything past them are
explicitly out of scope here (see AI Roadmap).

## In Scope

### API routes (16 remaining, from the API Design section)
- `GET /courses`, `GET /courses/:id`
- `POST /enrollments`, `PATCH /lessons/:id/progress`
- `GET /simulations`
- `GET /sessions/:id`
- `GET /competencies/me`, `GET /competencies/team`
- `GET /certificates/me`
- `GET /sops`, `GET /sops/:id`
- `POST /admin/users/invite` (wraps the already-built `inviteUser` service)
- `GET /analytics/overview` (wraps `get_team_analytics()`, already built)

### UI
- Staff: course list, course/lesson player, quiz, simulations list, own
  Audit Ledger history, certificate list
- Manager: team Audit Ledger rollup, at-risk staff list, individual
  drill-down
- Admin: user management (invite, suspend, role change), tenant settings,
  standards engine weight editor
- Minimal CMS: course/lesson authoring, simulation authoring (manual, not
  AI-assisted — Scenario Generator is Phase 6), SOP authoring, all writing
  through Edge Functions per the RLS design decision

### Platform
- Certificate PDF generation (`services/pdf/`, schema and storage path
  already defined)
- RLS regression test suite (flagged twice in this spec, not yet built,
  blocking before any tenant's real data goes in)
- Repo live on GitHub, staging Supabase project provisioned, CI green on
  `develop`

## Explicitly Out of Scope for Phase 1

- AI Coach, AI Scenario Generator (Phase 6a/6b)
- Voice, XR, avatars (Phase 6c+)
- Multi-property analytics beyond the single-tenant rollup already built
- Non-English content (CMS translation pipeline, Phase 6c+)

## Definition of Done for Phase 1

- A pilot property's admin can invite staff, author one course and one
  simulation by hand, and staff can complete both, see their Audit Ledger,
  and receive a certificate, end to end, with a manager able to see the
  team rollup.
- RLS regression suite passes in CI on every PR touching `database/`.
- Lighthouse budget (95+) holds on staff dashboard and marketing pages.

## Suggested Build Order

1. Repo live, CI green, staging Supabase provisioned (infrastructure, no
   feature code)
2. RLS regression suite (correctness gate before more tables get real data)
3. Remaining API routes (mechanical, engine and API helper patterns are
   already established)
4. CMS authoring (unblocks everyone else from needing hand-inserted SQL)
5. LMS + Manager + Admin UI (the CMS from step 4 gives them real content
   to render against)
6. Certificate PDF generation
7. Pilot property onboarding
