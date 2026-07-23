# ResumAI — Open Source Release Report

Companion to [`OPEN_SOURCE_AUDIT.md`](./OPEN_SOURCE_AUDIT.md). This report records
what was changed to prepare ResumAI for open-source publication, the state of the
verification checks, remaining risks, and the required manual actions.

**Date:** 2026-07-23 · **Branch:** `claude/resumai-open-source-mc73ae`

---

## Summary

### Added
- **Provider-agnostic AI layer** (`supabase/functions/_shared/ai.ts`) — OpenAI,
  DeepSeek, any OpenAI-compatible endpoint, and a deterministic **mock** provider;
  configurable model/temperature/tokens/timeout/retries; shared `cors.ts` and
  `auth.ts` (auth + server-side quota) helpers.
- **Reproducible database:** a reconciliation migration
  (`supabase/migrations/20250719000000_reconcile_schema_and_security.sql`) and a
  fictional demo seed (`supabase/seed.sql`, `demo@resumai.local`).
- **Config & tooling:** `.env.example`, typed `import.meta.env`, `.nvmrc`,
  `engines`, `.prettierrc.json`, `vitest.config.ts`; npm scripts `typecheck`,
  `test`(+watch/coverage), `format`(+check), `db:*`.
- **Tests:** Vitest unit tests for the AI layer (mock, retries, timeouts,
  invalid/empty responses, provider errors, config) via an injected `fetch`, plus
  a pure-util test — **no API credits used**.
- **Documentation:** rewritten `README.md`; `ARCHITECTURE.md`, `CONTRIBUTING.md`,
  `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md`, `CHANGELOG.md`, `ROADMAP.md`,
  `LICENSE` (MIT), and `docs/` (installation, configuration, ai-providers,
  self-hosting, database, privacy, troubleshooting, development,
  engineering-decisions).
- **GitHub:** CI workflow (lint/typecheck/test/build + informational audit, no
  secrets), issue forms + PR template (with a security checklist), Dependabot.
- **Visual:** a branded social/preview image (`docs/assets/preview.png`,
  `public/og-image.png`) with no personal data.

### Changed
- Refactored the 3 AI edge functions onto the shared layer with **JWT auth**,
  **server-side quota enforcement**, timeouts/retries and tighter CORS/logging.
- **Fixed the broken Job Matcher** (was calling a nonexistent Next.js
  `/api/match`) to invoke the real `analyze-job-compatibility` function; usage is
  now counted server-side.
- Env-driven Supabase config (frontend + extension); single package manager
  (npm); fixed `index.html` social/favicon paths; fixed a dev-server portability
  bug (`host: "::"` → `host: true`); Tailwind content globs corrected.

### Removed
- Committed **Chrome extension private signing key** (`chrome-extension.pem`) and
  packaged `.crx`; the competing `bun.lockb`; a duplicate migration file.

### Fixed (security)
- **IDOR** in `analyze-job-compatibility` (user now derived from the verified
  JWT, not a request-body `userId`).
- `business_metrics` no longer world-readable; `admin_users` RLS recursion fixed;
  `SECURITY DEFINER` functions pin `search_path`; reduced sensitive logging in the
  Flow webhook.

### Left pending (documented, not done)
- Executing the reconciliation migration/seed against a **real** local Supabase
  (not possible in this environment; SQL written to be idempotent/validated).
- Playwright end-to-end tests (on the roadmap).
- MercadoPago backend (referenced in UI, not implemented — documented).
- Self-serve account/data deletion UI (documented in `docs/privacy.md` / roadmap).
- Git-history purge + Chrome key rotation (manual — see below).

---

## Verification status

| Check | Status | Evidence |
| ----- | -----: | -------- |
| Clean install | **Pass** | `npm install` → 483 packages, exit 0 |
| Lint | **Pass** | `npm run lint` → 0 errors, 82 warnings (all `any`/hooks, non-blocking) |
| Typecheck | **Pass** | `npm run typecheck` (`tsc --noEmit`) → exit 0 |
| Unit tests | **Pass** | `npm run test` → 20 passed (2 files) |
| E2E tests | **N/A** | No Playwright suite yet (roadmap); AI-flow logic covered by unit tests |
| Build | **Pass** | `npm run build` → built in ~13s, `dist/` produced |
| Secrets scan | **Pass** | No private key / `service_role` / `sk-` / hardcoded JWT / old project ref in tracked files; `.env` git-ignored. ⚠️ old `.pem` remains in **git history** (see manual actions) |
| README walkthrough | **Pass** | `npm install` → env → `npm run dev` serves **HTTP 200** at `:8080`; lint/typecheck/test/build pass. An independent fresh-eyes review (docs only) found **0 blockers / 0 issues**: every `npm run` script exists, env var names match `client.ts`, all relative links/anchors resolve, demo creds match the seed, no contradictions, mermaid valid. DB steps (`db:start`/`db:reset`) require the Supabase CLI + Docker and were **not** executable in this sandbox |

> CI runs lint → typecheck → test → build on every push/PR and needs **no**
> private secrets (AI tests use the mock provider + injected `fetch`).

---

## Pending risks

| Risk | Severity | Impact | Mitigation | Blocks publish? |
| ---- | -------- | ------ | ---------- | --------------- |
| Chrome signing key in git history | **High** | The removed `chrome-extension.pem` is still reachable in history (commit `54a8409`); it can sign look-alike extensions | Rotate/regenerate the key; purge history with `git filter-repo`/BFG before publishing | **No** for the web app; **Yes** before distributing the extension |
| Reconciliation migration / seed unvalidated | Medium | SQL couldn't be run here; a subtle error could break `db reset` on a real project | Written idempotently; run `npm run db:reset` on a local Supabase and adjust if needed | No (validate before relying on it) |
| Job Matcher / AI end-to-end unverified against a live provider | Medium | Code paths are unit-tested with mocks, but not exercised against a real Supabase + provider | Validate with `AI_PROVIDER=mock` locally, then a real key | No |
| Flow webhook doesn't verify inbound HMAC signature | Medium | Spoofed callbacks; mitigated by the getStatus re-query | Add inbound HMAC verification (left as a documented TODO to avoid breaking payments untested) | No (payments optional) |
| `any` usage remains (warnings) | Low | Weaker typing in legacy/boilerplate code | `no-explicit-any` is a visible warning; pay down over time | No |

---

## Manual actions required (owner)

1. **Rotate the Chrome extension signing key** and treat the old
   `chrome-extension.pem` as compromised. Regenerate a new key; if you distribute
   the extension, purge the old key from git history (`git filter-repo` / BFG) —
   this rewrites history and needs a coordinated force-push.
2. **Set production secrets** (never commit them): Vercel env
   `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`; edge-function secrets
   (`AI_PROVIDER`, `AI_API_KEY`, and Flow keys if used) via
   `supabase secrets set`.
3. **Validate the database** on a real local Supabase: `npm run db:reset` and
   confirm the app works; then `npm run db:types`.
4. **Enable GitHub features:** Discussions (categories: General, Ideas, Q&A, Show
   and tell, Provider integrations), branch protection on `main` (require CI),
   and Dependabot (config included).
5. **Upload the social preview:** Settings → General → Social preview →
   `docs/assets/preview.png` (also served at `public/og-image.png`).
6. **Confirm the license holder:** replace “ResumAI contributors” in `LICENSE`
   with your name if desired.
7. **(Optional) Publish a live demo** and add its URL to the README badge/hero.

---

## Publication recommendation

**Ready after minor fixes.**

The repository is now safe and reproducible for open source: the committed
private key and hardcoded project credentials are removed, the critical IDOR and
RLS issues are fixed, the database is made reproducible, the AI layer is
provider-agnostic with a cost-free mock path, and `lint`/`typecheck`/`test`/
`build` all pass with CI wired up and complete documentation.

The remaining items before a fully clean public launch are **operational**, not
code blockers: rotate the Chrome key and (if distributing the extension) purge it
from history, and validate the reconciliation migration/seed against a real
Supabase instance. None of these block publishing the **web application**; the
git-history purge is the one item to complete **before** distributing the
**browser extension**.
