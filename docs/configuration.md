# Configuration

This page is the complete reference for every environment variable ResumAI
reads. For install and run instructions, see the [README](../README.md); this
document only covers configuration.

ResumAI is a Vite 5 + React 18 single-page app (see `vite.config.ts`) backed by
Supabase (Postgres, Auth, and Deno Edge Functions). Configuration therefore
splits into two scopes that are set in completely different places and have
completely different visibility.

- Start from the annotated template: [`.env.example`](../.env.example). Copy it
  to `.env` and fill in your own values:

```sh
cp .env.example .env
```

`.env` is git-ignored. Never commit real credentials.

## The two scopes (read this first)

| Scope | Prefix | Visibility | Where it is read | Where you set it |
| --- | --- | --- | --- | --- |
| Frontend | `VITE_` | **Public** — bundled into the browser build | `src` via `import.meta.env` | `.env` (local), Vercel Project → Settings → Environment Variables (prod) |
| Edge functions | no `VITE_` | **Secret** — server-side only | `supabase/functions/**` via `Deno.env` | `supabase secrets set` (or `supabase/.env` locally) |

Two rules follow directly from this table:

1. **Anything prefixed `VITE_` is public.** Vite inlines every `VITE_`-prefixed
   variable into the JavaScript that ships to the browser. Only put values there
   that are safe to expose. The Supabase anon key is safe by design because
   access is restricted by Row Level Security, not by keeping the key secret.
2. **Edge-function secrets must never be prefixed `VITE_`.** A provider API key
   or the Supabase service-role key prefixed `VITE_` would be baked into the
   public bundle and leaked. Server secrets are set with the Supabase CLI and
   never reach the client.

## Where to set variables

- **Local frontend** — put `VITE_*` variables in `.env` at the repo root. Vite
  loads it automatically on `npm run dev` and `npm run build`.
- **Local edge functions** — when running `supabase functions serve`, put
  server-side variables in `supabase/.env` (git-ignored). On the Supabase
  platform these are injected from the secret store instead.
- **Deployed edge functions** — set secrets with the Supabase CLI:

```sh
supabase secrets set AI_PROVIDER=openai AI_API_KEY=sk-your-provider-key
```

  You can also manage them in the Supabase Dashboard under
  Edge Functions → Secrets.
- **Production frontend (Vercel)** — add each `VITE_*` variable in the Vercel
  dashboard (Project → Settings → Environment Variables), then redeploy so the
  build picks them up. Vercel serves the SPA via the rewrite in
  [`vercel.json`](../vercel.json).

## Frontend variables (`VITE_`)

Read in `src/integrations/supabase/client.ts` and typed in `src/vite-env.d.ts`.

| Variable | Required | Example | Description |
| --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes | `https://your-project-ref.supabase.co` | Supabase project URL. Dashboard → Project Settings → API. |
| `VITE_SUPABASE_ANON_KEY` | Yes | `your-anon-publishable-key` | Supabase anon (publishable) key. Public by design — access is enforced by RLS. Dashboard → Project Settings → API. |
| `VITE_APP_BASE_URL` | No | `http://localhost:8080` | Public base URL of the deployed app, intended for auth redirects. Defaults to `window.location.origin` when unset. |

If the two required variables are missing, the app cannot create its Supabase
client and surfaces a configuration error at startup.

## Edge-function variables

These are server-side only. Group them by concern: AI provider, Supabase access,
and Flow payments. Nothing here should ever carry a `VITE_` prefix.

### AI provider (bring your own key)

The AI layer in `supabase/functions/_shared/ai.ts` is provider-agnostic
(`resolveAIConfig` + `createChatCompletion`) and is used by the three AI edge
functions: `improve-cv-content`, `improve-bullet-point`, and
`analyze-job-compatibility`. **AI runs only server-side**; provider API keys
never reach the browser.

| Variable | Required | Example | Description |
| --- | --- | --- | --- |
| `AI_PROVIDER` | No (defaults to `openai`) | `openai` | One of `openai`, `deepseek`, `openai-compatible`, `mock`. |
| `AI_API_KEY` | Yes, unless `AI_PROVIDER=mock` | `sk-your-provider-key` | API key for the selected provider. `OPENAI_API_KEY` is read as a fallback for backwards compatibility. |
| `AI_BASE_URL` | Only for `openai-compatible` | `https://api.openai.com/v1` | OpenAI-compatible endpoint base URL. Defaults are applied for `openai` and `deepseek`. |
| `AI_MODEL` | No | `gpt-4o` | Model name. Defaults: `gpt-4o` (openai), `deepseek-chat` (deepseek). Required for `openai-compatible`. |
| `AI_TEMPERATURE` | No (default `0.7`) | `0.7` | Sampling temperature. |
| `AI_MAX_TOKENS` | No (default `1000`) | `1000` | Max tokens per completion. |
| `AI_TIMEOUT_MS` | No (default `30000`) | `30000` | Per-request timeout in milliseconds. |
| `AI_MAX_RETRIES` | No (default `2`) | `2` | Bounded retries with exponential backoff on retryable errors. |

Provider notes:

- **`openai`** (default) — base URL `https://api.openai.com/v1`, model `gpt-4o`.
- **`deepseek`** — OpenAI-compatible; base URL `https://api.deepseek.com/v1`,
  model `deepseek-chat`.
- **`openai-compatible`** — any endpoint that speaks the OpenAI
  `/chat/completions` schema (Groq, Together, Ollama, LM Studio, self-hosted).
  Set `AI_BASE_URL` and `AI_MODEL` explicitly; there are no presets.
- **`mock`** — deterministic, offline responses with no network calls and zero
  cost. No API key required. Ideal for demos and tests.

For a real (non-mock) provider, `AI_API_KEY` (or `OPENAI_API_KEY`) is required,
and `AI_BASE_URL` / `AI_MODEL` must resolve to non-empty values (either from a
preset or explicitly). A minimal working configuration:

```sh
supabase secrets set AI_PROVIDER=openai AI_API_KEY=sk-your-provider-key
```

To run entirely offline (no key, no cost):

```sh
supabase secrets set AI_PROVIDER=mock
```

**Privacy note.** When you use a real provider, CV text (summary, bullet points,
or the full CV for job matching) is sent to that provider. The `mock` provider
sends nothing.

### Supabase access (server side)

The AI functions authenticate the caller's JWT and run under RLS using the anon
key (`supabase/functions/_shared/auth.ts`); the payment functions use the
service-role key.

| Variable | Required | Example | Description |
| --- | --- | --- | --- |
| `SUPABASE_URL` | Auto on Supabase | `https://your-project-ref.supabase.co` | Project URL. |
| `SUPABASE_ANON_KEY` | Auto on Supabase | `your-anon-publishable-key` | Used to validate the caller's JWT and enforce RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto on Supabase | `your-service-role-key` | **Server only. Never expose.** Full-access key used by the payment functions. |

On the Supabase platform these three are injected into the function runtime
automatically. You only set them yourself when running functions locally with
`supabase functions serve`, in `supabase/.env`.

### Flow payments (optional)

Payments use [Flow.cl](https://www.flow.cl) (a Chilean processor) for the Pro
plan (CLP 6,990/month). These variables are only needed if you enable
subscriptions; self-hosting works fine without them. Read in
`create-flow-subscription`, `cancel-flow-subscription`,
`check-subscription-status`, and `flow-webhook`.

| Variable | Required | Example | Description |
| --- | --- | --- | --- |
| `FLOW_API_KEY` | For payments | `your-flow-api-key` | Flow API key. |
| `FLOW_SECRET_KEY` | For payments | `your-flow-secret-key` | Flow secret key (used to sign requests and verify webhooks). |
| `FLOW_ENV` | No | `sandbox` | `sandbox` or `production`. Selects the default Flow base URL. |
| `FLOW_BASE_URL` | No | `https://sandbox.flow.cl/api` | Overrides `FLOW_ENV`. Defaults: `https://sandbox.flow.cl/api` (sandbox) or `https://www.flow.cl/api` (production). |
| `APP_BASE_URL` | No | `http://localhost:8080` | Return URL base after checkout. Falls back to `SUPABASE_URL` when unset. |

> MercadoPago is referenced in the UI, but its edge function is not implemented.
> Only Flow.cl payments are wired up. Payments require paid third-party accounts
> and are optional for self-hosting.

## Minimal setups

**Frontend + offline AI (no external accounts, no cost):**

```sh
# .env (frontend)
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-publishable-key"
```

```sh
# Edge functions
supabase secrets set AI_PROVIDER=mock
```

**Frontend + a real AI provider:**

```sh
supabase secrets set AI_PROVIDER=openai AI_API_KEY=sk-your-provider-key
```

Payments (Flow) and MercadoPago are not required for either setup.

## Quotas and tiers

The AI functions enforce per-user quotas server-side via the `can_use_feature`
and `increment_feature_usage` database RPCs (defined in
`supabase/migrations/`). Free-tier limits: `cv_creation` 1, `pdf_export` 1,
`ai_improvements` 5/month, `job_matcher_advanced` 3/month. Pro is effectively
unlimited. These limits are enforced in the database, not via environment
variables.

## Security checklist

- Never prefix a server secret with `VITE_`.
- Never commit `.env` or `supabase/.env` (both are git-ignored).
- Treat `SUPABASE_SERVICE_ROLE_KEY` and provider API keys as high-value secrets;
  set them only via `supabase secrets set` or the dashboard.
- The Supabase anon key is public by design and safe in the client bundle;
  security comes from RLS, which is enabled on all tables.
- Rotate any credential that was ever committed. A private key
  (`chrome-extension.pem`) was committed in the past and removed; it remains in
  git history and must be revoked/rotated manually.
