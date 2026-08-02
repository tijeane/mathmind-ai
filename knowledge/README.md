# MathMind Knowledge Base

The MathMind Knowledge Base is the authoritative repository for product vision, learning design, engineering standards, and operational documentation. It serves as the single source of truth for cross-functional teams and ensures that decisions, principles, and specifications remain discoverable, versioned, and auditable.

## Purpose

This knowledge base exists to:

- Centralize approved documentation for MathMind Labs
- Provide clear navigation across product, engineering, design, and operations domains
- Establish consistent naming, lifecycle, and cross-referencing standards
- Support onboarding, review cycles, and long-term maintainability

## Folder Numbering Convention

Top-level folders use a two-digit prefix to enforce a stable sort order and reflect the logical hierarchy of MathMind documentation:

| Prefix | Folder        | Domain                          |
|--------|---------------|---------------------------------|
| `00`   | overview      | Orientation and index material  |
| `10`   | vision        | Mission, values, and strategy   |
| `20`   | learning      | Pedagogy and learning design    |
| `30`   | product       | Product requirements and specs  |
| `40`   | engineering   | Architecture and implementation |
| `50`   | ai            | AI tutor and model behavior     |
| `60`   | design        | UX, UI, and design systems      |
| `70`   | operations    | Deployment, support, and ops    |
| `80`   | roadmap       | Milestones and release planning |
| `90`   | decisions     | Architecture and product ADRs   |

Prefixes are spaced in increments of ten to allow future folders to be inserted without renumbering existing content.

## Document Naming Convention

All documents follow the pattern:

```
MM-XXX-001-name.md
```

| Component | Description                                      |
|-----------|--------------------------------------------------|
| `MM`      | MathMind namespace                               |
| `XXX`     | Three-letter domain code (e.g., VSN, LRN, PRD)   |
| `001`     | Sequential document number within the domain     |
| `name`    | Lowercase kebab-case descriptive slug            |

### Examples

- `MM-PER-001-user-personas.md`
- `MM-JRN-001-learning-journey.md`
- `MM-PRD-001-product-requirements.md`
- `MM-AI-001-ai-tutor.md`
- `MM-ARC-001-system-architecture.md`

Each document must include a YAML metadata block at the top specifying Document ID, Title, Version, Status, Owner, and Review Cycle.

## Document Lifecycle

Documents progress through defined states. Status is recorded in the metadata block and updated when the document transitions.

### Draft

Initial authoring phase. Content is incomplete or under active revision. Draft documents may be referenced internally but must not be treated as authoritative.

### Review

Content is complete and submitted for stakeholder review. Reviewers validate accuracy, alignment with approved principles, and cross-references. Feedback is incorporated before approval.

### Approved

The document has passed review and is the current authoritative version. Only Approved documents should be cited in engineering work orders, product decisions, and external communications.

### Archived

Superseded or retired content retained for historical reference. Archived documents must reference the Approved document that replaced them. Archived status does not delete files; it preserves audit history.

## Adding New Documents

1. **Select the target folder** based on domain (see folder numbering above).
2. **Assign a Document ID** using the next available sequence number in the domain code (e.g., `MM-PRD-002` after `MM-PRD-001`).
3. **Create the file** with the naming convention and required metadata block.
4. **Set Status to Draft** during initial authoring.
5. **Submit for Review** when content is complete; update Status accordingly.
6. **Update the folder README** if the new document represents a significant addition to that domain's contents.
7. **Add cross-references** to related documents in other folders where applicable.

## Cross-Referencing Guidelines

- Use relative Markdown links between documents (e.g., `[Mission](../10-vision/MM-VSN-001-mission.md)`).
- Reference documents by Document ID in prose when citing authoritative content (e.g., "Per MM-VSN-001, ...").
- When a document depends on another, include a **Related Documents** section listing linked files with brief descriptions.
- Avoid duplicating content across documents; link to the Approved source instead.
- When superseding a document, update cross-references in dependent files and archive the previous version.

## Versioning Expectations

- **Version format:** Semantic versioning expressed as `MAJOR.MINOR` (e.g., `1.0`, `1.1`, `2.0`).
- **Minor version:** Increment for clarifications, non-breaking additions, or editorial updates that do not change meaning.
- **Major version:** Increment for substantive changes to scope, requirements, or approved principles.
- **Review Cycle:** Defined per document in metadata (e.g., Quarterly, Annually). Owners are responsible for scheduling reviews before the cycle expires.
- **Change history:** Significant revisions should be noted in the document body or in a dedicated revision log when appropriate.

## Folder Index

| Folder | Purpose |
|--------|---------|
| [00-overview](00-overview/) | Orientation and knowledge base navigation |
| [10-vision](10-vision/) | Mission, values, and strategic direction |
| [20-learning](20-learning/) | Learning principles and pedagogy |
| [30-product](30-product/) | Product requirements and specifications |
| [40-engineering](40-engineering/) | Architecture and engineering standards |
| [50-ai](50-ai/) | AI tutor behavior and model documentation |
| [60-design](60-design/) | UX, UI, and design system documentation |
| [70-operations](70-operations/) | Deployment, monitoring, and support |
| [80-roadmap](80-roadmap/) | Milestones, releases, and planning |
| [90-decisions](90-decisions/) | Architecture and product decision records |
