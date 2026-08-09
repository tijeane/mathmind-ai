# MathMind

AI-powered math tutoring platform for K–8 students, parents, teachers, and schools.

## Governance

This project is governed by the documents in [`knowledge/`](./knowledge). Start with:

- `knowledge/00-governance/PROJECT_HANDBOOK.md` — operating model, engineering philosophy, session startup checklist
- `knowledge/00-governance/DECISION_INDEX.md` — catalog of all approved decisions
- `knowledge/02-architecture/adr/` — Architecture Decision Records
- `knowledge/00-governance/CONTRIBUTING.md` — contribution workflow

Approved governance documents and ADRs are the source of truth. Do not redesign architecture without going through the ADR process (ADR-012).

## Tech Stack

Per ADR-005: Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui, Supabase (PostgreSQL, Auth, Storage), Vercel, GitHub Actions.

## Getting Started

```bash
npm install
cp .env.example .env.local
# fill in .env.local with your Supabase project credentials (see MM-002)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Supabase Setup (MM-002)

1. Create a project at [supabase.com](https://supabase.com).
2. From Project Settings -> API, copy the Project URL, anon/public key, and service_role key into `.env.local`.
3. Run the initial migration (`database/migrations/`) against your project — via the Supabase SQL editor, or the Supabase CLI once it's introduced (not yet part of this scaffold).
4. Verify connectivity: `npm run dev`, then visit `/api/health` — it should return `{"status":"ok","supabase":"reachable"}`.

Client usage:

- `lib/supabase/client.ts` — browser / Client Components
- `lib/supabase/server.ts` — Server Components, Route Handlers, Server Actions (RLS-scoped, per ADR-006)
- `lib/supabase/service.ts` — service-role client; **server-only**, bypasses RLS, use sparingly
- `proxy.ts` + `lib/supabase/middleware.ts` — session refresh on every request

Full RBAC and the `security.*` RLS helper functions (DB-000) land in Phase 1 once the Identity domain tables exist.

## Scripts

| Command                | Purpose                |
| ---------------------- | ---------------------- |
| `npm run dev`          | Start local dev server |
| `npm run build`        | Production build       |
| `npm run lint`         | ESLint                 |
| `npm run lint:fix`     | ESLint with autofix    |
| `npm run format`       | Prettier write         |
| `npm run format:check` | Prettier check (CI)    |
| `npm run typecheck`    | TypeScript, no emit    |

## Repository Structure

See ADR-004 for the full rationale. Top level:

```
knowledge/     governance & architecture docs (source of truth)
app/           Next.js App Router routes/pages
components/    reusable UI components
lib/           shared utilities
services/      business/domain logic
database/      migrations (docs live in knowledge/03-database/)
tests/         unit, component, and e2e tests
scripts/       one-off/maintenance scripts
```

## Status

Phase 0 (Foundation) — in progress. See `knowledge/06-implementation/IMPLEMENTATION_PLAN.md` and `IMPLEMENTATION_BACKLOG.md`.
