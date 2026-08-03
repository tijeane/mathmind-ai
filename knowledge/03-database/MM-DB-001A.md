# MM-DB-001A
# Database Schema Specification

| Field | Value |
|-------|-------|
| Status | Approved |
| Version | 1.0 |
| Date | 2026-08-03 |
| Owner | Engineering |
| Category | Database Schema |

---

# Executive Summary

This document defines the logical and physical database design for the MathMind platform.

It translates the architectural principles established in:

- DB-000 — Database Architecture & Standards
- ADR-006 — Database Strategy
- MM-ARC-001 — System Architecture

into an implementation-ready schema.

---

# Objectives

The schema is designed to provide:

- Data integrity
- Scalability
- Performance
- Security
- Auditability
- AI readiness
- Analytics support

---

# Database Domains

The schema is divided into independent business domains.

```text
Identity

Learning

Practice

Assessment

AI

Analytics

Administration
```

Each domain owns its own entities.

---

# Identity Domain

## users

Primary entity representing authenticated users.

Columns:

- id
- email
- first_name
- last_name
- avatar_url
- role
- status
- created_at
- updated_at

---

## organizations

Schools and institutions.

---

## organization_members

Maps users to organizations.

---

## roles

Defines platform roles.

---

## permissions

Permission catalog.

---

## role_permissions

Many-to-many mapping.

---

# Learning Domain

## courses

Represents complete learning paths.

---

## modules

Logical course sections.

---

## lessons

Individual instructional units.

---

## concepts

Smallest teachable concept.

---

## exercises

Practice questions.

---

## exercise_options

Multiple-choice answers.

---

## exercise_solutions

Canonical solutions.

---

# Practice Domain

## practice_sessions

Tracks student practice.

---

## attempts

Individual exercise attempts.

---

## hints

Generated hints.

---

## mastery

Mastery score per skill.

---

## recommendations

Personalized recommendations.

---

# Assessment Domain

## assessments

Formal evaluations.

---

## assessment_questions

Question mapping.

---

## assessment_attempts

Student attempts.

---

## assessment_results

Scores.

---

# AI Domain

## ai_sessions

Conversation sessions.

---

## ai_messages

Individual exchanges.

---

## ai_feedback

Student ratings.

---

## prompt_templates

Reusable prompts.

---

# Analytics Domain

## events

Application events.

---

## metrics

Aggregated metrics.

---

## dashboards

Dashboard configuration.

---

# Administration

## feature_flags

Runtime feature control.

---

## audit_log

Administrative audit history.

---

## system_settings

Global configuration.

---

# Common Columns

Every major table includes:

```text
id UUID

created_at

updated_at
```

Optional:

```text
deleted_at

created_by

updated_by
```

---

# Relationships

Example:

```text
User

↓

Enrollment

↓

Course

↓

Module

↓

Lesson

↓

Exercise

↓

Attempt

↓

Mastery
```

Foreign keys are required.

---

# Naming Conventions

Tables

snake_case

Columns

snake_case

Foreign Keys

entity_id

Indexes

idx_table_column

Constraints

fk_table_reference

---

# Row-Level Security

RLS policies apply to:

- users
- progress
- attempts
- assessments
- ai_sessions

Students access only their own records.

Teachers access assigned learners.

Administrators have elevated permissions.

---

# Index Strategy

Indexes exist for:

- foreign keys
- created_at
- user lookups
- lesson lookups
- course lookups
- assessment queries
- AI conversations

---

# Constraints

Examples:

Unique email

Positive scores

Required foreign keys

Valid status values

Valid mastery ranges

---

# Migrations

Every schema change requires:

Migration

↓

Review

↓

Testing

↓

Deployment

↓

Verification

No manual production edits.

---

# Seed Data

Initial seed includes:

Roles

Permissions

Sample curriculum

Feature flags

Administrative settings

---

# Backup

Production:

Daily backups

Point-in-time recovery

Restore testing

---

# Performance

Optimization priorities:

Efficient indexes

Pagination

Connection pooling

Query optimization

Monitoring

---

# Security

Database security includes:

TLS

RLS

Least privilege

Audit logging

Encrypted backups

---

# Testing

Database testing includes:

Migration tests

Constraint tests

Relationship tests

Seed validation

Performance validation

---

# Future Extensions

Future entities include:

Badges

Certificates

Learning paths

Collaborative classrooms

Voice tutoring

Offline synchronization

Curriculum mapping

---

# Related Documents

DB-000

ADR-006

MM-ARC-001

API-001

---

# Changelog

## Version 1.0

- Initial database schema specification approved.