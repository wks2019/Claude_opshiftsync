# Chosen Workflow

Multi-tenant learning and simulation platform for luxury hospitality
standards (Forbes, LQA, SOP, EI). Next.js + Supabase + Netlify.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in Supabase project values
supabase start                # local DB via Supabase CLI, optional
npm run dev
```

## Structure

See `PHASE_1_SCOPE.md` for what ships next. Design record (architecture
through AI roadmap, thirteen sections) lives in Project Knowledge, not in
this repo, since it is prose that should not drift with the code.

```
app/                 Next.js App Router routes, incl. app/api/v1
modules/              Domain modules (simulation-engine is the reference
                       shape: engine/ services/ components/ tests/)
services/              Cross-cutting clients: supabase, auth, pdf, ai
components/             Shared UI (Audit Ledger, Dashboard Shell)
database/
  migrations/           Sequential SQL, apply in numeric order
  seed/                 Per-tenant reference content (not run in CI)
config/                 React Query and other app-wide config
types/                  Shared types, database.ts is Supabase-generated
proxy.ts                Next.js 16 request gatekeeper (formerly
                        middleware.ts): session refresh + role routing
```

## Database

Migrations apply in order:

```bash
supabase db push
```

`001_initial_schema.sql` through `004_analytics_rollup.sql`. Do not
reorder or squash; see the Deployment Plan section in Project Knowledge
for the additive-first migration discipline.

## Testing

```bash
npm run test        # vitest, engine and service unit tests
npm run typecheck    # tsc --noEmit, strict
npm run lint
```

## Conventions

- No em dashes in prose (comments, commit messages, docs). See
  `NO_EMDASH_SKILL.md` if it resurfaces as a project skill.
- British English spelling in all copy and comments.
- Service role key usage confined to `services/supabase/admin.ts`.
- Every new table needs an RLS policy in the same migration that creates
  it; no table ships without one.
