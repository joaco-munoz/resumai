# Installation

This guide walks you through installing and running **ResumAI** locally from
scratch. ResumAI is a Vite + React + TypeScript single-page app backed by
Supabase (Postgres, Auth, and Deno Edge Functions). For a high-level overview of
the stack and features, see the [README](../README.md).

By the end you will have the app running on `http://localhost:8080`, a local
database seeded with fictional demo data, and AI features working offline via the
`mock` provider — no paid API keys required.

## Prerequisites

Install these before you begin:

- **Node.js `>=18.18.0`** — the version pinned in [`.nvmrc`](../.nvmrc) is `22`.
  If you use [nvm](https://github.com/nvm-sh/nvm), run `nvm use` in the project
  root to match it.
- **npm** — the repository ships a single `package-lock.json`, so npm is the
  supported package manager.
- **Docker** — required to run the local Supabase stack (Postgres, Auth, Storage,
  and the edge-function runtime run in containers). Make sure the Docker daemon
  is running before you start Supabase.
- **Supabase CLI** — used for local development, migrations, and edge functions.
  See the [Supabase CLI install docs](https://supabase.com/docs/guides/local-development).

> Docker and the Supabase CLI are only needed for **Option A (local Supabase)**
> below. If you connect to a **remote** Supabase project (Option B), you can skip
> them.

## 1. Clone the repository

```sh
git clone <YOUR_GIT_URL>
cd resumai
```

## 2. Install dependencies

```sh
npm install
```

## 3. Configure environment variables

Copy the example file and edit the values:

```sh
cp .env.example .env
```

Only two variables are **required** for the frontend (both are public keys,
bundled into the browser build and protected by Row Level Security, not by
secrecy):

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL. |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon / publishable key. |
| `VITE_APP_BASE_URL` | No | Public base URL used for auth redirects. Defaults to `window.location.origin`. |

The values you use depend on whether you run Supabase locally or connect to a
remote project — see the next section.

Everything else in `.env.example` (the `AI_*`, `SUPABASE_SERVICE_ROLE_KEY`, and
`FLOW_*` variables) is **server-side only**. Those belong to the edge functions
and must never be prefixed with `VITE_` or shipped to the browser. See
[Trying the app without an API key](#trying-the-app-without-an-api-key-mock-ai)
below and read the comments in [`.env.example`](../.env.example) for details.

## 4. Set up the database (Supabase)

Choose **one** of the two options below.

### Option A: Local Supabase (recommended)

Start the local stack with Docker. The first run downloads container images and
may take a few minutes:

```sh
npm run db:start        # supabase start
```

When it finishes, the CLI prints your local **API URL** and **anon key**. Copy
those into `.env`:

```sh
VITE_SUPABASE_URL="http://127.0.0.1:54321"
VITE_SUPABASE_ANON_KEY="<anon key printed by supabase start>"
```

Next, apply the database schema and load the demo seed:

```sh
npm run db:reset        # supabase db reset — applies migrations + seed.sql
```

This applies every migration in [`supabase/migrations/`](../supabase/migrations)
and then runs [`supabase/seed.sql`](../supabase/seed.sql), which loads **fictional**
demo data. You can sign in with the local demo account:

```
email:    demo@resumai.local
password: demo1234
```

If the demo login does not work on your Supabase version, just sign up through
the app UI — the seed fails gracefully and does not block the reset.

Useful related scripts (see [`package.json`](../package.json)):

```sh
npm run db:stop         # stop the local stack
npm run db:migrate      # apply new migrations without reseeding
npm run db:types        # regenerate src/integrations/supabase/types.ts
```

### Option B: Remote Supabase project

If you prefer a hosted project instead of Docker:

1. Create a project at [supabase.com](https://supabase.com).
2. From **Project Settings → API**, copy the **Project URL** and **anon key**
   into `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Link the CLI and push the schema:

   ```sh
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```

The demo `seed.sql` is intended for local development and is **not** applied to a
remote project by `db push`; create your account through the app's sign-up flow
instead.

## 5. Run the development server

```sh
npm run dev
```

The app is served at **`http://localhost:8080`** (the port is set in
[`vite.config.ts`](../vite.config.ts)). Open it in your browser and sign in with
the demo account (local Supabase) or sign up (remote).

## Trying the app without an API key (mock AI)

ResumAI's AI features (CV content improvement, bullet-point rewriting, and
job-compatibility analysis) run **only server-side**, inside Supabase Edge
Functions — API keys never reach the browser. The AI layer is provider-agnostic
and ships a deterministic **`mock`** provider that returns canned responses with
**no network calls and no cost**. This is the easiest way to try the app end to
end.

Because those variables are edge-function secrets, set them where the functions
read them. For local development, put them in `supabase/.env` (gitignored):

```sh
# supabase/.env
AI_PROVIDER=mock
```

Then serve the functions locally:

```sh
supabase functions serve
```

With `AI_PROVIDER=mock` no API key is needed. To use a real provider instead
(OpenAI, DeepSeek, or any OpenAI-compatible endpoint), set `AI_PROVIDER` and
`AI_API_KEY` accordingly — the relevant options are documented in
[`.env.example`](../.env.example).

> **Privacy note:** with the `mock` provider, no CV data leaves your machine.
> With a real provider, CV text (summary, bullet points, or full CV for job
> matching) is sent to that provider for processing.

Payment features (Flow.cl subscriptions) require paid third-party accounts and
are **optional** for self-hosting; you can ignore the `FLOW_*` variables unless
you intend to enable subscriptions.

## Verify your install

Run the standard checks to confirm everything is wired up correctly. All of these
are defined in [`package.json`](../package.json):

```sh
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # Vitest (vitest run)
npm run build       # production build with Vite
```

Notes:

- The test suite uses **Vitest** and requires no external services or API
  credits — the AI-layer tests inject a fake `fetch`, so they never make real
  network calls. There is no end-to-end/browser test suite yet.
- `npm run build` outputs a production bundle to `dist/`. You can preview it
  locally with `npm run preview`.
- Formatting is handled by Prettier via `npm run format` (write) and
  `npm run format:check` (verify).

## Next steps

- Read the [README](../README.md) for a project overview.
- Review [`.env.example`](../.env.example) for the full list of configurable
  environment variables and their scopes.
- ResumAI is released under the [MIT License](../LICENSE).
