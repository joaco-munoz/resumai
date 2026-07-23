<!--
Thanks for contributing to ResumAI! Please fill out this template.
Keep PRs focused. Never include secrets or real personal data.
-->

## What does this PR change?

<!-- A clear summary of the change. -->

## Why?

<!-- The problem it solves or the motivation. Link issues: Closes #123 -->

## How was it tested?

<!-- Commands you ran and what you observed. -->

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test`
- [ ] `npm run build`
- [ ] Manually verified in the app (describe below)

<!-- Manual testing notes: -->

## Screenshots / recordings

<!-- For UI changes. Use fictional/demo data only — no real personal info. -->

## Database changes

- [ ] No database changes
- [ ] Adds/updates a migration in `supabase/migrations/` (idempotent; RLS considered)
- [ ] Regenerated types (`npm run db:types`) and committed `types.ts`
- [ ] Updated `supabase/seed.sql` (fictional data only), if relevant

## Environment variable changes

- [ ] None
- [ ] Adds/changes env vars — documented in `.env.example` and the relevant docs

## Risks & rollout

<!-- Anything reviewers should watch for: breaking changes, data migrations, cost, etc. -->

## Security checklist

- [ ] No secrets, API keys, tokens, or private keys are included (anywhere, incl. tests/fixtures)
- [ ] No real personal data (resumes, emails, names) is included
- [ ] No secret is exposed to the client (secrets stay in edge functions, not `VITE_`-prefixed)
- [ ] Inputs from users/providers are validated where relevant
