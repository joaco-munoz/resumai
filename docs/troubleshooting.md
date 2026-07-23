# Troubleshooting

Fixes for the issues you are most likely to hit while running or self-hosting ResumAI. If your problem isn't here, check the [installation guide](./installation.md), the [configuration reference](./configuration.md), or open an issue.

This page is complementary to the [README](../README.md) — it does not repeat setup steps, only the failure modes and their resolutions.

---

## "Missing Supabase configuration" error

The app throws this on startup:

```
Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
in your environment. Copy .env.example to .env and fill in the values from your
Supabase project (Project Settings -> API). See docs/configuration.md for details.
```

The frontend needs both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` at build/dev time. They are read from `import.meta.env`, so they must be present when Vite starts.

**Fix:**

```bash
cp .env.example .env
# Edit .env and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

- Get the values from your Supabase project (Dashboard → Project Settings → API), or from the output of `npm run db:start` for a local stack.
- The variables **must** keep the `VITE_` prefix — Vite only exposes prefixed variables to the browser.
- Restart the dev server after editing `.env`; Vite reads env files at startup, not on the fly.
- When deploying to Vercel, set the same two variables in the project's Environment Variables and redeploy.

See [configuration.md](./configuration.md) for the full variable reference.

---

## Blank page / white screen

The dev server runs but the browser shows nothing.

- **Open the browser console.** The most common cause is the "Missing Supabase configuration" error above — it is thrown before the app renders, leaving a blank page.
- **Check the Vite terminal** for a compile error that stopped the build.
- **Deployed on Vercel and routes 404 or blank on refresh?** ResumAI is an SPA; `vercel.json` rewrites all paths to `/`. If you host elsewhere, configure an equivalent catch-all rewrite so deep links (e.g. `/dashboard`) serve `index.html`.

---

## Port 8080 already in use

The dev server is fixed to port `8080` (see `vite.config.ts`). If another process holds it, Vite fails to start.

Find and stop the process, or free the port:

```bash
# macOS / Linux
lsof -i :8080
kill <PID>

# Windows (PowerShell)
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

To run on a different port temporarily, pass it to Vite:

```bash
npm run dev -- --port 5173
```

Remember that Supabase Auth redirects and `VITE_APP_BASE_URL` may reference `8080`; keep them consistent if you change the port.

---

## `db:start` / `db:reset` fails (Supabase CLI or Docker not running)

`npm run db:start`, `db:reset`, `db:migrate`, and `db:seed` all shell out to the [Supabase CLI](https://supabase.com/docs/guides/cli), which runs the local stack in **Docker**. Errors like `command not found: supabase`, `Cannot connect to the Docker daemon`, or a hang on start usually mean one of those is missing.

**Checklist:**

```bash
supabase --version   # CLI installed?
docker info          # Docker daemon running?
```

- Install the Supabase CLI if it is missing (see the CLI docs linked above).
- Start Docker Desktop (macOS/Windows) or the Docker service (Linux) before running any `db:*` script.
- The local database is **optional** — you can point `.env` at a hosted Supabase project instead and skip Docker entirely.
- If the stack is in a bad state, `npm run db:stop` then `npm run db:start` gives you a clean restart.

---

## Demo seed skipped notice

During `npm run db:reset` you may see:

```
NOTICE:  ResumAI demo seed skipped (<reason>). Sign up through the app instead.
```

This is **not an error**. The demo seed in `supabase/seed.sql` is wrapped in an exception-safe block: if your local `auth` schema differs across Supabase CLI versions, the seed logs this notice and the reset continues instead of aborting.

**What to do:** nothing is broken. Either sign up through the app UI, or, when the seed applies successfully, log in with the demo account **`demo@resumai.local` / `demo1234`**. The demo data is entirely fictional and for local development only.

---

## AI calls failing

"Improve summary", "Improve bullet point", and "Analyze job compatibility" run **server-side** in Supabase Edge Functions — never in the browser. If they error, the fix is in the function secrets, not the frontend `.env`.

**Fastest diagnosis: switch to the offline mock provider.**

```bash
supabase secrets set AI_PROVIDER=mock
```

The `mock` provider needs no key, makes no network calls, and returns deterministic output. If AI features work with `mock` but not your real provider, the problem is provider configuration or credentials.

**With a real provider, verify:**

- `AI_PROVIDER` is one of `openai`, `deepseek`, `openai-compatible`, or `mock`.
- `AI_API_KEY` is set (the legacy `OPENAI_API_KEY` is read as a fallback). Not required for `mock`.
- For `openai-compatible`, both `AI_BASE_URL` and `AI_MODEL` are set.
- Secrets are set on the **edge functions**, not as `VITE_` frontend variables:

```bash
supabase secrets set AI_PROVIDER=openai AI_API_KEY=sk-...
```

- When serving functions locally (`supabase functions serve`), put these in `supabase/.env` instead.
- Timeouts or upstream `5xx`/`429` from the provider are retried automatically (`AI_TIMEOUT_MS`, `AI_MAX_RETRIES`). Persistent failures surface as a `502` to the caller; the provider's raw error body is intentionally not leaked.

Full provider matrix and tuning: [ai-providers.md](./ai-providers.md).

---

## Quota exceeded — HTTP 429 "Monthly limit reached"

An AI or job-match request returns **429** with:

```
Monthly limit reached for this feature. Upgrade to Pro for more.
```

This is **expected behaviour**, not a bug. Edge functions enforce per-user quotas server-side via the `can_use_feature` / `increment_feature_usage` RPCs. Free-tier limits are:

| Feature | Free-tier limit |
|---------|-----------------|
| `cv_creation` | 1 |
| `pdf_export` | 1 |
| `ai_improvements` | 5 / month |
| `job_matcher_advanced` | 3 / month |

Pro is effectively unlimited. When self-hosting, you control these limits — adjust the quota logic/RPCs in the migrations if you want different thresholds. The check **fails open** on transient database errors (so the product keeps working) but **fails closed** on an explicit "over limit". Payments are optional; see [self-hosting.md](./self-hosting.md).

---

## Types out of date

TypeScript errors about missing columns/tables, or `src/integrations/supabase/types.ts` not matching the schema, mean the generated types drifted from the database after a migration.

Regenerate them against the local stack:

```bash
npm run db:types
```

This runs `supabase gen types typescript --local` and overwrites `src/integrations/supabase/types.ts`. Make sure the local Supabase stack is running (`npm run db:start`) first. Commit the regenerated file alongside the migration that changed the schema.

---

## Build "chunk size" warning

`npm run build` may print:

```
(!) Some chunks are larger than 500 kB after minification.
```

This is a **non-blocking** Vite warning, not a build failure — the build still produces a working `dist/`. It reflects the size of the bundled client (React, Radix/shadcn, PDF/Word export libraries). You can ignore it, or, if you want to act on it, split heavy client-side export libraries (`jspdf`, `docx`) behind dynamic imports.

---

## Cross-platform notes (Windows / macOS / Linux)

ResumAI targets **Node ≥ 18.18** (`.nvmrc` pins 22) and uses **npm** with a single `package-lock.json`. The app builds and runs on all three platforms; most friction is around the optional local database and shell differences.

- **Node version:** use [nvm](https://github.com/nvm-sh/nvm) (macOS/Linux) or [nvm-windows](https://github.com/coreybutler/nvm-windows) and `nvm use` to match `.nvmrc`. Mismatched Node versions cause the most install-time surprises.
- **Docker for the local stack:** Docker Desktop on macOS/Windows, or the Docker Engine/service on Linux, must be running before any `db:*` script. On Windows, running the Supabase CLI under **WSL 2** is the smoothest path.
- **Line endings:** on Windows, configure Git with `git config --global core.autocrlf input` to avoid CRLF churn. Run `npm run format` if Prettier reports diffs.
- **Killing the dev-server port** differs per OS — see the [port 8080](#port-8080-already-in-use) commands above.
- **Environment variables** load from `.env` the same way on every platform; you do not need to `export` them manually.

---

Still stuck? Re-check [installation.md](./installation.md) and [configuration.md](./configuration.md), search existing issues, or open a new one with the exact command, the full error output, and your OS + Node version.
