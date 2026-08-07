# Contributing to MathMind

Thank you for contributing to MathMind.

This repository follows the project's approved governance documents. Contributors are expected to follow all approved Architecture Decision Records (ADRs), the Project Handbook, Database Standards, and the Implementation Plan.

## Guiding Principles

* Architecture is governed by approved ADRs.
* Production code only—no placeholder implementations.
* Prioritize readability, maintainability, security, and scalability.
* Keep implementation and documentation synchronized.
* All changes should be traceable to an approved requirement or implementation task.

## Technology Stack

* Next.js
* TypeScript
* Supabase
* PostgreSQL
* Tailwind CSS
* shadcn/ui
* Vercel

## Getting Started

1. Clone the repository.
2. Install dependencies.
3. Copy `.env.example` to `.env.local`.
4. Configure the required environment variables.
5. Start the development server.

## Branch Strategy

Create feature branches from the default branch.

Example:

* `feature/authentication`
* `feature/student-dashboard`
* `fix/login-timeout`
* `docs/update-handbook`
* `chore/dependency-updates`

Do not commit directly to the default branch unless explicitly authorized.

## Commit Messages

Use Conventional Commits.

Examples:

* `feat(auth): add email login`
* `fix(api): handle expired session`
* `docs: update implementation guide`
* `refactor(db): simplify query builder`
* `test(auth): add integration tests`

## Pull Requests

Every pull request should:

* reference the implementation task
* include a clear description
* pass all CI checks
* update documentation when behavior changes
* avoid unrelated changes
* receive at least one review before merge

## Code Standards

* Strict TypeScript
* ESLint with zero errors
* Consistent formatting
* No dead code
* No duplicated logic
* Prefer reusable components
* Keep files focused on a single responsibility

## Testing Expectations

New features should include appropriate tests.

At minimum:

* unit tests for business logic
* integration tests for APIs
* end-to-end tests for critical user flows where applicable

## Database Changes

Database modifications must:

* follow DB-000
* use migrations
* preserve backward compatibility unless otherwise approved
* include rollback considerations

## Documentation

Update documentation whenever you modify:

* architecture
* APIs
* database schema
* environment variables
* deployment
* developer workflow

## Security

Never commit:

* secrets
* API keys
* production credentials
* `.env.local`

Report security issues privately rather than through public issues.

## Definition of Done

A task is complete when:

* implementation is finished
* tests pass
* lint passes
* types compile successfully
* documentation is updated
* CI succeeds
* reviewer approval is obtained
