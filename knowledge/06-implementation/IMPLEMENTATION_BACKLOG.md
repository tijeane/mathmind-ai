# IMPLEMENTATION_BACKLOG
# MathMind Engineering Backlog

| Field | Value |
|-------|-------|
| Status | Approved |
| Version | 1.3 |
| Owner | Engineering |
| Category | Engineering Backlog |

---

# Purpose

This document converts the approved architecture into executable engineering work.

Every task references the approved architecture and can be estimated, assigned, implemented, tested, and deployed independently.

---

# MVP Scope

Tickets marked **MVP** below are fleshed out with full deliverables and Definition of Done because they are the minimum slice needed to validate MathMind's core value proposition (MM-VSN-001: an AI tutor that explains reasoning and adapts its guidance using the student's real-time practice context) with real students, without building the full 41-ticket plan first. Mastery-based progression (skill graph mastery scoring, knowledge decay, adaptive difficulty) is Phase 3 and is explicitly deferred past MVP — MVP validates context-aware AI tutoring, not mastery-based progression.

Tickets not marked MVP remain title-only placeholders below — deliberately deferred, not forgotten. They get fleshed out when work on them actually starts, closer to when their phase begins per `IMPLEMENTATION_PLAN.md`.

MVP tickets: MM-100, MM-101, MM-104, MM-200, MM-203, MM-204, MM-300, MM-301, MM-500, MM-501, MM-502, MM-504.

Explicitly deferred past MVP: MM-102, MM-103, MM-201, MM-202, MM-302, MM-303, all of Epic 5 (Assessment), MM-503, MM-505, all of Epic 7 (Analytics), all of Epic 8 (Administration), and all of Epic 9 (Production) except basic error handling, which is folded into each MVP ticket's Definition of Done rather than given its own ticket.

The authoritative definition of what is in and out of MVP scope, and why, lives in `MM-MVP-001-mvp-definition.md` (`knowledge/01-product/`). This section's ticket list must stay in sync with that document; if they ever diverge, `MM-MVP-001` is authoritative and this list should be corrected to match.

---

## MVP Execution Rule

When an MVP scope document is approved, the MVP becomes the active implementation target.

Existing backlog items remain authoritative for the full MathMind product roadmap, but individual tasks must be implemented only to the scope required by the approved MVP unless the task is explicitly marked as MVP-required.

Deferred capabilities must not be pulled into the MVP solely because they are technically convenient to implement.

Any expansion of MVP scope requires an update and approval of the applicable MVP scope document.

---

# Epic 1 — Foundation

## MM-001

Initialize Next.js application

Priority: Critical

Dependencies: None

Deliverables

- Next.js
- TypeScript
- Tailwind
- ESLint
- Prettier

Definition of Done

- Project builds
- CI passes

---

## MM-002

Configure Supabase

Priority: Critical

Deliverables

- Database
- Authentication
- Storage
- Environment variables

---

## MM-003

Configure GitHub Actions

Deliverables

- Build
- Test
- Lint
- Typecheck

---

## MM-004

Configure Vercel

Deliverables

- Preview deployments
- Production deployment

---

# Epic 2 — Authentication

## MM-100 — MVP

Login

Priority: Critical

Dependencies: MM-002 (Supabase Auth configured)

Deliverables

- Email/password login form (Client Component, `lib/supabase/client.ts`)
- Supabase Auth sign-in integration
- Session persists via existing `proxy.ts` session-refresh middleware (MM-002)
- Redirect to an authenticated route on success; inline, non-crashing error on failure

Definition of Done

- A user with valid credentials reaches an authenticated route
- Invalid credentials show a clear error, no unhandled exception
- Session persists across a page reload
- format:check, typecheck, lint, test, build all pass

---

## MM-101 — MVP

Registration

Priority: Critical

Dependencies: MM-100

Deliverables

- Registration form (email, password, display name) with Zod validation (ADR-005)
- Supabase Auth sign-up integration
- `profiles` table (UUID PK, `deleted_at` per DB-000 soft-delete convention) with a row created for every new `auth.users` entry
- Duplicate-email and weak-password errors surfaced clearly, not as raw Supabase errors

Definition of Done

- A new user can register and lands on an authenticated route (or a "check your email" state, if Supabase email confirmation is left on)
- A duplicate email shows a clear, specific error
- A corresponding `profiles` row exists and is queryable
- format:check, typecheck, lint, test, build all pass

---

## MM-102

Forgot Password

---

## MM-103

Email Verification

---

## MM-104 — MVP

Student Role & Authorization Foundation

Priority: Critical

Dependencies: MM-101

Deliverables

- `role` column on `profiles`. MVP scope is `student` only — the underlying enum may reserve `parent`/`admin` values for forward compatibility, but no parent- or admin-facing feature, route, or policy is implemented in MVP (teacher/school roles are deferred past MVP per MM-VSN-001's phased audience rollout, and parent/admin roles have no functional surface until their own phase per MM-MVP-001)
- `security.has_role(role text)` helper function in the `security` schema stub created by MM-002's migration, per DB-000's RLS pattern
- RLS policy on `profiles` using `security.has_role()` / `security.is_org_member()`-style checks (never a direct cross-table reference in the policy itself, per DB-000)

Definition of Done

- A logged-in user's role is readable server-side via `lib/supabase/server.ts`
- RLS blocks a user from reading another user's `profiles` row (verified with two test accounts, not just code review)
- format:check, typecheck, lint, test, build all pass

---

# Epic 3 — Learning

## MM-200 — MVP

Course Foundation (read-only for MVP)

Priority: High

Dependencies: MM-104

Deliverables

- `courses` table (id, title, description) per DB-000 conventions
- One real, hand-authored course seeded via a migration or script — no admin authoring UI for MVP (deliberately deferred; content is seeded by hand, not built through a CMS)
- Read-only course listing page for students

Definition of Done

- A logged-in student sees the seeded course in a list
- No CRUD UI exists yet — this is intentional, not incomplete
- format:check, typecheck, lint, test, build all pass

---

## MM-201

Module CRUD

---

## MM-202

Lesson CRUD

---

## MM-203 — MVP

Concept Engine

Priority: High

Dependencies: MM-200

Deliverables

- `concepts` table (id, course_id, title, description, sequence_order, prerequisite_concept_id nullable) — a minimal skill-graph representation per MM-LRN-001, not the full graph structure. `description` is required so MM-501 (Context Builder) has the concept explanation it depends on.
- 5-10 hand-seeded concepts for the pilot course, in a sensible prerequisite order

Definition of Done

- Concepts for a course are queryable in prerequisite/sequence order
- format:check, typecheck, lint, test, build all pass

---

## MM-204 — MVP

Exercise Engine

Priority: High

Dependencies: MM-203

Deliverables

- `exercises` table (id, concept_id, prompt, difficulty_level, answer_key) — start with 2-3 difficulty levels for MVP, not the full 5 from MM-LRN-001
- 20-30 hand-written exercises across the pilot concepts

Definition of Done

- Exercises are queryable by concept and difficulty level
- format:check, typecheck, lint, test, build all pass

---

# Epic 4 — Practice

## MM-300 — MVP

Practice Session

Priority: High

Dependencies: MM-204

Deliverables

- Practice session UI: presents one exercise at a time for a chosen concept, accepts a free-text or numeric answer
- API route to fetch the next exercise for a concept

Definition of Done

- A student can start a session and see an exercise for a chosen concept
- format:check, typecheck, lint, test, build all pass

---

## MM-301 — MVP

Attempt Tracking

Priority: High

Dependencies: MM-300

Deliverables

- `attempts` table (id, user_id, exercise_id, submitted_answer, is_correct, created_at)
- Correctness check against `answer_key` — exact-match or numeric-tolerance for MVP, not general math-expression parsing
- RLS on `attempts` via `security.*` helpers so a student can only see their own attempts

Definition of Done

- Every submitted answer is recorded with a correctness result
- A test account cannot query another account's attempts (verified with two accounts)
- format:check, typecheck, lint, test, build all pass

---

## MM-302

Mastery Engine

---

## MM-303

Recommendation Engine

---

# Epic 5 — Assessment

## MM-400

Assessment Builder

---

## MM-401

Assessment Engine

---

## MM-402

Scoring

---

## MM-403

Results Dashboard

---

# Epic 6 — AI

## MM-500 — MVP

AI Gateway

Priority: Critical

Dependencies: MM-002 (OPENAI_API_KEY configured)

Deliverables

- `lib/ai/gateway.ts` — server-only module (per the `server-only` pattern established in `lib/supabase/service.ts`) wrapping the OpenAI client
- Single hardcoded model for MVP — no routing logic (MM-503 is deferred)

Definition of Done

- A test call through the gateway returns a real completion from OpenAI
- format:check, typecheck, lint, test, build all pass

---

## MM-501 — MVP

Context Builder

Priority: Critical

Dependencies: MM-500, MM-301

Deliverables

- Function assembling: the current exercise, the student's recent attempts on this concept, and the concept's description into one context payload, per MM-ARC-001's AI Orchestration Context Builder stage

Definition of Done

- Given a user_id + exercise_id, returns a well-formed context object with no missing required fields
- format:check, typecheck, lint, test, build all pass

---

## MM-502 — MVP

Prompt Builder

Priority: Critical

Dependencies: MM-501

Deliverables

- Prompt template(s) turning the context payload into a system + user prompt that instructs the model to explain reasoning rather than give the bare answer (MM-VSN-001's core pedagogy), and to give a single-level hint rather than a full solution when the student asks for a hint

Definition of Done

- Given a context object, produces a prompt that a human reviewer confirms follows the "explain reasoning, don't just give the answer" principle on at least 5 sample exercises
- format:check, typecheck, lint, test, build all pass

---

## MM-503

Model Router

---

## MM-504 — MVP

AI Tutor

Priority: Critical

Dependencies: MM-502

Deliverables

- `POST /api/tutor` route: takes exercise_id + a student question, returns a tutor response
- Minimal chat UI within the practice session for asking the tutor a question
- A basic response check that flags/rejects a response if it appears to hand over the exercise's exact final answer directly — a lightweight guard, not the full Response Validator stage from MM-ARC-001 (that hardening is deferred past MVP)

Definition of Done

- A student can ask the tutor for help on the current exercise and receives a reasoning-focused response, not the bare final answer, on at least 5 manually reviewed sample interactions
- format:check, typecheck, lint, test, build all pass

---

## MM-505

Hint Generator

---

# Epic 7 — Analytics

## MM-600

Student Dashboard

---

## MM-601

Teacher Dashboard

---

## MM-602

Parent Dashboard

---

## MM-603

Mastery Analytics

---

# Epic 8 — Administration

## MM-700

Admin Dashboard

---

## MM-701

Feature Flags

---

## MM-702

Audit Logs

---

## MM-703

System Settings

---

# Epic 9 — Production

## MM-800

Performance Optimization

---

## MM-801

Accessibility Audit

---

## MM-802

Security Audit

---

## MM-803

Load Testing

---

## MM-804

Launch Checklist

---

# Workflow

Backlog

↓

Sprint

↓

Development

↓

Testing

↓

Review

↓

Merge

↓

Deploy

---

# Definition of Ready

A task is ready when:

- Requirements documented
- Dependencies identified
- Acceptance criteria written
- Architecture approved

---

# Definition of Done

- Code complete
- Tests passing
- Documentation updated
- CI passing
- Reviewed
- Merged

---

# Changelog

## Version 1.0

- Initial backlog: all epics and tickets titled; only Epic 1 (Foundation) fully scoped.

## Version 1.1

- Added MVP Scope section identifying 12 tickets (MM-100, 101, 104, 200, 203, 204, 300, 301, 500, 501, 502, 504) as the minimum slice to validate MM-VSN-001's core value proposition.
- Fully scoped those 12 tickets with Priority, Dependencies, Deliverables, and Definition of Done.
- All other Epic 2-9 tickets remain title-only placeholders, explicitly deferred rather than forgotten — see MVP Scope section for the full deferred list and rationale.

## Version 1.2

- Added the MVP Execution Rule: once an MVP scope document is approved, tasks must be implemented only to the scope it requires unless explicitly marked MVP-required; deferred capabilities are not pulled in for implementation convenience; expanding MVP scope requires updating and re-approving the MVP scope document.
- Clarified MM-104's role enum: `student` is the only functional role in MVP; `parent`/`admin` values may exist in the schema for forward compatibility but have no feature surface until their own phase, resolving an inconsistency with `MM-MVP-001`'s student-only MVP scope.
- Added a cross-reference from the MVP Scope section to `MM-MVP-001-mvp-definition.md` as the authoritative source of MVP scope.

## Version 1.3

- Corrected the MVP Scope purpose statement: it previously claimed MVP validates "mastery-based progression," but mastery scoring/knowledge decay/adaptive difficulty is Phase 3 and fully deferred past MVP. Reworded to what MVP actually validates — context-aware AI tutoring using real-time practice context.
- Renamed MM-104 from "RBAC" to "Student Role & Authorization Foundation" — its MVP deliverables (one functional role, self-row RLS) do not constitute a Role-Based Access Control system, and the old name risked scope creep under the MVP Execution Rule.
- Renamed MM-200 from "Course CRUD" to "Course Foundation" — its own deliverables explicitly exclude Create/Update/Delete UI for MVP, so "CRUD" misdescribed the ticket.
- Added a `description` column to the `concepts` table in MM-203 — MM-501 (Context Builder) depends on "the concept's description," which the schema did not previously define.
