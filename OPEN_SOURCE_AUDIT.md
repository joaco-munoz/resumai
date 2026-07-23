# ResumAI — Open Source Readiness Audit

> Point-in-time audit of the repository **as found**, before any remediation.
> It records the original state and the reasoning behind the changes proposed in the
> prioritized plan at the end. See `OPEN_SOURCE_RELEASE_REPORT.md` for what was
> actually changed.
>
> **Note:** the experimental Chrome extension referenced below (as a component and
> in findings S-01/S-06) was **subsequently removed from the project entirely**, as
> it never reached a finished state. Its mentions remain here only as a historical
> record. The one still-relevant item is that its private key was committed and
> remains in **git history** — it must be revoked/rotated and ideally purged.

**Audit date:** 2026-07-23
**Auditor role:** Staff engineer / OSS maintainer / security & DX review
**Method:** Full read of source, migrations, edge functions and configuration; git-history
secret scan; `npm install` + `eslint` + `tsc --noEmit` baseline; cross-validated with a
parallel multi-agent read of every subsystem.

---

## 1. Executive summary

ResumAI is a **client-side Vite + React + TypeScript single-page application** whose
entire backend is **Supabase** (Postgres, Auth, Storage and seven Deno Edge Functions).
It is a genuinely feature-rich product — CV builder, AI content improvement, job-offer
matching, a Kanban application tracker, subscriptions (Flow.cl / MercadoPago), an admin
metrics dashboard and a companion Chrome extension. The data model is well designed
(14 tables, row-level security on every table, sensible indexes and triggers).

However, **the repository is not ready to be published as open source today.** It has one
committed private key, a broken-access-control edge function, a database whose migrations
do **not** recreate the schema the app needs, hard-coded project configuration, no
environment-variable story, no tests, no CI, and a README that describes a different
project (a generic Lovable/Next.js template) than the one in the repo.

| | |
|---|---|
| **Current state** | Working private product wired to one specific Supabase project; not reproducible by an outsider. |
| **OSS readiness** | **Not ready.** ~1 critical secret, 1 critical access-control bug, 1 critical reproducibility blocker. |
| **Top strengths** | Solid relational schema with RLS; clear feature separation; modern stack; AI already runs server-side (keys never in the browser). |
| **Top risks** | Committed Chrome private key; IDOR in `analyze-job-compatibility`; migrations don't reproduce the live DB; no server-side AI cost control. |
| **Recommendation** | Remediate all **P0** items (security + reproducibility), then **P1** (install/reproducibility) before any public release. The product is worth open-sourcing and the fixes are well-scoped. |

---

## 2. Detected architecture

### Frameworks & languages
- **Frontend:** React 18.3, TypeScript 5.5, **Vite 5.4** (SPA — *not* Next.js), React Router 6, TanStack Query 5.
- **UI:** Tailwind CSS 3.4 + **shadcn/ui** (Radix primitives), `lucide-react`, `framer-motion`, `sonner` (toasts), `recharts`.
- **Docs export:** `jspdf` (PDF) and `docx` + `file-saver` (Word) — client-side generation.
- **Backend:** **Supabase** — Postgres + Auth + Storage + **Deno Edge Functions** (7).
- **Deploy:** **Vercel** (`vercel.json` rewrites all routes to `/` for SPA routing).
- **Companion:** Chrome extension (Manifest V3) that autofills job-application forms on Chilean job boards (`trabajando.cl`, `laborum.com`, …).

### Folder structure (top level)
```
src/            React SPA — components/, pages/, hooks/, contexts/, integrations/supabase, utils/
supabase/       config.toml, migrations/ (13 SQL files), functions/ (7 Deno edge functions)
chrome-extension/  MV3 extension (background/content/popup + config.js)
public/         static assets
documentacionflow.md   221 KB third-party Flow.cl OpenAPI spec committed at repo root
```

### Authentication
- Supabase Auth via `AuthContext` (`src/contexts/AuthContext.tsx`): email/password, Google OAuth, session listener, redirect handling.
- `ProtectedRoute` guards all `/app/*` routes. Row-level security enforces per-user data isolation at the database layer.

### Database (Supabase Postgres)
- 14 tables: `profiles, subscriptions, payments, cvs, job_descriptions, cv_job_matches, job_applications, job_applications_tracking, user_activity_logs, feature_usage, user_usage, business_metrics, nps_responses, admin_users`.
- 6 enum types, 8 SQL/PLpgSQL functions, 4 triggers (`on_auth_user_created → handle_new_user`, `updated_at`, single-favorite-CV enforcement).
- RLS enabled on **all** tables (33 policies). Realtime enabled for `cvs` and `profiles`.
- **CV content** stored as `jsonb` in `cvs.content`.

### Storage
- **No Supabase Storage buckets are created or used.** `cvs.pdf_url` and `profiles.avatar_url` are plain text columns. (The Chrome extension config references a `/storage/v1/object/public/cvs` path, but no code uploads to it.)

### External services & AI
- **AI provider:** OpenAI, `gpt-4o`, called **directly** from three edge functions using `OPENAI_API_KEY` (server-side env — never shipped to the browser). No abstraction, no mock.
  - `improve-cv-content` — professional summary rewrite (max 350 tokens).
  - `improve-bullet-point` — experience bullet rewrite (max 250 tokens).
  - `analyze-job-compatibility` — CV↔job scoring, returns JSON (max 2000 tokens, temp 0.2).
- **Payments:** **Flow.cl** (Chilean processor) — Pro plan **CLP 6.990/month**; HMAC-SHA256 signing; webhook verifies by re-querying Flow's `getStatus`. **MercadoPago** is referenced in the UI but its edge function is **absent** from the repo.
- **Analytics/admin:** business-metrics functions (MRR, churn) + an admin dashboard.

### Environment variables
- **Client:** none are used — Supabase URL and anon key are **hard-coded** in `src/integrations/supabase/client.ts`. There is no `.env.example`.
- **Edge functions (Deno):** `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FLOW_API_KEY`, `FLOW_SECRET_KEY`, `FLOW_ENV`/`FLOW_BASE_URL`, `APP_BASE_URL`.

### Critical user flows
1. Sign up / sign in → profile auto-created via `handle_new_user` trigger.
2. Build/edit CV (tabs: personal, summary, experience, education, skills) → autosave to `cvs.content`.
3. "Improve with AI" → `functions.invoke('improve-cv-content' | 'improve-bullet-point')`.
4. Job matcher → **currently broken** (see finding S-08).
5. Export → client-side PDF/Word.
6. Kanban application tracking.
7. Upgrade to Pro → Flow.cl checkout → webhook flips `profiles.is_premium`.

---

## 3. Security risks

Severity: **Critical** (block release / rotate now) · **High** · **Medium** · **Low**.

| ID | Sev | Finding | Location |
|----|-----|---------|----------|
| **S-01** | **Critical** | **Chrome extension RSA private signing key committed** (`-----BEGIN PRIVATE KEY-----`). Present in the working tree **and** in git history. Anyone can sign a look-alike extension with the same identity. | `chrome-extension.pem` |
| **S-02** | **Critical** | **Broken object-level authorization (IDOR).** `analyze-job-compatibility` uses the **service-role key** (bypasses RLS) and reads the CV of a **caller-supplied `userId`** from the request body without checking it against the JWT. Any authenticated user can exfiltrate another user's full CV (name, email, phone, history). | `supabase/functions/analyze-job-compatibility/index.ts:36-98` |
| **S-03** | **High** | **No server-side AI usage / cost enforcement.** Free-tier limits live only in the client (`useFeatureLimits`). The edge functions call OpenAI for any valid JWT regardless of quota, so limits are trivially bypassable → a self-hoster's OpenAI key can be drained. | `supabase/functions/*/index.ts` |
| **S-04** | **High** | **`business_metrics` is world-readable.** RLS policy `USING (true)` exposes MRR, ARR, revenue and churn to anyone holding the public anon key. | `migrations/20250620221621-...sql:291` |
| **S-05** | **High** | **`admin_users` RLS policy is self-referential** → Postgres infinite-recursion error on evaluation. | `migrations/20250706001921-...sql:16` |
| **S-06** | **Medium** | **Hard-coded Supabase project** URL + anon key in app and extension. The anon key is publishable-by-design (protected by RLS), but hard-coding ties the OSS repo to one private project and prevents BYO-Supabase. | `src/integrations/supabase/client.ts:5`, `chrome-extension/config.js` |
| **S-07** | **Medium** | **Flow webhook does not validate the inbound `s` signature** and runs with `verify_jwt = false`. Partially mitigated because it re-queries Flow `getStatus` with its own HMAC before trusting a payment, but the inbound request is unauthenticated. | `supabase/functions/flow-webhook/index.ts:33-42` |
| **S-08** | **Medium** | **No timeout / cancellation / retry** on any OpenAI or Flow call. A hung upstream hangs the function until the platform timeout. | all edge functions |
| **S-09** | **Medium** | **`SECURITY DEFINER` functions omit `SET search_path`** (`is_admin`, `log_user_activity`) — search-path hijack risk. Flagged by Supabase's own advisor. | `migrations/20250706001921-...sql` |
| **S-10** | **Medium** | **Wildcard CORS** (`Access-Control-Allow-Origin: *`) on every edge function, including authenticated ones. | all edge functions |
| **S-11** | **Low** | **Verbose logging of secrets/PII** — the Flow webhook logs full request headers, tokens and signatures; auth flows log user emails (96 `console.log` calls total). | `flow-webhook/index.ts:27-42`, `contexts/AuthContext.tsx` |
| **S-12** | **Low** | **Internal error messages leaked to the client** (`error.message` returned in responses). | AI edge functions |
| **S-13** | **Low** | **Prompt-injection surface** — untrusted `jobDescription` / `bulletPoint` / `content` is concatenated into prompts with no guardrails. Impact is limited (output is text shown back to the same user) but should be acknowledged. | AI edge functions |
| **S-14** | **Info** | `dangerouslySetInnerHTML` appears once, in shadcn's `chart.tsx`, injecting **static CSS variables** (no user input). Safe. | `src/components/ui/chart.tsx:79` |

**Secret scan result:** No live OpenAI (`sk-`) key, no `service_role` JWT and no `.env` file were found in the working tree or git history. The **only** committed private secret is `chrome-extension.pem` (S-01). The Supabase anon key is public-by-design. `documentacionflow.md` contains only OpenAPI example emails (`customer@gmail.com`), not real PII.

---

## 4. Developer-experience problems

| ID | Finding | Detail |
|----|---------|--------|
| **D-01** | **README describes a different project.** Generic Lovable template text, mostly Spanish, no env/Supabase/AI setup, references "npm i / npm run dev" with no configuration. An outsider cannot run the app from it. | `README.md` |
| **D-02** | **Database is not reproducible (CRITICAL).** `types.ts` and the running code reference columns and RPCs that **no migration creates**: `cvs.cv_source`, `cvs.is_primary`, `payments.flow_token/flow_order_number/flow_payment_date`, `subscriptions.provider`, and functions `increment_feature_usage`, `can_use_feature`, `get_user_limits`. A fresh `supabase db reset` produces a schema that **breaks the app**. | `supabase/migrations/*` vs `src/integrations/supabase/types.ts` |
| **D-03** | **Dual lockfiles** (`bun.lockb` **and** `package-lock.json`) — ambiguous package manager; CI/onboarding non-determinism. | repo root |
| **D-04** | **Missing scripts** — no `typecheck`, `test`, `format`, or any `db:*` script. Only `dev/build/lint/preview`. | `package.json` |
| **D-05** | **No `.env.example`, no client env usage.** Nothing tells a new dev what to configure; all config is hard-coded. | — |
| **D-06** | **No Node/engine pinning** — no `.nvmrc`, `.node-version`, or `engines`. | — |
| **D-07** | **No seed / demo data.** The only insert is a placeholder admin (`admin@tuapp.com`). Nothing to explore the product with. | `supabase/` |
| **D-08** | **No demo / mock mode.** Every AI action requires a real OpenAI key and spends credits; there is no offline path. | — |
| **D-09** | **Duplicate migration file** (two byte-identical `..._add_onboarding_completed` variants). | `supabase/migrations/` |
| **D-10** | **221 KB vendor OpenAPI spec** committed at the repo root (`documentacionflow.md`). | repo root |
| **D-11** | **No CI, issue/PR templates, or dependency automation.** | `.github/` absent |

---

## 5. Technical quality

- **TypeScript is not strict.** `tsconfig.app.json` sets `strict: false`, `noImplicitAny: false`; the root config also disables `strictNullChecks`. `tsc --noEmit` passes, but only because checking is relaxed. **55 `no-explicit-any`** occurrences.
- **Lint fails:** `npm run lint` → **64 errors / 33 warnings** (mostly `no-explicit-any`, some in shadcn UI boilerplate and Deno functions, plus `no-useless-escape`, `no-empty-object-type`, `no-require-imports`).
- **No tests of any kind** (no Vitest/Jest/Playwright, no test files).
- **Duplicated AI logic** — the three AI functions repeat the same fetch/CORS/error-handling scaffold.
- **Broken feature:** the Job Matcher calls `fetch(\`${process.env.NEXT_PUBLIC_API_URL}/api/match\`)` — a **Next.js** env var and a REST route that **do not exist** in this Vite SPA. The core matching flow does not work as committed (finding S-08 companion).
- **Data-model drift in code:** `useFeatureLimits` checks `subscription_tier === 'pro'`, but the enum's original values are `free/basic/premium/enterprise` (`'pro'` was added in a later migration); it also queries a `user_usage` table + `increment_feature_usage` RPC that aren't in the committed migrations.
- **Logging noise / PII:** 96 `console.log` statements, several logging emails and payment payloads.
- **Minor dead assets:** `src/assets/Logo - copia.png`, extension test scaffolding.
- **Good:** consistent component structure, sensible hooks separation, loading/error/empty states present in most data views, RLS-first data model, AI kept server-side.

---

## Prioritized change plan (P0 → P5)

### P0 — Publication & security blockers
- **[S-01]** Remove `chrome-extension.pem` (+ `.crx`) from the tree; document that the key is **compromised and must be regenerated**; document git-history purge (BFG/`git filter-repo`) as a manual, destructive step (not auto-executed).
- **[S-02]** Fix the IDOR: derive `userId` from the caller's JWT inside `analyze-job-compatibility`; stop trusting the request body.
- **[D-02]** Make the database reproducible: add a migration that creates the missing columns/RPCs so `supabase db reset` yields a working schema.
- **[S-04][S-05][S-09]** Fix `business_metrics` exposure, `admin_users` recursion, and `SET search_path` on `SECURITY DEFINER` functions.
- **[S-06]** Move Supabase config to env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) with a helpful runtime error; add `.env.example`.
- Harden `.gitignore` (env, builds, caches, coverage, Playwright, Supabase local, editor files).

### P1 — Install & reproducibility
- Choose **one** package manager (npm) and delete the other lockfile.
- Add `typecheck`, `test`, `test:e2e`, `format`, and `db:*` scripts; add `.nvmrc` + `engines`.
- Add `supabase/seed.sql` demo data (fictional) and a demo/mock path so a flow works with **no** external API.
- Verify clean `install → lint → typecheck → build`.

### P2 — Architecture & AI decoupling
- Introduce a small **AI provider abstraction** in a shared edge module supporting **OpenAI, DeepSeek, any OpenAI-compatible endpoint, and a mock** provider, configurable via env (base URL, model, temperature, tokens, **timeout, retries**). Refactor the three AI functions onto it.
- Add **server-side usage enforcement** hooks (S-03) and fix the broken Job Matcher to call the real edge function (S-08 companion).
- Document Bring-Your-Own-Key (server env = Modality A; per-user keys = documented limitation).

### P3 — Documentation
- Rewrite `README.md` (English, accurate, Mermaid architecture, quick start, AI config, self-hosting).
- Add `ARCHITECTURE.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md`, `CHANGELOG.md`, `ROADMAP.md`, `LICENSE`, and `docs/*` (installation, configuration, ai-providers, self-hosting, database, privacy, troubleshooting, development, engineering-decisions).

### P4 — Testing & CI
- Vitest unit tests using the **mock** AI provider (deterministic; no credits): provider config, retries, timeouts, invalid-response handling, plus pure utils.
- GitHub Actions CI (install → lint → typecheck → test → build → `npm audit`), issue/PR templates, Dependabot. **No private secrets required for PR validation.**

### P5 — Presentation
- Clean screenshots/social-preview guidance (no PII), relocate the vendor spec, badges that resolve.

---

## Answers an outsider should be able to give after remediation
What ResumAI does · how to run it · what it costs · what data leaves their infra · how to
connect their AI · how to add a provider · how to self-host · how to contribute · how to
report problems · what's finished vs experimental. Today, **none** of these are answerable
from the repo; the plan above closes each gap.
