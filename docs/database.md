# Database

ResumAI stores its data in the Postgres database that ships with Supabase. The
schema is defined entirely by versioned SQL migrations, isolated per user with
Row Level Security, and reproducible from a single command. This page documents
the database workflow: migrations, the reset/seed cycle, the RLS model, the
reconciliation migration, the demo seed, type generation, and why no Storage
buckets are used.

For install and run instructions see the [README](../README.md); for every
environment variable (including the AI quota RPCs) see
[configuration.md](./configuration.md). This page is complementary and does not
repeat those.

## Migrations

Migrations live in [`supabase/migrations/`](../supabase/migrations) as
timestamped `*.sql` files applied in filename order. The directory contains
thirteen files: twelve original timestamped migrations that build the schema
incrementally (tables, enums, triggers, indexes, RLS policies), plus one
reconciliation migration,
[`20250719000000_reconcile_schema_and_security.sql`](../supabase/migrations/20250719000000_reconcile_schema_and_security.sql),
described [below](#the-reconciliation-migration).

Key structural pieces created by the migrations:

- The `profiles` table is 1:1 with `auth.users` (`profiles.id` references
  `auth.users(id) ON DELETE CASCADE`). A `handle_new_user()` trigger
  (`on_auth_user_created`) inserts the matching `profiles` row automatically
  when a user signs up.
- Every other user-owned table references `profiles(id)`, mostly with
  `ON DELETE CASCADE`, so removing a user removes their data.
- Several `SECURITY DEFINER` helper functions back the app: `is_admin()`,
  `log_user_activity()`, and the quota RPCs `get_user_limits()`,
  `can_use_feature()`, and `increment_feature_usage()`.

To add a change, create a new migration with the Supabase CLI
(`supabase migration new <name>`), edit the generated SQL, then apply it. Do not
edit already-applied migrations; add a new one instead.

## Applying migrations and seed (`db:reset`)

The database npm scripts (see [`package.json`](../package.json)) wrap the
Supabase CLI:

```bash
npm run db:start   # supabase start — boot the local stack (Postgres, Auth, etc.)
npm run db:reset   # supabase db reset — drop, re-apply ALL migrations, then run seed.sql
npm run db:migrate # supabase migration up — apply pending migrations without a reset
npm run db:seed    # supabase db reset — alias; reset + seed
npm run db:stop    # supabase stop
```

`npm run db:reset` is the canonical way to get a clean, fully reproducible
database. It drops the local database, replays every migration in
`supabase/migrations/` from scratch, and then runs
[`supabase/seed.sql`](../supabase/seed.sql) to load the demo data. Because the
migration history is self-contained, a fresh reset always produces the same
schema the application expects.

`npm run db:migrate` applies only new (pending) migrations to an existing
database and does not run the seed — use it to move an existing database forward
without wiping data.

## Tables

Fourteen tables, all with Row Level Security enabled. At a high level:

**Identity**

- `profiles` — one row per authenticated user (1:1 with `auth.users`); name,
  contact, subscription tier, and analytics/profile fields. `avatar_url` is a
  plain text column.

**Core product (CVs and jobs)**

- `cvs` — a user's resumes; `content` is JSONB, `pdf_url` is a plain text
  column (not a Storage reference), plus source/status/favorite flags.
- `job_descriptions` — job postings a user saves or pastes in.
- `cv_job_matches` — AI compatibility results linking a CV to a job (score +
  details), unique per `(cv_id, job_id)`.
- `job_applications` — applications tracked on the Kanban board (CV, job,
  status, notes).
- `job_applications_tracking` — additional application-tracking records.

**Billing**

- `subscriptions` — plan/tier state, including the payment `provider`
  (e.g. `flow`).
- `payments` — payment records, including Flow.cl reference fields written by
  the webhook.

**Usage and quotas**

- `user_usage` — per-user, per-feature monthly usage counters that back the
  `can_use_feature` / `increment_feature_usage` quota RPCs.
- `feature_usage` — per-user feature usage aggregates.

**Analytics and operations**

- `user_activity_logs` — audit trail of user actions.
- `business_metrics` — aggregate daily metrics (MRR/ARR, churn, counts);
  admin-only.
- `nps_responses` — NPS survey responses.
- `admin_users` — the set of admin accounts.

## Row Level Security

RLS is enabled on **all** tables; the Supabase anon key is safe in the browser
precisely because access is enforced by these policies, not by keeping the key
secret. The model is per-user isolation via `auth.uid()`:

- User-owned tables restrict rows with `auth.uid() = user_id` (and
  `auth.uid() = id` for `profiles`), so a user can only read and write their own
  data.
- Some policies are relational: `cv_job_matches` is visible only when the
  referenced `cvs` row belongs to the caller.
- `job_descriptions` additionally exposes active postings (`is_active = true`)
  for read, supporting shared/public job listings.
- Admin-only tables (`business_metrics`, `admin_users`) are gated behind the
  `is_admin()` helper, which is `SECURITY DEFINER` (it bypasses RLS to check
  membership, avoiding policy recursion).

Server-side quota enforcement in the edge functions uses the `can_use_feature`
and `increment_feature_usage` RPCs against `user_usage`; the free-tier limits
and how they are configured are documented in
[configuration.md](./configuration.md#quotas-and-tiers).

## The reconciliation migration

[`20250719000000_reconcile_schema_and_security.sql`](../supabase/migrations/20250719000000_reconcile_schema_and_security.sql)
exists because several columns and RPC functions referenced by the application
(and present in the generated `src/integrations/supabase/types.ts`) were never
created by any committed migration. As a result, a fresh `supabase db reset`
produced a schema that broke features such as the Job Matcher, Flow
subscriptions, and AI usage limits.

This migration makes the migration history self-contained and reproducible, and
also fixes three issues found in the open-source security audit. It:

1. **Adds missing columns** (schema drift): `cvs.cv_source`, `cvs.is_favorite`,
   `cvs.is_primary`; `subscriptions.provider`; and the Flow reference fields
   `payments.flow_token`, `payments.flow_order_number`,
   `payments.flow_payment_date` (plus supporting indexes).
2. **Adds missing RPCs**: `get_user_limits()`, `increment_feature_usage()`, and
   `can_use_feature()`.
3. **Hardens security**: removes the world-readable policy on `business_metrics`
   (which had exposed MRR/ARR/revenue/churn), fixes a self-referential
   `admin_users` policy that caused infinite recursion (now via `is_admin()`),
   and pins a non-mutable `search_path` on the `SECURITY DEFINER` functions.

The whole migration is idempotent (`IF NOT EXISTS` / `OR REPLACE` /
`DROP ... IF EXISTS`), so it is safe to run against both a fresh database and an
existing project.

## Demo seed

[`supabase/seed.sql`](../supabase/seed.sql) runs automatically on every
`npm run db:reset`. It loads **fictional** data only — there is no real personal
data — and creates a demo account for local development:

```
email:    demo@resumai.local
password: demo1234
```

The seed inserts the demo `auth.users` row and email identity, ensures a
`profiles` row, and adds one sample CV, one job description, and one job
application so the app has something to render. It is wrapped in an
exception-safe block: if your local Auth schema differs (GoTrue versions vary),
the seed logs a notice and continues instead of aborting the reset. If the demo
login does not work, just sign up through the app UI.

These credentials are for local development only; never use them for anything
real.

## Regenerating TypeScript types

The frontend is typed against the database schema in
`src/integrations/supabase/types.ts`. Regenerate it after any schema change:

```bash
npm run db:types   # supabase gen types typescript --local > src/integrations/supabase/types.ts
```

This reads from the **local** Supabase stack, so run `npm run db:start` (and
apply your migrations) first. Commit the regenerated file alongside the
migration that changed the schema so the types and the database stay in sync.

## No Storage buckets

ResumAI does **not** use Supabase Storage. There are no buckets to create or
configure. File-like references are stored as plain text columns:

- `cvs.pdf_url` and `profiles.avatar_url` are `text` columns, not links to
  Storage objects.
- PDF and Word export happen entirely client-side (`jspdf` for PDF, `docx` +
  `file-saver` for Word); generated files are downloaded in the browser and
  never uploaded to Storage.

## Data lifecycle and deletion

Because `profiles.id` references `auth.users` with `ON DELETE CASCADE` and the
user-owned tables cascade from `profiles`, deleting a user removes their CVs and
related rows automatically. There is no in-app "delete account" button yet;
account deletion is performed through Supabase Auth admin tooling.
