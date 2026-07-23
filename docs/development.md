# Development guide

This page is the contributor-facing companion to the top-level
[README](../README.md) and [CONTRIBUTING.md](../CONTRIBUTING.md). It explains how
the codebase is laid out, how to run the day-to-day tooling, the coding
standards we follow, how the AI layer is structured, how to add a database
migration, and how to run the test suite without spending a cent on AI credits.

For first-time setup (cloning, `.env`, starting a local Supabase) see
[CONTRIBUTING.md](../CONTRIBUTING.md#development-environment) and
[docs/installation.md](./installation.md). Environment variables are documented
in [docs/configuration.md](./configuration.md) and [`.env.example`](../.env.example).

## Prerequisites

- **Node** `>= 18.18.0` (`.nvmrc` pins `22`) and **npm** (single
  `package-lock.json` — do not introduce another lockfile).
- **Docker** + the [Supabase CLI](https://supabase.com/docs/guides/cli) for a
  local database and for running edge functions locally.

The app is a **Vite 5 + React 18 + TypeScript 5.5** single-page app (not
Next.js). The dev server runs on **port 8080** (see [`vite.config.ts`](../vite.config.ts)),
and `@` is aliased to `src/`.

## Project structure

```
resumai/
├─ src/                         # Frontend SPA (browser)
│  ├─ components/               # React components
│  │  ├─ ui/                    # shadcn/ui primitives (Radix-based)
│  │  ├─ cv-builder/  dashboard/  job-matcher/
│  │  ├─ landing/  onboarding/  profile/  admin/
│  │  └─ *.tsx                  # feature-level components
│  ├─ pages/                    # Route components (react-router-dom 6)
│  ├─ hooks/                    # Reusable logic (useAIImprovement, useFeatureLimits, …)
│  ├─ contexts/                 # React contexts (AuthContext, AIUsageContext, KanbanStatsContext)
│  ├─ integrations/
│  │  └─ supabase/              # client.ts (browser client) + types.ts (generated)
│  ├─ utils/                    # Pure helpers: cvUtils, pdfUtils, wordUtils, dateUtils, kanbanUtils
│  │  └─ __tests__/             # Vitest unit tests for utils
│  ├─ lib/  types/  assets/
│  ├─ App.tsx  main.tsx  index.css
│
├─ supabase/                    # Backend (Postgres + Auth + Edge Functions)
│  ├─ functions/
│  │  ├─ _shared/               # ai.ts, auth.ts, cors.ts (+ ai.test.ts)
│  │  ├─ improve-cv-content/    # AI: professional summary
│  │  ├─ improve-bullet-point/  # AI: experience bullet
│  │  ├─ analyze-job-compatibility/  # AI: CV ↔ job match
│  │  ├─ create-flow-subscription/   # Payments (Flow.cl)
│  │  ├─ cancel-flow-subscription/
│  │  ├─ check-subscription-status/
│  │  └─ flow-webhook/          # Flow payment webhook
│  ├─ migrations/               # *.sql schema migrations (applied in filename order)
│  ├─ seed.sql                  # Fictional demo data (runs on db reset)
│  └─ config.toml               # Local Supabase config (per-function verify_jwt, …)
│
└─ docs/                        # This documentation set
```

Frontend code lives in `src/` and ships to the browser. Anything that needs a
secret (AI keys, service-role key, payment keys) lives **only** in
`supabase/functions/` and never in `src/`. See
[ARCHITECTURE.md](../ARCHITECTURE.md) for the runtime picture.

## Development commands

All scripts are defined in [`package.json`](../package.json). The essentials:

```bash
npm install          # install dependencies (npm only)

npm run dev          # start the Vite dev server on http://localhost:8080
npm run build        # production build (npm run build:dev for a dev-mode build)
npm run preview      # preview the production build locally

npm run lint         # ESLint
npm run typecheck    # tsc --noEmit (no type errors allowed)
npm run test         # Vitest (single run)
npm run format       # Prettier — write
npm run format:check # Prettier — check only
```

Before opening a PR, all of these must pass (CI runs the same set):

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

### Local database commands

These wrap the Supabase CLI and require Docker:

```bash
npm run db:start     # supabase start (local Postgres/Auth/Storage/Functions)
npm run db:stop      # supabase stop
npm run db:reset     # apply all migrations + run seed.sql (demo data)
npm run db:seed      # alias for db:reset (re-applies migrations + seed)
npm run db:migrate   # supabase migration up (apply pending migrations)
npm run db:types     # regenerate src/integrations/supabase/types.ts from the local DB
```

`npm run db:reset` seeds a fictional demo user (`demo@resumai.local` /
`demo1234`) — local only. If the demo login does not work on your Supabase
version, just sign up through the app UI. See [docs/database.md](./database.md).

## Coding standards

- **TypeScript.** Prefer precise types. `@typescript-eslint/no-explicit-any` is
  a **warning** (not an error) during the open-source migration because much of
  the existing `any` comes from generated types and shadcn boilerplate — please
  don't add new `any` to code you touch. `@typescript-eslint/no-unused-vars` is
  currently off. See [`eslint.config.js`](../eslint.config.js).
- **Formatting.** Prettier with `singleQuote`, `semi`, `trailingComma: all`,
  `printWidth: 100`, `tabWidth: 2` (see [`.prettierrc.json`](../.prettierrc.json)).
  Run `npm run format` before committing.
- **ESLint scope.** The browser ESLint config lints `src/`. Deno edge functions
  (`supabase/functions/**`) run in a different runtime and are **ignored** by the
  browser config — they are linted separately with their own tooling.
- **Separation of concerns.** Keep UI (`components/`), domain logic
  (`hooks/`, `utils/`) and infrastructure (`integrations/`,
  `supabase/functions/`) reasonably separated.
- **No secrets in the client.** Anything that needs a secret belongs in an edge
  function, never in `src/`. The browser only ever holds the public
  `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (protected by Row Level Security).
- **Handle all states.** Loading, empty and error states for user-facing views.

## How the AI layer is structured

AI runs **only server-side** in edge functions. API keys never reach the
browser. The flow for an AI feature is:

1. **Browser** calls the edge function via `supabase.functions.invoke(...)`
   (e.g. `src/hooks/useAIImprovement.ts`). It sends CV text and the user's JWT —
   no API key.
2. **Edge function** (e.g. `supabase/functions/improve-cv-content/index.ts`):
   - `getAuthedUser` (`_shared/auth.ts`) verifies the JWT and returns a Supabase
     client scoped to the caller so **RLS applies** to every query.
   - `enforceQuota` calls the `can_use_feature` RPC and rejects with `429` when
     the user is over their monthly limit.
   - `resolveAIConfig(env)` + `createChatCompletion(...)` (`_shared/ai.ts`) run
     the completion against the configured provider.
   - `recordUsage` calls the `increment_feature_usage` RPC to count the call.
3. The improved text is returned to the browser.

### The provider-agnostic core: `supabase/functions/_shared/ai.ts`

This module is deliberately free of Deno-specific and remote imports (only
web-standard `fetch` / `AbortController`) so it can run in Deno **and** be
unit-tested with Vitest under Node. Its two entry points:

- **`resolveAIConfig(env)`** — a pure function that reads the AI environment
  variables and returns a normalized config (provider, key, base URL, model,
  temperature, token limits, timeout, retries).
- **`createChatCompletion(config, params, fetchImpl?)`** — sends an OpenAI-style
  `/chat/completions` request with a timeout, bounded exponential-backoff
  retries, and normalized `AIError`s. `fetchImpl` is injectable for testing.

Supported providers (all speak the OpenAI schema):

| `AI_PROVIDER`       | Default base URL / model                              | Notes                                   |
| ------------------- | ----------------------------------------------------- | --------------------------------------- |
| `openai` (default)  | `https://api.openai.com/v1` · `gpt-4o`                | Requires `AI_API_KEY`                   |
| `deepseek`          | `https://api.deepseek.com/v1` · `deepseek-chat`       | OpenAI-compatible                       |
| `openai-compatible` | Set `AI_BASE_URL` + `AI_MODEL` yourself               | Groq, Together, Ollama, LM Studio, …    |
| `mock`              | none — deterministic offline output                   | No network, **zero cost**; demos/tests  |

Configuration is via edge-function secrets (`AI_PROVIDER`, `AI_API_KEY` or the
`OPENAI_API_KEY` fallback, `AI_BASE_URL`, `AI_MODEL`, `AI_TEMPERATURE`,
`AI_MAX_TOKENS`, `AI_TIMEOUT_MS`, `AI_MAX_RETRIES`). See
[docs/ai-providers.md](./ai-providers.md) and [`.env.example`](../.env.example)
for the full list, and [CONTRIBUTING.md](../CONTRIBUTING.md#adding-a-new-ai-provider)
for adding a first-class provider preset.

### Quotas

Per-user limits are enforced **server-side** via the `can_use_feature` /
`increment_feature_usage` RPCs. Free-tier limits: `cv_creation` 1,
`pdf_export` 1, `ai_improvements` 5/month, `job_matcher_advanced` 3/month; Pro is
effectively unlimited. The browser mirrors these counters for UX only — the edge
function is the source of truth.

## Adding a database migration

Migrations are plain SQL files in `supabase/migrations/`, applied in filename
order. There are currently 13 migrations plus a reconciliation migration
(`20250719000000_reconcile_schema_and_security.sql`).

1. Create a new file named `<UTC-timestamp>_short_description.sql` (a later
   timestamp runs later).
2. Make it **idempotent** where practical (`IF NOT EXISTS`, `OR REPLACE`,
   `DROP POLICY IF EXISTS`). RLS is enabled on every table — for any new table,
   `ENABLE ROW LEVEL SECURITY` and add per-user policies.
3. Apply and verify locally:
   ```bash
   npm run db:reset
   ```
4. Regenerate the TypeScript types and commit them:
   ```bash
   npm run db:types      # writes src/integrations/supabase/types.ts
   ```
5. If your change is demo-worthy, update `supabase/seed.sql` — **fictional data
   only**, never real personal data.

Call out schema and environment-variable changes in your PR. More detail on the
data model is in [docs/database.md](./database.md).

## Running tests without consuming AI credits

Tests use **Vitest** ([`vitest.config.ts`](../vitest.config.ts)). The test
matcher covers both `src/**/*.{test,spec}.{ts,tsx}` and
`supabase/functions/**/*.{test,spec}.ts`.

```bash
npm run test           # single run
npm run test:watch     # watch mode
npm run test:coverage  # v8 coverage report in ./coverage
```

**No test ever calls a real AI provider or spends credits.** Two independent
mechanisms guarantee this:

- **Injected `fetch`.** `createChatCompletion(config, params, fetchImpl)` takes
  the fetch implementation as an argument. The AI unit tests
  (`supabase/functions/_shared/ai.test.ts`) pass a fake `fetch` that returns
  canned `Response` objects, so no network request is ever made. These tests
  cover config resolution, the mock provider, retries, timeouts, invalid/empty
  responses, and provider errors.
- **The `mock` provider.** With `AI_PROVIDER=mock`, `createChatCompletion`
  returns deterministic output and short-circuits **before** any network call —
  zero cost, fully offline. This is also how you can run the whole app's AI
  features locally for free (set the `mock` secret for your local functions).

There is no Playwright / end-to-end suite yet; contributions are welcome (see
[ROADMAP.md](../ROADMAP.md)).

## More

- [CONTRIBUTING.md](../CONTRIBUTING.md) — branching, PR checklist, contribution rules
- [ARCHITECTURE.md](../ARCHITECTURE.md) — system architecture
- [docs/self-hosting.md](./self-hosting.md) — deploying your own instance
- [docs/privacy.md](./privacy.md) and [SECURITY.md](../SECURITY.md) — data handling and security
