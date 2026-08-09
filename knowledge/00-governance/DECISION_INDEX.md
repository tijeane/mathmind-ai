# MM-GOV-002 — DECISION_INDEX.md

**Version:** 1.1
**Status:** Approved
**Owner:** Engineering

---

# Purpose

The Decision Index is the authoritative catalog of all approved architectural and governance decisions for the MathMind project. It provides a single location to discover, track, and reference decisions that shape the system.

---

# Decision Governance

- Only **Approved** decisions are considered authoritative.
- Superseded decisions remain archived for historical traceability.
- Every architectural change must reference an ADR.
- Governance documents take precedence over implementation details.

---

# Decision Lifecycle

| Status | Meaning |
|---------|---------|
| Proposed | Draft under discussion |
| In Review | Formal review in progress |
| Approved | Official project direction |
| Implemented | Reflected in production code |
| Superseded | Replaced by a newer decision |
| Rejected | Not adopted |

---

# Decision Catalog

| ID | Title | Category | Status | Version |
|----|-------|----------|--------|---------|
| GOV-001 | Project Handbook | Governance | Approved | 1.1 |
| GOV-002 | Decision Index | Governance | Approved | 1.1 |
| ADR-001 | Technology Stack | Architecture | **Superseded by ADR-005** | 1.0 |
| ADR-002 | Frozen Governance Policy | Governance | Approved | 1.0 |
| ADR-003 | Branching & Release Strategy | Engineering | Approved | 1.0 |
| ADR-004 | Repository Structure & Organization | Repository Architecture | Approved | 1.0 |
| ADR-005 | Technology Stack & Core Platform | Architecture | Approved | 1.0 |
| ADR-006 | Database Strategy & Data Architecture | Architecture | Approved | 1.0 |
| ADR-007 | AI Collaboration & Development Policy | Engineering | Approved | 1.0 |
| ADR-008 | Testing & Quality Assurance Strategy | Quality | Approved | 1.0 |
| ADR-009 | Continuous Integration, Continuous Deployment & Release Pipeline | Engineering | Approved | 1.0 |
| ADR-010 | Versioning & Release Management | Release | Approved | 1.0 |
| ADR-011 | Documentation First Development | Architecture | Proposed | 1.0 |
| ADR-012 | ADR-Based Architecture Changes | Architecture | Proposed | 1.0 |

> **Correction note (v1.1):** Prior versions of this catalog listed titles for ADR-001 through ADR-010 that did not match the actual content of those files (e.g. ADR-001 was listed as "Documentation First Development" but the file contains "Technology Stack"). This version reflects the real, approved file contents. The two concepts the old catalog assumed existed under ADR-001 and ADR-003 — Documentation First Development and the ADR change-management process — were never actually written under any number. They are now captured as new ADR-011 and ADR-012, both **Proposed**, pending Engineering/Architect approval. ADR-001 is retained unmodified for historical traceability, per the "ADRs are sequentially numbered and never deleted" rule, and its status is updated to Superseded since ADR-005 covers the same Technology Stack decision more completely.

---

# Current Frozen Decisions

1. Governance documents are authoritative.
2. Architecture changes require an approved ADR.
3. Documentation is maintained alongside code.
4. Semantic Versioning is mandatory (ADR-010).
5. Pull requests require review and passing CI (ADR-003, ADR-009).
6. AI contributions follow project standards and never override approved governance (ADR-007).
7. Security, testing, and documentation are Definition of Done requirements (ADR-008).

---

# Decision Review Process

1. Identify need.
2. Draft ADR.
3. Technical review.
4. Architecture approval.
5. Update Decision Index.
6. Implement.
7. Verify compliance.

This process is formalized in ADR-012 (Proposed).

---

# Ownership

| Area | Owner |
|------|-------|
| Governance | Engineering |
| Architecture | Chief Architect |
| Code Quality | Engineering Lead |
| Security | Engineering |
| Documentation | Engineering |

---

# Cross References

- MM-GOV-001 — PROJECT_HANDBOOK.md
- ADR Collection (`knowledge/02-architecture/adr/`)
- Product Requirements Document
- System Architecture Documentation

---

# Version History

## Version 1.0

- Initial decision catalog established.
- Governance baseline frozen.
- ADR indexing process approved.

## Version 1.1

- Corrected ADR-001 through ADR-010 titles to match actual file contents.
- Marked ADR-001 as Superseded by ADR-005 (duplicate Technology Stack decision).
- Added ADR-011 (Documentation First Development) and ADR-012 (ADR-Based Architecture Changes) as Proposed — these concepts were referenced throughout the knowledge base but never actually written.