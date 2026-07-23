# Contributing to ResumAI

Thanks for your interest in improving ResumAI! This guide covers everything you
need to make a solid contribution. By participating you agree to our
[Code of Conduct](./CODE_OF_CONDUCT.md).

## Ground rules (read first)

- **Never commit secrets or real personal data.** No API keys, service-role
  keys, `.env` files, private keys, real resumes, real emails or names. Use the
  placeholders in `.env.example`. `.env`, `*.pem`, `*.key` and `*.crx` are
  git-ignored — keep it that way.
- **Don't declare something works unless you ran it.** State what you tested.
- Prefer small, focused PRs over large sweeping ones.

## Development environment

Prerequisites: Node ≥ 18.18 (`.nvmrc` pins 22), npm, and — for a local database —
Docker + the [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
git clone https://github.com/joaco-munoz/resumai.git
cd resumai
npm install
cp .env.example .env        # fill in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
npm run db:start            # local Supabase (Docker)
npm run db:reset            # migrations + demo seed
npm run dev                 # http://localhost:8080
```

You can develop AI features with **zero cost** by setting the edge secret
`AI_PROVIDER=mock`. See [docs/development.md](./docs/development.md).

## Branching & commits

- Branch from the default branch: `git checkout -b feat/short-description` (or
  `fix/…`, `docs/…`, `chore/…`).
- Write clear commit messages. We recommend
  [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`,
  `docs:`, `refactor:`, `test:`, `chore:`), which keeps `CHANGELOG.md` easy to
  maintain.

## Before you open a PR — run the checks

All of these must pass:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

CI runs the same checks on every PR and does **not** require any private secrets
(AI tests use the mock provider + an injected `fetch`).

## Coding standards

- **TypeScript.** Prefer precise types. `@typescript-eslint/no-explicit-any` is a
  **warning** during the open-source migration — please don't add new `any` in
  code you touch.
- **Formatting.** Prettier (`npm run format`). Config in `.prettierrc.json`.
- **Structure.** Keep UI (components), domain (hooks/utils) and infrastructure
  (`integrations/`, `supabase/functions/`) reasonably separated.
- **User-facing states.** Handle loading, empty and error states.
- **No secrets in the client.** Anything requiring a secret belongs in an edge
  function, not in `src/`.

## Adding a new AI provider

Most providers speak the OpenAI `/chat/completions` schema, so usually **no code
change** is required — set `AI_PROVIDER=openai-compatible`, `AI_BASE_URL`,
`AI_MODEL` and `AI_API_KEY`.

To add a first-class preset:

1. Edit `supabase/functions/_shared/ai.ts` — add the provider to
   `AIProviderName` and a `baseUrl`/`model` default in `PROVIDER_DEFAULTS`.
2. If the provider deviates from the OpenAI schema, adapt request/response
   handling in `createChatCompletion` (keep it behind the same interface).
3. Add tests in `supabase/functions/_shared/ai.test.ts` using an injected
   `fetch` (no real calls).
4. Document it in [docs/ai-providers.md](./docs/ai-providers.md) and `.env.example`.

## Adding a database migration

1. Create a new file in `supabase/migrations/` named
   `<UTC-timestamp>_short_description.sql` (later timestamps run later).
2. Make it **idempotent** where practical (`IF NOT EXISTS`, `OR REPLACE`,
   `DROP POLICY IF EXISTS`), and remember **RLS**: enable it and add policies for
   any new table.
3. Apply and verify locally: `npm run db:reset`.
4. Regenerate types: `npm run db:types` and commit the updated `types.ts`.
5. If you add demo-worthy data, update `supabase/seed.sql` (fictional only).

## Pull request requirements

Your PR should:

- Explain **what** changed and **why**, and how you tested it.
- Include screenshots for UI changes.
- Call out any **database** or **environment-variable** changes.
- Confirm the security checklist in the PR template (no secrets, no real PII,
  no keys exposed to the client).
- Keep `lint`, `typecheck`, `test` and `build` green.

## AI-generated contributions

AI-assisted contributions are welcome, but **you are responsible** for the code
you submit: understand it, test it, and make sure it doesn't introduce secrets,
license violations, or invented behavior. Don't paste large blocks you can't
explain or verify.

## Questions

Open a [GitHub Discussion](https://github.com/joaco-munoz/resumai/discussions)
for questions/ideas and an [Issue](https://github.com/joaco-munoz/resumai/issues)
for bugs and concrete feature requests. See [SUPPORT.md](./SUPPORT.md).
