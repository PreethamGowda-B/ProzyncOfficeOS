# Prozync OfficeOS

Internal operating system for Prozync Innovations. See `ARCHITECTURE.md` for
the system design and `packages/db/schema.prisma` for the full data model.

## What's scaffolded so far

- `packages/db` — Prisma schema + client, shared by the API. Includes a seed
  script that creates the Company row, all 14 roles, and a Super Admin.
- `backend` — NestJS backend API.
- `frontend` — Next.js frontend application.

## Local setup

1. **Database**: create a Postgres database (Neon, Supabase, or local), copy
   `backend/.env.example` → `backend/.env` and set `DATABASE_URL`.
2. **Install**:
   ```
   npm install
   ```
3. **Generate the Prisma client & run the first migration**:
   ```
   npm run db:generate
   npm run db:migrate --workspace=@prozync/db -- --name init
   ```
4. **Seed the Company, roles, and Super Admin**:
   ```
   npm run --workspace=@prozync/db seed
   ```
5. **Run both apps** (two terminals):
   ```
   npm run dev:api
   npm run dev:web
   ```
6. Copy `frontend/.env.local.example` → `frontend/.env.local`.
7. Open http://localhost:3000 and sign in with the seeded Super Admin
   (`SEED_SUPER_ADMIN_EMAIL` / `SEED_SUPER_ADMIN_PASSWORD` from your `.env`,
   defaults to `founder@prozync.com` / `ChangeMe123!` — change this before
   using it for anything real).

## Note on invitations

`POST /auth/invite` currently logs the invitation link to the API console
instead of emailing it (no email provider is wired up yet — see
`AuthService.createInvitation`). Copy that link to test the accept-invitation
flow until Resend (or your provider of choice) is connected.
