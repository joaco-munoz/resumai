# Architecture

This document describes how ResumAI is put together: its components, boundaries,
data flow, authentication/authorization model, the AI layer, persistence,
document export, and the notable trade-offs.

> TL;DR — ResumAI is a **client-side React SPA** (Vite) whose backend is a
> **Supabase** project (Postgres + Auth + Deno Edge Functions). There is **no
> custom application server**. All privileged logic (AI calls, payments) lives
> in edge functions so secrets never reach the browser.

## Components

```
┌───────────────────────────────────────────────────────────────┐
│ Browser (React SPA, built by Vite)                             │
│  • Pages: Index, Auth, Dashboard, CVBuilder, JobMatcher,       │
│    Kanban, CVsList, Profile, Billing, AdminDashboard, ...      │
│  • State: React Context (Auth, AIUsage, KanbanStats) +         │
│    TanStack Query                                              │
│  • Supabase JS client (VITE_SUPABASE_URL / VITE_SUPABASE_ANON) │
│  • Client-side export: jspdf (PDF), docx + file-saver (Word)   │
└───────────────┬───────────────────────────────────────────────┘
                │  HTTPS (JWT)
                ▼
┌───────────────────────────────────────────────────────────────┐
│ Supabase project                                               │
│  • Auth: email/password + Google OAuth                         │
│  • Postgres: 14 tables, RLS on all, triggers, RPCs             │
│  • Edge Functions (Deno):                                      │
│      AI: improve-cv-content, improve-bullet-point,             │
│          analyze-job-compatibility                             │
│      Payments: create/cancel/check subscription, flow-webhook  │
└───────┬───────────────────────────────────────┬───────────────┘
        │                                        │
        ▼                                        ▼
   AI provider                              Flow.cl API
   (OpenAI / DeepSeek / compatible / mock)  (optional payments)
```

### Frontend (`src/`)
- **`main.tsx` / `App.tsx`** — bootstraps providers (`QueryClientProvider`,
  `BrowserRouter`, `AuthProvider`, `AIUsageProvider`, `TooltipProvider`) and
  declares routes. Public routes: `/`, `/auth`, `/payment-success`. Protected
  routes (`/app/*`) are wrapped in `ProtectedRoute`.
- **`pages/`** — one component per screen.
- **`components/`** — feature components plus `components/ui/` (shadcn/ui).
- **`hooks/`** — data/logic hooks (`useCVBuilder`, `useCVData`, `useCVSaving`,
  `useAIImprovement`, `useFeatureLimits`, `useJobApplications`, …).
- **`contexts/`** — `AuthContext` (session), `AIUsageContext`, `KanbanStatsContext`.
- **`integrations/supabase/`** — the Supabase client (env-driven) and generated
  `types.ts`.
- **`utils/`** — pure helpers, including `pdfUtils.ts` and `wordUtils.ts` (export).

### Backend (`supabase/`)
- **`migrations/`** — versioned SQL. Source of truth for the schema.
- **`functions/`** — Deno edge functions. Shared logic in `functions/_shared/`
  (`ai.ts`, `auth.ts`, `cors.ts`).
- **`config.toml`** — per-function `verify_jwt` settings.
- **`seed.sql`** — fictional demo data applied on `db reset`.

## Boundaries & dependencies

- The browser talks to Supabase **only** through the anon key + the user's JWT.
  RLS is the security boundary for direct table access.
- Anything requiring a secret (AI keys, Flow keys, the service-role key) is
  confined to **edge functions**. The browser never sees these.
- The frontend depends on the database **shape** via generated `types.ts`.
  Keep it in sync with `npm run db:types`.

## Data flow (representative paths)

**Editing & saving a CV**
1. `CVBuilder` uses `useCVBuilder`/`useCVData`/`useCVSaving`.
2. Saves write `cvs.content` (a `jsonb` document — see `src/types/cv.ts`) via
   the Supabase client. RLS (`auth.uid() = user_id`) ensures a user only writes
   their own rows.

**AI improvement**
1. `useAIImprovement` pre-checks the local quota for UX, then calls
   `supabase.functions.invoke('improve-cv-content' | 'improve-bullet-point')`.
2. The edge function authenticates the caller (`getAuthedUser`), enforces the
   **server-side** quota (`can_use_feature`), calls the AI provider through
   `_shared/ai.ts`, records usage (`increment_feature_usage`), and returns text.

**Job matching**
1. `JobMatcher` calls `supabase.functions.invoke('analyze-job-compatibility',
   { jobDescription, cvId })`.
2. The function derives the user from the **verified JWT**, reads the CV under
   the caller's own RLS context (never a client-supplied `userId`), asks the AI
   provider for a structured JSON analysis, validates it, and returns
   `{ score, strengths, missingKeywords, suggestedBullets, improvements }`.

**Export**
- PDF/Word are generated **entirely in the browser** from the CV document. No
  server round-trip; nothing is uploaded.

**Payments (optional)**
- `create-flow-subscription` authenticates the user, creates a Flow payment, and
  records a `pending` subscription. `flow-webhook` (public, `verify_jwt=false`)
  re-queries Flow's `getStatus` API with its own HMAC and, on confirmed payment,
  flips the user to Pro.

## Authentication & authorization

- **Authentication:** Supabase Auth. `AuthContext` tracks the session and
  handles sign-up, sign-in, Google OAuth and sign-out.
- **Route protection:** `ProtectedRoute` gates `/app/*`.
- **Authorization (data):** enforced in Postgres by **Row Level Security** on
  every table, keyed on `auth.uid()`. Admin-only reads use a
  `SECURITY DEFINER` `is_admin()` helper (with a pinned `search_path`).
- **Edge-function authorization:** AI/subscription functions require a valid JWT
  (`verify_jwt=true`) **and** verify the JWT maps to a real user, then apply
  per-user quotas. The Flow webhook is intentionally unauthenticated and
  validates payments by calling Flow back.

## AI layer

`supabase/functions/_shared/ai.ts` is a small, provider-agnostic module:

- `resolveAIConfig(env)` — reads `AI_*` env vars, applies provider presets
  (OpenAI, DeepSeek) or explicit `AI_BASE_URL`/`AI_MODEL` for any
  OpenAI-compatible endpoint, and defaults for temperature/tokens/timeout/retries.
- `createChatCompletion(config, params, fetch?)` — one code path for all real
  providers (they share the OpenAI `/chat/completions` schema), with a timeout
  (`AbortController`), bounded exponential-backoff retries, normalized `AIError`s,
  and a **`mock`** provider that returns deterministic output with no network.

The module has **no Deno-specific or remote imports**, so it is unit-testable
under Node/Vitest with an injected `fetch` — no real API calls, no credits.

## Persistence

- **Postgres** (Supabase). Key tables: `profiles`, `cvs` (CV documents as
  `jsonb`), `job_descriptions`, `cv_job_matches`, `job_applications`,
  `subscriptions`, `payments`, `user_usage`/`feature_usage` (quota), plus
  analytics/admin tables. See [docs/database.md](./docs/database.md).
- **No Supabase Storage buckets** are used; `pdf_url`/`avatar_url` are plain
  text columns (exports are downloaded client-side, not stored).
- **Realtime** is enabled for `cvs` and `profiles`.

## Known trade-offs

- **SPA, not SSR.** Simple to host and reason about, but no server-side
  rendering/SEO for app routes and privileged logic must live in edge functions.
- **Client-enforced UX limits + server-enforced quotas.** The client pre-checks
  limits for responsiveness; the edge functions are the authoritative enforcer.
- **Regional payments.** Flow.cl is Chile-specific; MercadoPago is referenced but
  not implemented. Payments are optional and isolated behind edge functions.
- **Generated `types.ts` can drift.** It must be regenerated after migrations;
  a reconciliation migration was added to make the committed history reproduce
  the schema the app expects.
- **Migrations can't be executed in CI here.** SQL correctness for the
  reconciliation migration/seed should be validated against a real local
  Supabase (`npm run db:reset`).

See [docs/engineering-decisions.md](./docs/engineering-decisions.md) for the
"why" behind these choices.
