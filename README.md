# Chosen Workflow

Multi-tenant learning experience platform (LXP) for luxury hospitality
properties. Staff, managers, and admins across hotel groups train against
Forbes Travel Guide and LQA standards through courses, SOPs, and
decision-based simulations, with every result scored and auditable.

**Live:** `chosenworkflow.netlify.app`

## Stack

- Next.js 16.2.10, TypeScript (strict, `noUncheckedIndexedAccess`)
- Tailwind v4
- Supabase (Postgres, Auth, RLS)
- Netlify, auto-deploy from `main`

## What it does

- **Courses:** modules, lessons, and quizzes, authored through an admin CMS
- **Simulations:** branching, decision-based scenarios with deterministic
  scoring, run through the Simulation Engine (`modules/simulation-engine`)
- **SOPs:** versioned standard operating procedures, built from six
  reusable block types (Procedure, Checklist, Table, Rating/Competency,
  Field/Record, Media)
- **Certificates:** issued on completion, publicly verifiable at
  `/certificates/verify`, with expiry support
- **Competencies:** weighted scoring against Forbes and LQA standards,
  tracked per user and rolled up per module
- **Roles:** staff, manager, administrator, each with a dedicated
  dashboard under `app/(dashboard)/`
- **Multi-tenancy:** every table scoped to `hotel_group_id`, enforced by
  Postgres Row Level Security, not application logic

## Structure

```
app/(dashboard)/{admin,manager,staff}   role-specific dashboards
app/api/v1                              backend API routes
app/certificates/verify                 public certificate verification
modules/simulation-engine               simulation player and scoring
services/                               Supabase service layer (CRUD)
database/migrations/                    15 migrations, run manually
types/database.ts                       hand-maintained Supabase types
```

See `PHASE_1_SCOPE.md` for what ships next. The full design record
(architecture through AI roadmap) lives in Project Knowledge, not in this
repo, since it is prose that should not drift with the code.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in Supabase project values
supabase start                # local DB via Supabase CLI, optional
npm run dev
```

## Database migrations

Migrations live in `database/migrations/` and are **not** applied
automatically. There is no CI step or MCP tool for raw SQL execution.
Run each file manually, in numeric order, in the Supabase SQL Editor:

```
https://supabase.com/dashboard/project/<project-ref>/sql/new
```

Fetch raw file content from GitHub before pasting, not the rendered
GitHub UI, to avoid HTML contamination:

```
https://raw.githubusercontent.com/wks2019/Claude_opshiftsync/main/database/migrations/<filename>.sql
```

## Pre-commit sequence (mandatory)

```bash
npm run typecheck
npx vitest run      # must pass all tests
npx next build
```

`git status` will show `.github/workflows/ci.yml` as modified after every
`git add -A`, this is expected. Run `git reset .github/workflows/ci.yml`
before committing, the deploy token lacks `workflow` scope.
