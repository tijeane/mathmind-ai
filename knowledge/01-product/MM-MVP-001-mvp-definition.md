# MM-MVP-001
# MathMind MVP Definition

| Field | Value |
|-------|-------|
| Status | Approved |
| Version | 1.0 |
| Date | 2026-08-09 |
| Owner | Product |
| Category | Product Scope |

---

# Purpose

`IMPLEMENTATION_PLAN.md` defines the full Version 1.0 roadmap across Phases 0–8 — the complete MathMind product. This document defines the Minimum Viable Product (MVP): the smallest slice of that roadmap capable of validating the core value proposition (an AI tutor that explains reasoning and adapts its guidance using the student's real-time practice context) with real learners, before the remaining phases are built out. Mastery-based progression — skill-graph mastery scoring, knowledge decay, adaptive difficulty — is Phase 3 and is not part of what MVP validates.

The MVP corresponds to the **Alpha** release milestone defined in `IMPLEMENTATION_PLAN.md`'s Release Milestones table.

---

# MVP Goal

Validate that an AI tutor can meaningfully help a student learn a math topic by explaining reasoning and responding to practice context, using the smallest possible product surface, before investing in the full feature set.

---

# Target User for MVP

Students only, in a self-directed learning context.

Teacher, parent, and administrator experiences are explicitly out of scope for MVP — see Out of Scope.

---

# In Scope

## Identity & Access

- Email/password registration, login, logout (Supabase Auth)
- Student is the only functional role in MVP. The `role` column/enum may reserve `parent`/`admin` values for forward schema compatibility, but no parent- or admin-facing feature, route, or policy is implemented until its own phase.
- Basic user profile (name, email)

## Content

- One course, hand-authored, covering one to two math topics — not a full course catalog
- A small set of concepts (5-10) per MM-LRN-001's skill-graph model, in prerequisite order — not the full skill graph
- Static concept content: explanation plus worked examples (no Module/Lesson CRUD layer for MVP)

## Practice

- A basic practice loop: question, student answer, correct/incorrect feedback
- Fixed-difficulty or simple rule-based progression — no adaptive difficulty engine, no mastery scoring model

## AI Tutor

- One conversational AI tutoring flow: a student can request a hint or explanation on a practice problem
- Uses the OpenAI API (already configured in the environment) with a single prompt strategy
- No model routing, no prompt management system, no AI moderation pipeline

## Progress

- Minimal attempt history: what was attempted, correct or incorrect, timestamp
- No analytics dashboards, no mastery decay model, no recommendation engine

## Platform

- Deployed on Vercel using the existing CI/CD pipeline (Phase 0 Foundation)
- Baseline security only: authenticated routes, Row-Level Security on Supabase tables, secrets kept out of source control

---

# Out of Scope for MVP

Explicitly deferred to later phases of `IMPLEMENTATION_PLAN.md`:

| Deferred Capability | Full Scope Defined In |
|----------------------|------------------------|
| Organizations, classrooms, Role-Based Access Control | Phase 1 (remainder) |
| Full curriculum/content management system, course catalog, navigation | Phase 2 |
| Adaptive difficulty engine, mastery scoring, knowledge decay | Phase 3 |
| Assessment engine, quizzes, exams, question banks, scoring dashboards | Phase 4 |
| Model routing, prompt management, AI moderation pipeline | Phase 5 |
| Analytics dashboards for students, teachers, and parents | Phase 6 |
| Admin portal, feature flags, audit logs, system settings | Phase 7 |
| Full production hardening (penetration testing, load testing, formal accessibility audit) | Phase 8 |
| Teacher and parent experiences of any kind | — |
| Gamification (streaks, achievements, milestones) | — |
| Multi-language / internationalization support | — |

A light-touch security and accessibility pass (not the full Phase 8 audit suite) is still required before any external user accesses the MVP, per the Definition of Done in `IMPLEMENTATION_PLAN.md`.

---

# Relationship to IMPLEMENTATION_PLAN.md Phases

| Phase | Full Scope | MVP Treatment |
|-------|------------|----------------|
| Phase 0 — Foundation | Full | Complete |
| Phase 1 — Identity & Authentication | Orgs, RBAC, full profiles | Trimmed to student auth and basic profile only |
| Phase 2 — Learning Platform | Full course/module/lesson system | Trimmed to one course, a handful of concepts, no Module/Lesson CRUD |
| Phase 3 — Practice Engine | Adaptive difficulty, mastery tracking | Trimmed to a basic question/answer loop |
| Phase 4 — Assessment System | Full | Deferred entirely |
| Phase 5 — AI Tutor | Gateway, model router, prompt management | Trimmed to a single chat-based hint/explanation flow |
| Phase 6 — Analytics | Full | Deferred entirely |
| Phase 7 — Administration | Full | Deferred entirely |
| Phase 8 — Production Readiness | Full audit suite | Light-touch security/accessibility pass only |

---

# Backlog Traceability

The tickets below, in `IMPLEMENTATION_BACKLOG.md`, implement this MVP scope. This mapping — not convenience during implementation — is what determines which tickets are built now versus deferred; see the MVP Execution Rule in that document.

| MVP Area | Backlog Tickets |
|----------|------------------|
| Identity & Access | MM-100 (Login), MM-101 (Registration), MM-104 (Student Role & Authorization Foundation, student-only functional scope) |
| Content | MM-200 (Course Foundation, read-only), MM-203 (Concept Engine, includes concept description), MM-204 (Exercise Engine) |
| Practice | MM-300 (Practice Session), MM-301 (Attempt Tracking) |
| AI Tutor | MM-500 (AI Gateway), MM-501 (Context Builder), MM-502 (Prompt Builder), MM-504 (AI Tutor) |

Once this document is Approved, per the MVP Execution Rule, these are the only tickets engineering implements until MVP scope is formally revised — all other backlog tickets remain title-only placeholders regardless of how convenient they'd be to build alongside these.

---

# MVP Success Criteria

The MVP is successful when:

- A student can register, log in, and reach a concept without assistance.
- A student can complete a practice problem and receive correct/incorrect feedback.
- A student can request AI help on a problem and receive a coherent, relevant hint or explanation.
- The full flow — registration, concept, practice, AI tutoring — works reliably in production for a small pilot group.
- No P0/P1 security issues exist in the authenticated flow (RLS verified, no exposed secrets).

Detailed metrics and thresholds are tracked separately once a pilot group is defined.

---

# Risks

- **Scope creep** — pressure to build full Phase 1–3 features before validating the core value proposition. Mitigation: treat this document as the frozen MVP boundary until formally revised.
- **AI quality/cost with a single prompt strategy** — acceptable for MVP validation; revisited when Phase 5 is implemented in full.
- **Generic practice experience without adaptive difficulty** — an accepted, explicit trade-off for this discovery phase, not an oversight.

---

# Related Documents

- MM-VSN-001 — Product Vision
- MM-LRN-001 — Learning System Specification
- `IMPLEMENTATION_PLAN.md` — full Phase 0–8 roadmap
- `IMPLEMENTATION_BACKLOG.md` — MVP Scope section and MVP Execution Rule; ticket-level implementation of this document's scope
- ADR-011 — Documentation First Development
- MM-GOV-002 — Decision Index

---

# Changelog

## Version 0.1

- Initial MVP scope drafted: student-only, single-topic, single AI-tutor-flow release, trimmed from the full Phase 1–8 `IMPLEMENTATION_PLAN.md` build-out.

## Version 0.2

- Reconciled against `IMPLEMENTATION_BACKLOG.md` v1.2: clarified that MVP's `role` enum may reserve `parent`/`admin` values for schema forward-compatibility with no functional surface, and replaced "lesson" terminology with "concept" to match the actual course → concept → exercise data model (no Module/Lesson CRUD in MVP).
- Added Backlog Traceability section mapping each MVP area to its implementing ticket IDs.

## Version 0.3

- Reconciled against `IMPLEMENTATION_BACKLOG.md` v1.3: replaced "AI-adaptive" / "adaptive explanation" wording (misleading — implies mastery-based/adaptive-difficulty progression, which is Phase 3 and out of MVP scope) with language describing what MVP actually validates: reasoning explanation adapted to real-time practice context.
- Updated Backlog Traceability table for MM-104's and MM-200's renamed titles (Student Role & Authorization Foundation; Course Foundation).

## Version 1.0

- Approved as the frozen MVP scope.
- Implementation is limited to the ticket set defined in the Backlog Traceability section unless this document is formally revised and re-approved.
