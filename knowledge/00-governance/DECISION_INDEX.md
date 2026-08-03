# MM-GOV-002 — DECISION_INDEX.md

**Version:** 1.0  
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
| GOV-001 | Project Handbook | Governance | Approved | 1.0 |
| GOV-002 | Decision Index | Governance | Approved | 1.0 |
| ADR-001 | Documentation First Development | Architecture | Approved | 1.0 |
| ADR-002 | Frozen Governance Policy | Governance | Approved | 1.0 |
| ADR-003 | ADR-Based Architecture Changes | Architecture | Approved | 1.0 |
| ADR-004 | Git-Based Source of Truth | Engineering | Approved | 1.0 |
| ADR-005 | Semantic Versioning | Release | Approved | 1.0 |
| ADR-006 | CI Required Before Merge | Engineering | Approved | 1.0 |
| ADR-007 | AI-Assisted Development Policy | Engineering | Approved | 1.0 |
| ADR-008 | Security by Default | Security | Approved | 1.0 |
| ADR-009 | Testing Required for Features | Quality | Approved | 1.0 |
| ADR-010 | Documentation Updated with Code | Documentation | Approved | 1.0 |

---

# Current Frozen Decisions

1. Governance documents are authoritative.
2. Architecture changes require an approved ADR.
3. Documentation is maintained alongside code.
4. Semantic Versioning is mandatory.
5. Pull requests require review and passing CI.
6. AI contributions follow project standards and never override approved governance.
7. Security, testing, and documentation are Definition of Done requirements.

---

# Decision Review Process

1. Identify need.
2. Draft ADR.
3. Technical review.
4. Architecture approval.
5. Update Decision Index.
6. Implement.
7. Verify compliance.

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
- ADR Collection
- Product Requirements Document
- System Architecture Documentation

---

# Version History

## Version 1.0

- Initial decision catalog established.
- Governance baseline frozen.
- ADR indexing process approved.
