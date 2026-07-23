# Self-hosting ResumAI

This guide covers deploying **your own** instance of ResumAI. ResumAI has two
independently deployed parts:

- a **frontend** — a Vite + React single-page app (there is no custom Node
  server), and
- a **backend** — a Supabase project providing Postgres, Auth, and Deno Edge
  Functions.

For the project overview and stack, see the [README](../README.md). For a
first-time local setup, follow [installation.md](./installation.md). For the
full environment-variable reference, see [configuration.md](./configuration.md).
This page is complementary to those and focuses on **deployment**.

Two deployment shapes are described:

- **[Option A — Vercel + Supabase](#option-a--vercel-frontend--supabase-backend)**
  (recommended for a public instance).
- **[Option B — Fully local](#option-b--fully-local)** (no external accounts;
  runs entirely on your machine).

Either way, you can run every AI feature **offline and free** with the
deterministic `mock` provider, and **payments are optional** (see
[Costs](#what-costs-money) and [Payments](#payments-are-optional)).

## Prerequisites

- **Node.js `>=18.18.0`** (the [`.nvmrc`](../.nvmrc) pins `22`) and **npm**
  (the repo ships a single `package-lock.json`).
- The **[Supabase CLI](https://supabase.com/docs/guides/cli)** — used to link a
  project, push migrations, deploy functions, and set secrets.
- For **Option B** (or to build a remote schema from local migrations),
  **Docker** to run the local Supabase stack.

Install dependencies once from the repo root:

```sh
npm install
```

## Deployment topology

```
Browser ──────────────►  Vercel (static SPA)
   │                        VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (public)
   │
   └──────────────────►  Supabase project
                           Postgres (RLS) · Auth · Edge Functions (Deno)
                           edge-function secrets: AI_* · SUPABASE_* · FLOW_* (server-side)
                                   │
                                   └──► AI provider (OpenAI / DeepSeek / compatible / mock)
                                   └──► Flow.cl API (optional payments)
```

The frontend only ever holds the two **public** `VITE_*` values. All secrets
(AI provider keys, service-role key, Flow credentials) live server-side as
Supabase edge-function secrets and never reach the browser.

## Option A — Vercel (frontend) + Supabase (backend)

### 1. Create and link a Supabase project

Create a project at [supabase.com](https://supabase.com), then link the CLI to
it from the repo root:

```sh
supabase link --project-ref <your-project-ref>
```

The local `project_id` in [`supabase/config.toml`](../supabase/config.toml) is
just a name; linking with your own project ref is what matters.

### 2. Push the database schema

Apply every migration in [`supabase/migrations/`](../supabase/migrations) to the
linked remote project:

```sh
supabase db push
```

This creates the 14 tables with Row Level Security enabled on all of them. The
demo seed ([`supabase/seed.sql`](../supabase/seed.sql)) is **local-only** — it
runs on `supabase db reset`, **not** on `db push` — so no fictional data lands
in production. Create your real account through the app's sign-up flow instead.

### 3. Set edge-function secrets and deploy the functions

Set server-side secrets on the linked project. At minimum, choose an AI
provider. To run at zero cost with no key:

```sh
supabase secrets set AI_PROVIDER=mock
```

Or use a real provider (billed by that provider, not by ResumAI):

```sh
supabase secrets set AI_PROVIDER=openai AI_API_KEY=sk-your-provider-key
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are
injected into the function runtime automatically on the Supabase platform — you
do **not** set those yourself for a hosted project. For the complete list of
`AI_*` and (optional) `FLOW_*` variables, see
[configuration.md](./configuration.md) and [`.env.example`](../.env.example).

Deploy the edge functions:

```sh
supabase functions deploy
```

There are 7 functions: the AI functions `improve-cv-content`,
`improve-bullet-point`, and `analyze-job-compatibility`, plus the payment
functions `create-flow-subscription`, `cancel-flow-subscription`,
`check-subscription-status`, and `flow-webhook`. Their JWT-verification settings
come from [`supabase/config.toml`](../supabase/config.toml) (the AI and
subscription functions require a valid user JWT; `flow-webhook` does not, because
it is called by Flow's servers). If you are not enabling payments, you can skip
deploying the Flow functions.

### 4. Deploy the frontend to Vercel

The frontend is a static build; [`vercel.json`](../vercel.json) rewrites all
routes to `/` so client-side routing works. Import the repository into Vercel
(framework preset: **Vite**; build command `npm run build`; output directory
`dist`), then set the environment variables in
**Project → Settings → Environment Variables**:

| Variable | Required | Value |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes | Supabase **Project URL** (Dashboard → Project Settings → API). |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase **anon / publishable** key (same page). Public by design; access is enforced by RLS. |
| `VITE_APP_BASE_URL` | No | Your public app URL (used for auth redirects). Defaults to `window.location.origin` when unset. |

These are baked in at **build** time, so redeploy after changing any of them.

### 5. Configure auth redirect URLs

In the Supabase dashboard under **Authentication → URL Configuration**, set the
**Site URL** (and any additional **Redirect URLs**) to your Vercel domain so
email confirmations and Google OAuth return to your instance instead of
`localhost`. Set `VITE_APP_BASE_URL` to the same domain.

### 6. Verify

Open your Vercel URL, sign up, create a CV, and try an AI action. With
`AI_PROVIDER=mock` the AI features return deterministic output and nothing is
sent to any external provider; with a real provider, CV text is sent to that
provider for processing.

## Option B — Fully local

Run the whole stack on your machine with the Supabase CLI and Docker — no
external accounts and no cost. This is the flow documented step by step in
[installation.md](./installation.md); in short:

```sh
npm run db:start      # supabase start (Docker)
npm run db:reset      # applies migrations + supabase/seed.sql (demo data)
npm run dev           # http://localhost:8080
```

Put the local API URL and anon key printed by `supabase start` into `.env` as
`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. For local edge functions, place
server-side secrets in `supabase/.env` (git-ignored) and run
`supabase functions serve`. Sign in with the seeded demo account
**`demo@resumai.local` / `demo1234`**.

## What costs money

ResumAI itself is free (MIT-licensed) and can run end to end at **zero cost**
using local Supabase and the `mock` AI provider. Costs only appear when you opt
into paid third-party services:

| Service | Free option | When it costs |
| --- | --- | --- |
| **Supabase** | Free tier covers a small hosted project; fully local via the CLI is free. | Beyond free-tier limits (database size, bandwidth, edge-function invocations) you move to a paid plan. Free-tier projects also pause after a period of inactivity. See [Supabase pricing](https://supabase.com/pricing) for current limits. |
| **AI provider** | `AI_PROVIDER=mock` — deterministic, offline, no network, no key, no cost. | With a real provider (OpenAI, DeepSeek, any OpenAI-compatible endpoint) you pay that provider directly for usage. Nothing is marked up by ResumAI. |
| **Flow.cl (payments)** | Not required — payments are optional. | Only if you enable subscriptions; requires a Flow merchant account and its fees. See [Payments](#payments-are-optional). |

Per-user quotas are enforced **server-side** in the database (via the
`can_use_feature` / `increment_feature_usage` RPCs), not through environment
variables. Free-tier app limits: `cv_creation` 1, `pdf_export` 1,
`ai_improvements` 5/month, `job_matcher_advanced` 3/month; Pro is effectively
unlimited. PDF and Word export run client-side (jspdf / docx) and cost nothing.

## Payments are optional

Subscriptions use [Flow.cl](https://www.flow.cl), a Chilean payment processor,
for a Pro plan at CLP 6,990/month. This is entirely optional: self-hosting works
without it, and if you skip it you can leave the `FLOW_*` secrets unset and not
deploy the Flow functions. MercadoPago is referenced in the UI, but its edge
function is **not implemented**. See the Flow variables in
[configuration.md](./configuration.md#flow-payments-optional) if you do want to
enable subscriptions.

## No automated production deploys

There is no automated production-deployment pipeline in this repository —
nothing pushes to production on merge. Production deploys are performed
manually, by you:

- **Frontend:** Vercel (dashboard import/redeploy, or the Vercel CLI) after
  setting the `VITE_*` env vars.
- **Backend:** `supabase db push` (schema), `supabase functions deploy`
  (functions), and `supabase secrets set` (secrets).

Run the local checks before deploying (all defined in
[`package.json`](../package.json)):

```sh
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # Vitest (no network calls or API credits)
npm run build       # production build to dist/
```

## Security and privacy for self-hosters

- **Never prefix a server secret with `VITE_`.** `VITE_`-prefixed values are
  inlined into the public browser bundle. Keep provider keys, the service-role
  key, and Flow credentials as edge-function secrets only.
- **RLS is enabled on all tables** — CV data is isolated per user via
  `auth.uid()`. AI keys stay server-side.
- **Data sent to the AI provider:** with a real provider, CV text (summary,
  bullet points, or the full CV for job matching) is sent to that provider for
  processing. The `mock` provider sends nothing.
- **Rotate any credential that was ever committed.** A private key
  (`chrome-extension.pem`) was committed in the past and removed; it remains in
  git history and must be revoked/rotated manually.
- **Account/CV deletion** cascades at the database level (CVs and related rows
  are removed when the user is deleted). There is no in-app "delete account"
  button yet; deletion is performed via Supabase Auth admin.
- Self-hosters are responsible for their own keys, provider choice, and
  data-protection obligations. ResumAI does **not** claim GDPR/CCPA compliance.

## License

ResumAI is released under the [MIT License](../LICENSE). If you fork it, update
the copyright holder in `LICENSE` to your name.
