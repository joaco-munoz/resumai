# Engineering decisions

Short architecture-decision records. Each notes whether it was a **pre-existing**
decision (already true in the codebase) or **introduced** during the open-source
preparation.

Format: Context · Decision · Alternatives · Consequences · Risks · Status.

---

## 1. Supabase as the entire backend

- **Status:** Pre-existing · Accepted
- **Context:** A solo/small team needed auth, a relational database, and a place
  to run server-side logic without operating servers.
- **Decision:** Use Supabase (Postgres + Auth + Edge Functions) as the whole
  backend; the frontend talks to it directly with RLS as the security boundary.
- **Alternatives:** Custom Node/Nest API; Firebase; a Next.js app with route
  handlers.
- **Consequences:** Very little ops; RLS-first data model; privileged logic must
  live in edge functions. Reproducibility depends on migrations being complete.
- **Risks:** Vendor coupling; migration drift if `types.ts` and the live schema
  diverge (addressed by a reconciliation migration).

## 2. Vite SPA (not Next.js)

- **Status:** Pre-existing · Accepted
- **Context:** The app is a logged-in tool, not a content site.
- **Decision:** Ship a client-side React SPA built with Vite; deploy to Vercel
  with SPA rewrites.
- **Alternatives:** Next.js (SSR/route handlers), Remix.
- **Consequences:** Simple mental model and hosting; no SSR/SEO for app routes;
  no built-in server, so secrets/logic go to edge functions.
- **Risks:** Some patterns (e.g. `process.env`) don't apply in Vite — a real bug
  (`process.env.NEXT_PUBLIC_API_URL` in the Job Matcher) was fixed during
  open-sourcing.

## 3. Provider-agnostic AI layer + Bring-Your-Own-Key

- **Status:** Introduced (open-sourcing)
- **Context:** The code was hard-wired to OpenAI `gpt-4o` in three near-duplicate
  functions, with no way to swap providers and no offline path.
- **Decision:** Add `supabase/functions/_shared/ai.ts` — one interface over
  OpenAI, DeepSeek, any OpenAI-compatible endpoint, and a deterministic **mock**
  provider — configured via `AI_*` env vars (model, temperature, tokens,
  timeout, retries).
- **Alternatives:** Keep OpenAI-only; adopt a heavy multi-provider SDK.
- **Consequences:** Self-hosters choose/‌pay their own provider; the mock enables
  offline demos and credit-free tests; duplication removed.
- **Risks:** Providers may diverge from the OpenAI schema (handled behind the
  interface); mock output is intentionally not "real" quality.

## 4. AI keys stay server-side; per-user keys deferred

- **Status:** Pre-existing (server-side) · Decision recorded (per-user)
- **Context:** Exposing an AI key in a browser SPA would leak it immediately.
- **Decision:** Read provider keys only from **edge-function** env. Do **not**
  implement per-user keys yet, because storing end-user keys safely requires
  encryption-at-rest and careful handling.
- **Alternatives:** Store per-user keys in a table (rejected: plaintext secrets);
  a client-side key field (rejected: exposure).
- **Consequences:** Simple and safe default (server key). Multi-tenant "each user
  brings a key" is a documented future item, not a fake feature.
- **Risks:** A shared server key means the operator bears cost; mitigated by
  server-side per-user quotas.

## 5. Server-side quota enforcement

- **Status:** Introduced (open-sourcing)
- **Context:** Usage limits lived only in the client and were trivially
  bypassable, risking uncontrolled provider spend.
- **Decision:** Enforce and count usage in the edge functions via
  `can_use_feature` / `increment_feature_usage`; keep the client check for UX.
- **Consequences:** Limits are now authoritative server-side; the client no
  longer double-counts.
- **Risks:** RPC errors fail **open** (to avoid breaking the product) but fail
  **closed** on an explicit "over limit"; documented as a deliberate trade-off.

## 6. Reproducible database + demo seed

- **Status:** Introduced (open-sourcing)
- **Context:** The committed migrations did not recreate the live schema (missing
  columns and RPCs), so a fresh `db reset` broke the app; there was no seed.
- **Decision:** Add a reconciliation migration and a fictional `seed.sql`
  (wrapped in an exception-safe block so `db reset` never fails).
- **Consequences:** Outsiders can stand up a working instance from the repo.
- **Risks:** SQL couldn't be executed in this environment; must be validated
  against a real local Supabase.

## 7. Mock provider to avoid AI cost in tests

- **Status:** Introduced (open-sourcing)
- **Context:** Tests must not spend money or require secrets.
- **Decision:** Unit-test the AI layer with an **injected `fetch`** and the mock
  provider; CI never needs a real key.
- **Consequences:** Deterministic tests for retries, timeouts, invalid responses
  and config; fast CI with no external dependency.
- **Risks:** Doesn't exercise real provider quirks (acceptable for unit scope).

## 8. License: MIT

- **Status:** Introduced (open-sourcing) · Recommended & applied
- **Context:** The goal is broad adoption and a strong portfolio signal, while
  leaving room for a possible future hosted offering by the maintainer.
- **Decision:** **MIT.**
- **Alternatives considered:**
  - **Apache-2.0** — like MIT plus an explicit patent grant and trademark terms;
    slightly more enterprise-friendly, slightly more ceremony. A reasonable
    alternative if patent protection matters.
  - **AGPLv3** — forces network-service source disclosure, protecting against
    closed SaaS forks, but deters adoption and complicates the maintainer's own
    future commercial/hosted version (would likely need dual-licensing/CLA).
- **Consequences:** Maximum reuse (including commercial and closed forks); zero
  friction for contributors and adopters.
- **Risks:** Someone could offer a closed hosted version. Accepted, given the
  adoption/portfolio priority. Forkers should replace the copyright holder in
  `LICENSE`.

## 9. ESLint `no-explicit-any` as a warning

- **Status:** Introduced (open-sourcing)
- **Context:** ~55 `any`s (much of it generated types / shadcn boilerplate)
  blocked a clean lint, and TS strictness was largely disabled.
- **Decision:** Make `no-explicit-any` a **warning** (visible, non-blocking) and
  exclude the Deno edge functions / extension from the browser ESLint config
  (they use different runtimes/tooling). Fix all hard errors.
- **Consequences:** `npm run lint` passes with 0 errors; `any` remains visible as
  tech debt to pay down. New code should avoid `any` (see CONTRIBUTING).
- **Risks:** Warnings can be ignored; mitigated by asking reviewers to avoid new
  `any` in touched code.
