# Prozync OfficeOS — System Architecture

Internal company platform for Prozync Innovations. This document defines the
system architecture that the database schema (`schema.prisma`) and all future
modules are built on top of.

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                        │
│   Next.js 16 App Router · TypeScript · Tailwind · shadcn/ui      │
│   Framer Motion · React Query (server state) · Zustand (UI state)│
└───────────────┬─────────────────────────────┬───────────────────┘
                │ HTTPS (REST/JSON)            │ WebSocket
                ▼                             ▼
┌─────────────────────────────┐   ┌───────────────────────────────┐
│   API Layer (NestJS)        │   │  Real-time Gateway (Socket.IO)│
│   - REST controllers        │   │  - Chat, notifications        │
│   - Guards (RBAC, JWT)      │   │  - Presence, live task boards  │
│   - Interceptors (audit log)│   │  - SSE fallback for streams   │
└───────────────┬─────────────┘   └───────────────┬───────────────┘
                │                                 │
                ▼                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Domain / Service Layer                       │
│  Auth · RBAC · Employees · Recruitment · Projects · Tasks       │
│  DailyUpdates/Points · CRM · Finance · GitHub Sync · Client      │
│  Portal · Knowledge Base · Notifications · AI Assistant         │
└───────────────┬─────────────────────────────┬───────────────────┘
                │                             │
                ▼                             ▼
┌───────────────────────────┐   ┌───────────────────────────────────┐
│  PostgreSQL (Neon/Supabase)│   │  External Integrations            │
│  via Prisma ORM            │   │  - GitHub API/Webhooks             │
│                            │   │  - Cloudinary (images)             │
│                            │   │  - S3 / R2 (documents)             │
│                            │   │  - Resend (email) / FCM (push)     │
│                            │   │  - Google OAuth                    │
└───────────────────────────┘   └───────────────────────────────────┘
```

**Why NestJS over plain Express:** this system has 14 roles, ~20 modules, and
cross-cutting concerns (RBAC guards, audit logging, validation) on almost
every endpoint. NestJS's module/provider/guard structure keeps that
manageable at scale; plain Express would turn into an unmaintainable pile of
middleware within a few months. Recommend NestJS.

**Monorepo layout (Turborepo):**
```
prozync-officeos/
├── apps/
│   ├── web/          # Next.js 16 frontend
│   └── api/           # NestJS backend
├── packages/
│   ├── db/            # Prisma schema + client (shared)
│   ├── types/          # Shared TS types/DTOs
│   ├── ui/             # Shared shadcn/ui components
│   └── config/         # ESLint/TS config
└── turbo.json
```

---

## 2. Auth & RBAC Design

**Authentication:**
- JWT access token (short-lived, 15 min) + refresh token in HttpOnly, Secure,
  SameSite=Strict cookie.
- Google OAuth for company Google Workspace accounts (fast onboarding).
- Email OTP as a fallback / for clients who don't have Google Workspace.
- TOTP-based 2FA (e.g. `otplib`) optional per-role, **mandatory** for Super
  Admin, Company Admin, Finance.

**RBAC — hybrid role + permission model** (not just an enum), because you
have 14 roles and will inevitably want per-user exceptions (e.g. a Developer
who's temporarily also acting QA):
- `Role` — the 14 named roles, seeded once.
- `Permission` — fine-grained actions, e.g. `project:create`, `finance:view`,
  `salary:view:own`, `salary:view:all`.
- `RolePermission` — default permission set per role.
- `UserPermissionOverride` — per-user allow/deny that overrides the role
  default (covers exceptions without creating a new role each time).
- A `Guard` at the NestJS layer resolves effective permissions once per
  request and caches on the request context.

**Row-level scoping**, on top of RBAC, matters a lot here:
- A Developer sees only tasks assigned to them or their team.
- A Client sees only their own projects/invoices.
- A Team Lead sees their team's data; a Company Admin sees everything.
This is enforced in the service layer via scoped Prisma queries (e.g.
`where: { OR: [{ assigneeId: userId }, { project: { teamId: user.teamId } }] }`),
not just hidden in the UI.

---

## 3. Daily Update & Points System

Kept as its own module (`DailyUpdate`, `PointsLedger`) rather than bolting
points onto `User` directly, because:
- You need a full audit trail (why did someone gain/lose points, when).
- Monthly rank/leaderboard queries need to aggregate over a date range, not
  just read a running total.
- `PointsLedger` is an append-only event log; a nightly job (or on-write
  trigger) recomputes a cached `MonthlyScore` for fast dashboard reads.

Point events map directly to the rules you gave (submitted update +1, missed
-5, task completed +10, etc.) — each is a row in `PointsLedger` with a
`reason` enum and a reference to the source entity (task id, meeting id...).

---

## 4. GitHub Integration

- GitHub App (not just a personal access token) installed on the Prozync
  GitHub org, so it works across all repos without per-user tokens.
- Webhooks (`push`, `pull_request`, `check_run`, `deployment_status`) land on
  a dedicated endpoint, get verified (HMAC signature), and update
  `Repository`, `PullRequest`, `Commit`, `Deployment`, `BuildLog` tables.
- Tasks link to PRs via a `githubPrUrl` field or a join table
  (`TaskPullRequest`) if a task can span multiple PRs.

---

## 5. Real-Time Layer

- **Socket.IO** for anything bidirectional and persistent: chat, presence,
  live Kanban board updates, live notification badges.
- **SSE** for one-way streams where a full socket is overkill: e.g. AI
  Assistant streaming a generated report, build log tailing.
- Socket auth via the same JWT, verified on connection handshake.

---

## 6. Storage

- **Cloudinary** — profile photos, task screenshots, any image needing
  on-the-fly transforms/resizing.
- **S3 / Cloudflare R2** — documents (contracts, offer letters, invoices,
  employee documents). R2 recommended over S3 for this use case: no egress
  fees, S3-compatible API, cheaper at this scale.
- All document rows store the object key + a `visibility` flag; signed URLs
  are generated on request rather than making buckets public.

---

## 7. AI Assistant

Implemented as a service that composes context from existing tables
(tasks, daily updates, projects, KB articles) and calls an LLM:
- "Summarize daily work" → pulls `DailyUpdate` rows for a date range, feeds
  to the model.
- "Answer company policy questions" → RAG over `KnowledgeBase` articles
  (pgvector extension on the same Postgres instance is enough at this scale
  — no need for a separate vector DB).
- Kept as its own service so the LLM provider can be swapped without
  touching other modules.

---

## 8. Security Checklist

| Concern | Approach |
|---|---|
| RBAC | Role + permission + override model (above) |
| 2FA | TOTP, mandatory for high-privilege roles |
| Audit logs | Append-only `AuditLog` table, written via interceptor on every mutating request |
| Session management | `Session` table (not just stateless JWT) so sessions can be listed/revoked per device |
| Device history | `DeviceLogin` table: IP, user agent, location (coarse), timestamp |
| IP restriction | Optional allow-list per company/role, enforced in a guard |
| Encrypted file storage | Server-side encryption on R2/S3 bucket (SSE-KMS) |
| Backups | Automated daily Postgres snapshots (Neon/Supabase built-in) + weekly export to R2 |

---

## 9. Suggested Build Order

1. Auth + RBAC + User/Employee core (foundation everything else needs)
2. Project Management + Task Management + Daily Updates/Points (daily-use core)
3. Client Portal (thin slice, since clients touch this directly)
4. CRM + Finance
5. Recruitment + HR extras (leave, payroll)
6. GitHub integration + Knowledge Base
7. Communication (chat/video) + AI Assistant
8. Admin Analytics dashboard (needs data from all of the above to be meaningful)

---

See `schema.prisma` in this folder for the full data model covering every
module above.

---

## 10. v2 Additions (post-review)

Incorporating feedback on the first draft — these are additive, no breaking
changes to what was already there:

**Multi-tenancy foresight.** Added a `Company` model as the root aggregate.
Every top-level entity (`User`, `Department`, `Client`, `Lead`, `Deal`,
`Project`, `Invoice`, `Expense`, `Holiday`, `JobOpening`,
`KnowledgeBaseArticle`, `Announcement`, `ChatChannel`) now carries a
`companyId`. Today there's exactly one row in `Company`; the moment you want
to sell OfficeOS to other companies, it's a row-level scoping change in the
service layer, not a schema rewrite. `Company` also holds settings — logo,
theme, timezone, working hours, password policy — so "Company Settings" is
one model, not scattered config.

**Invitation-based onboarding**, replacing "email a temp password": a
`User` row can exist with `passwordHash = null`; a separate `Invitation`
record (token, 24h expiry, role/department/team pre-assigned) is what gets
emailed. The employee sets their own password when they accept it. This is
strictly better security practice than emailing credentials.

**Employee lifecycle**, expanded on `User.status`: `ONBOARDING → ACTIVE →
PROBATION → ON_LEAVE / NOTICE_PERIOD → RESIGNED / TERMINATED`. Pre-hire
stages (Applicant, Interview, Selected) already existed on `Candidate` — no
`User` row exists until someone is actually hired and accepts their
invitation, so the two lifecycles link cleanly at the handoff point.

**Project lifecycle**, expanded on `Project.status`: `DRAFT → PLANNING →
DEVELOPMENT → TESTING → UAT → DEPLOYMENT → MAINTENANCE → COMPLETED`, plus
`ON_HOLD` / `CANCELLED` as side-states reachable from any stage.

**Client pipeline clarity**: `Lead` (not yet a client) is unchanged; when a
deal is won, a `Client` row is created with a new `stage` field —
`PROSPECT → ACTIVE → ARCHIVED` — so "prospect" and "archived" are explicit
states instead of inferred from activity.

**Generic Approval Engine**: `ApprovalRequest` + `ApprovalStep` +
`ApprovalPolicy` replace one-off approve/reject logic per module.
`ApprovalPolicy` defines an ordered role chain per `ApprovalType` (e.g.
`LEAVE: [TEAM_LEAD, HR_MANAGER]`); `LeaveRequest`, `Expense`, the new
`Timesheet` and `PurchaseRequest` models, and `PromotionRequest` each hold an
optional `approvalRequestId` and route through the same engine. One place to
add a new approval type, one place to fix a bug in approval logic.

**Multi-channel notifications**: `Notification.channels` (in-app, email,
push, and Slack/WhatsApp as future placeholders) plus a
`NotificationPreference` table for per-user, per-type opt-in/out on top of
company-wide defaults.

**Richer audit log**: `AuditLog` now stores `beforeValue`/`afterValue` JSON
snapshots plus parsed `browser`/`device` in addition to the raw user agent —
this is what actually makes the log useful for debugging and compliance,
rather than just "something changed."

**Dashboards**: which widgets a role sees by default is a frontend/RBAC
concern, not a new set of tables — the existing Role + Permission model
already drives that. Added a lightweight `DashboardWidgetPreference` table
only for per-user customization (hide a widget, reorder) on top of the role
default.

**Org structure**: `Company → Department → Team → User` (with `Team.lead`)
was already the shape of the original schema — no change needed there
beyond hanging `Department` off `Company`.
You are acting as a team consisting of:

• Chief Technology Officer (CTO)
• Enterprise Software Architect
• Principal Solutions Architect
• Staff Backend Engineer
• Staff Frontend Engineer
• Product Architect
• Security Architect
• DevOps Architect
• AI Systems Architect
• Database Architect
• Enterprise UX Architect

Your responsibility is NOT to generate code immediately.

Your responsibility is to design the FINAL production architecture for Prozync OfficeOS.

========================================================

CONTEXT

========================================================

I already created the first version of the architecture.

Treat it as Version 1.

Review every section.

Do not rewrite everything.

Instead, improve it into an enterprise-grade Version 2 architecture.

The goal is to build the operating system that will run Prozync Innovations internally.

This platform must be capable of supporting a company with:

• Employees
• HR
• Recruitment
• Engineering
• QA
• DevOps
• Designers
• Sales
• Marketing
• Finance
• Management
• Clients
• Vendors

The architecture should also be future-proof so OfficeOS can later become a commercial SaaS platform without major architectural changes.

========================================================

YOUR TASK

========================================================

Perform a complete enterprise architecture review.

Review every module.

Identify:

• Missing features
• Missing services
• Missing database models
• Missing security
• Missing workflows
• Missing enterprise capabilities
• Missing automation
• Missing integrations
• Missing AI opportunities
• Missing analytics
• Missing scalability improvements

Do NOT remove existing architecture.

Improve it.

========================================================

CORE MODULES

========================================================

Review and improve:

Authentication

Authorization (RBAC)

Permission System

Projects

Tasks

Employees

Departments

Teams

Recruitment

CRM

Clients

Finance

Invoices

Expenses

Payroll

Attendance

Leave Management

Knowledge Base

AI Assistant

Notifications

Chat

Meetings

Calendar

GitHub Integration

Analytics

Admin

Settings

Audit Logs

Company Management

Multi-tenancy

========================================================

ADD ENTERPRISE MODULES

========================================================

If appropriate, design additional modules such as:

Workflow Automation Engine

Approval Center

OKR & Goals

Performance Reviews

Employee Learning Portal

Training

Assets Management

Inventory (internal assets)

IT Help Desk

Incident Management

Procurement

Purchase Requests

Vendor Management

Meeting Minutes

Digital Signatures

Visitor Management

Travel Requests

Timesheets

Resource Planning

Release Management

Deployment Dashboard

Feature Flags

API Keys

Webhooks

Company Wiki

Company Announcements

Employee Recognition

Rewards

Suggestion Box

Company Policies

Compliance Center

Risk Register

Disaster Recovery

Business Continuity

Document Versioning

Advanced Search

Global Command Palette

Enterprise Dashboard

Executive Analytics

Company Health Dashboard

AI Knowledge Hub

AI Workflow Assistant

========================================================

AUTOMATION

========================================================

Design a visual automation engine.

Examples:

IF Employee joins

THEN

Create onboarding tasks

Assign laptop

Notify HR

Notify Manager

Create email

Schedule induction

------------------------------------

IF Project completed

THEN

Notify Client

Generate Invoice

Archive Project

Update Analytics

Award Employee Points

The automation engine should support:

Triggers

Conditions

Actions

Approvals

Schedules

Delays

Retries

========================================================

AI

========================================================

Expand the AI architecture.

The AI should become an intelligent operating assistant.

Examples:

Summarize meetings

Summarize daily updates

Generate sprint reports

Analyze employee workload

Predict project delays

Recommend resource allocation

Generate release notes

Generate documentation

Answer company policy questions

Find documents

Draft emails

Analyze finance trends

Suggest hiring priorities

Surface business insights

The AI should have access only to data the logged-in user is authorized to see.

========================================================

SEARCH

========================================================

Design a global enterprise search.

Search everything:

Employees

Projects

Tasks

Clients

Invoices

Documents

Meetings

Messages

Knowledge Base

Announcements

Assets

Policies

========================================================

REAL-TIME

========================================================

Expand the real-time layer.

Support:

Presence

Live dashboards

Task updates

Kanban synchronization

Notifications

Chat

Meeting status

Typing indicators

AI streaming

Build logs

Deployment logs

========================================================

OBSERVABILITY

========================================================

Design enterprise observability.

Monitoring

Logging

Tracing

Metrics

Audit

Health checks

Background jobs

Queues

Alerts

Performance dashboard

========================================================

SECURITY

========================================================

Review security.

Improve:

2FA

Session Management

Device Management

IP Restrictions

Audit

Encryption

Secrets

Rate Limiting

CSRF

XSS

CSP

API Security

Webhooks

File Security

Least Privilege

Zero Trust principles where appropriate

========================================================

PERFORMANCE

========================================================

Review scalability.

Caching

Queues

Redis

Background Workers

Event Bus

Lazy Loading

Streaming

CDN

Object Storage

Horizontal Scaling

Database Optimization

========================================================

DEVELOPER EXPERIENCE

========================================================

Design the repository for long-term development.

Monorepo

Shared Packages

Component Library

Shared Types

Shared Validation

Feature Modules

Code Generation

Testing Strategy

CI/CD

Migration Strategy

========================================================

DELIVERABLE

========================================================

Produce:

1. Architecture Review

2. Missing Features Report

3. New Module Suggestions

4. Updated System Architecture

5. Updated Folder Structure

6. Updated Database Strategy

7. Updated Security Strategy

8. Updated AI Architecture

9. Updated Automation Architecture

10. Updated DevOps Architecture

11. Updated Scalability Plan

12. Recommended Build Order

13. Version 2 Roadmap

Do not write application code yet.

Focus only on designing the best possible enterprise architecture for OfficeOS.

This architecture should be production-ready, scalable, maintainable, secure, modular, and capable of supporting both Prozync's internal operations and future commercial SaaS expansion.