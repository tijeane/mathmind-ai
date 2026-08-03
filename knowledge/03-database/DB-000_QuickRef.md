# DB-000 — Quick Reference (v1.2)

| Field | Value |
|-------|-------|
| Version | 1.2 |
| Status | Frozen for MathMind v1.x (ADR + Architect approval required to change) — condensed companion to the full DB-000 standard |
| Owner | Engineering |

> This is a **condensed pointer**, not a substitute. Every heading below corresponds to a full section in `DB-000.md`. If a rule here seems incomplete, the full document is authoritative — this file exists for fast lookup during day-to-day development, not for governance decisions.

---

## Purpose & Objectives
Single source of truth, data integrity, student privacy, cloud-native scalability, AI-ready design, consistent engineering standards. *(Full: Purpose, Objectives)*

## Technology Baseline
PostgreSQL + Supabase, UTF-8, UUID (`gen_random_uuid()`), `TIMESTAMPTZ` (UTC only), RLS, transactional migrations, PITR backups.

## Naming
- Tables: plural `snake_case` (`users`, `attempts`).
- Columns: `snake_case`; FKs end `_id`.
- Common columns: `id`, `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`.
- Object prefixes: `pk_` `fk_` `uq_` `chk_` `idx_` `vw_` `fn_` `trg_`, format `<prefix>_<table>_<column>`.

## Schema Organization
`public/` holds domain tables (`users`, `organizations`, `courses`, `modules`, `lessons`, `problems`, `attempts`, `progress_records`, `assessments`, `ai_sessions`, `analytics_events`, `audit_logs`); separate `migrations/`, `views/`, `functions/`, `seed/`.

## Data Classification
Tier 0 public content · Tier 1 metadata · Tier 2 PII (email, name, DOB) · Tier 3 education records (attempts, mastery, AI transcripts). **Tier 2/3 require RLS; Tier 3 also requires audit logging and retention limits.**

## FERPA / COPPA
K–8 audience → guardian role, student ownership, consent tracking, audit logging, secure retention. `consent_records` table is a planned Identity-domain addition for verifiable parental consent — **not yet built; treat as an open dependency**, not a completed control.

## Multi-Tenant RLS
Tenant isolation via RLS + helper functions + RBAC. Never reference another RLS-protected table directly inside a policy — always go through:
```
security.is_org_member()
security.is_org_admin()
security.is_guardian()
security.has_permission()
```
(SECURITY DEFINER, STABLE — prevents recursive policy evaluation.)

## Soft Deletes
Use `deleted_at`; query `vw_<table>_active` views, not base tables. Base tables are for admin tooling only.

## Keys, Relationships & FK Policy
UUID PKs, FKs required, junction tables for M:M, no orphans. Default `ON DELETE RESTRICT`; `CASCADE` only on junction tables; `SET NULL` only for optional ownership — every exception documented.

## Indexing
Index PKs, FKs, filtered/join/sort columns, business identifiers. Review against production metrics; avoid duplicate/unused/low-cardinality-boolean indexes.

## JSONB Policy
Allowed only for genuinely schema-variable data (`ai_sessions.context`, `problems.variant_data`). Never for FKs, memberships, permissions, or frequently-queried fields. Every JSONB column needs a documented shape and still falls under Data Classification if it holds Tier 2/3 data.

## Migration Policy
One migration per schema change, immutable once applied, rollback documented, staging-tested, reviewed before production. No manual production edits.

## Security Standards
TLS, RLS, least privilege, encrypted backups, secrets outside Git, audit logging.

## Performance Standards
Avoid N+1, paginate, monitor slow queries, optimize before scaling hardware.

## Backup & Recovery
Daily backups + PITR; a backup isn't valid until a restore has been verified.

## Audit Logging
Logs: login, permission changes, student progress changes, admin actions, AI moderation events. Audit history is immutable.

## Data Quality
`NOT NULL`, `CHECK`, `UNIQUE`, FK constraints — application validation supplements these, never replaces them.

## Testing
Migration tests, constraint validation, seed validation, relationship tests, performance validation, restore testing.

## Definition of Done
Migration created → reviewed → tested → security-reviewed → performance-verified → documented → CI passing.

## Versioning
Semantic: **Major** = breaking governance change · **Minor** = new approved standard · **Patch** = clarification.

---

## Appendix Index (full detail lives in DB-000.md)

| Appendix | Contents |
|---|---|
| A | Approved types: UUID, TEXT, CITEXT, BOOLEAN, INTEGER, BIGINT, NUMERIC(p,s), JSONB, DATE, TIMESTAMPTZ, INTERVAL, BYTEA (rare), UUID[] (rare). Disallowed: VARCHAR (w/o justification), TIMESTAMP w/o TZ, MONEY, SERIAL/BIGSERIAL, XML, HSTORE. |
| B | Standard column snippets: PK, audit columns, email (`CITEXT` + unique), status (`TEXT` + `CHECK` or enum), boolean flags (`NOT NULL DEFAULT`), metadata (JSONB, policy-compliant). |
| C | Canonical `CREATE TABLE` template — every table follows this shape unless an ADR documents an exception. |
| D | Migration checklist — schema / security / operations / performance, all must pass. |
| E | RLS checklist — enabled, full CRUD policies, helper functions used, no recursion, tenant isolation verified. |
| F | Indexing checklist — PK/FK/filter/join/sort columns; composite index guidance; anti-patterns to avoid. |
| G | Review checklist — design, security, performance, operations, documentation. |
| H | Lifecycle — Proposal → Architecture Review → Migration → Code Review → Testing → Staging → Production → Monitoring → Maintenance → Deprecation → Removal. |
| I | Quality gates — engineering, testing, security, documentation; all required to merge. |
| J | Engineering quick reference — the condensed cheat-sheet form of naming/type rules above. |
| K | SQL Style Guide — lowercase keywords, one-clause-per-line formatting, alias conventions, CTE-over-nesting guidance, explicit `begin`/`commit` transactions, migration filename format (`<timestamp>_<verb>_<object>.sql`), comment conventions, disallowed patterns (`select *`, implicit joins). |

---

**When in doubt, the full `DB-000.md` governs.** This file is for lookup speed, not for resolving ambiguity.
