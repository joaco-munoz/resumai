# ResumAI — Audit v2 (Phase 0 of the v1.0 open-source mission)

> Point-in-time audit, written **before touching any code**, of `main` @ `fa0f0bd`
> (the merge of PR #2). It checks what the first open-source pass claimed,
> measures where the repo stands against the three success tests of the v1.0
> mission, and proposes a prioritized plan.
>
> **Date:** 2026-10-29 · **Branch:** `claude/gallant-babbage-wtzefy`
> **Method:** full read of the AI layer, edge functions, migrations, hooks, pages
> and docs; baseline `lint`/`typecheck`/`test`/`build`/`npm audit`; migrations +
> seed applied to a **real PostgreSQL 16**; RLS abuse reproduced in that
> database; Lighthouse on the production build; **Qwen 3.5 run for real on this
> machine's CPU through Ollama**. Every external fact carries a source and an
> access date (section 10).

---

## 0. TL;DR

1. **The AI is not free and not open by default.** The default provider is
   OpenAI `gpt-4o` (`supabase/functions/_shared/ai.ts:61`, `:76`) and a real
   provider *requires* an API key (`ai.ts:104-108`). Without a paid key the only
   option is `mock`. None of the three personas can use real AI for free today.
2. **The server-side quota added in PR #2 can be bypassed by any user**
   (reproduced in a real Postgres, section 3.2):
   - any signed-in user can make themselves **Pro**;
   - any signed-in user can reset their own usage counter;
   - **anyone holding the public anon key** can burn another user's quota.

   On shared, free AI capacity this is the first thing to fix.
3. **`npm run db:reset` is broken.** All 13 migrations apply, but `supabase/seed.sql`
   fails on an invalid UUID (`…0000000000j1`, `seed.sql:19`). The documented
   local quickstart and the demo login do not work.
4. **"Adapt CV to the offer" invents things.** It is not AI. It pastes *every*
   missing keyword from the job offer into the user's skills and summary
   (`src/components/CVAdaptationModal.tsx:109-141`). This breaks the mission's hard
   rule: never invent experience.
5. **Evidence against one decision (needs your call):** Hugging Face no longer
   lets free accounts **create or duplicate Docker Spaces**. Since about July
   2026 they require a PRO plan. The planned "AI server on Hugging Face" path is
   therefore no longer free (section 7).
6. **Good news on the model:** Qwen 3.5 (Apache-2.0, released 2026-03-02) runs
   here through Ollama 0.40.13 on 4 vCPUs:
   - 2B: ~12 tok/s;
   - 4B: ~6 tok/s;
   - 0.8B: ~20 tok/s, but it hallucinated in the smoke test.

   Real evals with real models are possible in this environment (section 4).
7. **Time-sensitive:** Supabase's legacy `anon`/`service_role` keys stop working
   at the **end of 2026**. The app, `auth.ts` and `verify_jwt` depend on them
   (section 3.3).

---

## 1. Scorecard (1 = poor, 5 = excellent)

| # | Dimension | Score | Evidence | What a 5 needs |
|---|---|:-:|---|---|
| 1 | **First impression (README + demo)** | **2** | **Good:** polished README with a preview image and badges (`README.md:1-18`). **Gaps:** no live demo link and no GIF/video of the real flow. The first promise is "Bring-Your-Own-Key" (`README.md:5`, `:47`), so the first thing a visitor learns is that they need a paid key. The GitHub topics say `nextjs` (it's Vite), and "Discussions" links point to a feature that is disabled (`.github/ISSUE_TEMPLATE/config.yml:3`; repo `has_discussions: false`). | Hero GIF of the real flow; three buttons (use it / own copy / Codespaces); "free open AI included (Qwen), no key"; working demo URL. |
| 2 | **Non-technical experience** | **1** | **Nothing works without a terminal:** the quickstart needs Docker + Supabase CLI (`README.md:132-155`) and self-hosting is all CLI (`docs/self-hosting.md:62-112`). **No free AI.** **Silent failures:** a deploy missing env vars renders a **blank page**, because `client.ts` throws at import (`src/integrations/supabase/client.ts:12-21`). **No guest mode:** every `/app/*` route needs an account (`src/App.tsx:43-86`). | Public URL + guest mode + free AI; a no-code guide that a non-technical tester can follow end to end. |
| 3 | **Product & UX** | **3** | **Good:** real product depth — builder with autosave, match report, Kanban, PDF/Word export, onboarding (`useOnboarding`, `OnboardingModal`), NPS (`useNPS`, `NPSModal`). **Problems:** "Adapt" invents skills (`CVAdaptationModal.tsx:131-139`). AI errors are generic ("Verifica tu conexión") even for quota or timeouts (`src/hooks/useAIImprovement.ts:35`). The free plan watermarks PDFs from the 2nd download (`src/hooks/useDownloadManager.ts:85`). Landing copy promises things that don't exist ("plantillas premium y soporte prioritario", `src/components/landing/data.tsx:33`) and contradicts the no-invention rule ("nuestra IA añade logros medibles", `data.tsx:8`). UI is Spanish-only; `<html lang="en">` (`index.html:2`). Navigation is a hover-driven icon dock (`src/components/ui/Dock.tsx:245-249`). Lighthouse accessibility on the landing: **73**. | Honest, guided first CV; mobile-first; ES/EN; a11y ≥ 90; every button leads somewhere real. |
| 4 | **Code quality** | **2** | **Typing off:** `strict: false`, `noImplicitAny: false` (`tsconfig.app.json:18,21`) and `strictNullChecks: false` (`tsconfig.json:17`); lint shows 82 warnings, 49 of them `no-explicit-any`. **Logging:** 221 `console.*` calls, some logging emails (`src/contexts/AuthContext.tsx:43,52,86,115`). **Duplication:** AI calls copied into `CVAdaptationPreviewModal.tsx:214-291` (vs `useAIImprovement.ts:14-111`). **Large / dead code:** 600-line components; dead code (`AppSidebar.tsx`, 351 lines; `MercadoPagoSubscription.tsx`). **Data model smell:** job-match reports are stored as rows of the `cvs` table (`src/pages/JobMatcher.tsx:127-136`). | Strict TS on new code, no `any` without a reason, shared hooks, no dead code, no PII in logs. |
| 5 | **Architecture** | **3** | **Good:** client SPA + Supabase with RLS; shared edge modules; an `ai.ts` that is testable (no remote imports, injectable `fetch`). **Gaps in the AI layer:** one provider at a time, no fallback chain, no streaming (`ai.ts:189` reads the whole body), JSON mode is only `response_format` (`ai.ts:158`). **Quota design flaw:** quota state lives in tables the user can write (section 3.2). **Legacy dependency:** edge functions import from `deno.land`/`esm.sh` and depend on the legacy anon key (`_shared/auth.ts:8`, `:35`). | Provider presets + ordered fallback chain + health/warm-up + streaming; quota state only writable by the server; `npm:`/`jsr:` imports type-checked in CI. |
| 6 | **AI: quality, robustness, cost, evals** | **2** | **Good:** a provider abstraction with a mock exists. **Cost:** paid default (`gpt-4o`). **Evals:** none. **Language:** prompts force Spanish even for English CVs (`improve-cv-content/index.ts:25`, `improve-bullet-point/index.ts:21`). **Robustness:** no input-size limit on any function; invalid JSON → plain `JSON.parse` → generic 500, with no repair (`analyze-job-compatibility/index.ts:132`). **PII:** the full name goes to the provider without need (`analyze-job-compatibility/index.ts:37`, `useAIImprovement.ts:43`). **Prompts:** long "15 years ATS certified" persona prompts written for big models. | Qwen by default via a free chain; versioned short prompts; zod-validated output + repair; language follows the CV; published evals with a golden set. |
| 7 | **Tests** | **1** | Only 2 test files / 20 tests (`supabase/functions/_shared/ai.test.ts`, `src/utils/__tests__/kanbanUtils.test.ts`). No component, hook, SQL/RLS or E2E tests. The broken seed and broken `log_user_activity` (section 3) went unnoticed because nothing runs the SQL. | Unit tests for hooks/utils and the AI chain, SQL/RLS tests against Postgres in CI, Playwright E2E (desktop + mobile) of the critical flow. |
| 8 | **Security** | **2** | **Fixed in PR #2:** IDOR, CORS allow-list, pinned `search_path`. **Open, reproduced (section 3.2):** self-upgrade to Pro, usage reset, cross-user quota burn via `SECURITY DEFINER` RPCs that are callable by `anon`. **Open, from code review:** quota fails *open* on RPC errors (`_shared/auth.ts:65-68`); no per-IP/per-user rate limit; no input limits; emails in logs. **Dependencies:** `npm audit`: 4 critical / 19 high, including `jspdf` ≤ 4.2.0 (critical, direct dependency); the Dependabot fix PR is still open ([joaco-munoz/resumai#9](https://github.com/joaco-munoz/resumai/pull/9)). **Leftover secret:** the old `.pem` is still in history (commit `54a8409`). | Server-only quota tables, RPCs that derive the user from the JWT, rate limits, input limits, CAPTCHA for guests, patched deps, independent security review. |
| 9 | **DX (clone → running)** | **2** | **Good:** npm scripts, `.nvmrc`, CI with no secrets. **Broken quickstart:** `db:reset` fails on the seed (verified). **Wrong docs:** they tell you to put function secrets in `supabase/.env` (`docs/configuration.md:43-44`), but the CLI auto-loads `supabase/functions/.env` (Supabase docs). **Other gaps:** edge functions are not type-checked anywhere; no devcontainer/Codespaces. **Time to running:** with a working Docker it's realistically 30–60 min, and you still end up with mock AI only. | One-click Codespaces with Qwen preloaded; `npm run setup`; the functions' env path documented correctly; `deno check` in CI. |
| 10 | **Documentation** | **3** | **Good:** 10 docs (~1,800 lines), an honest ROADMAP, a privacy page. **Gaps:** nothing for non-technical readers; English only (no `README.es.md`); no evals page; the wrong env path above; no architecture diagram of the AI chain (there is none to draw yet). | ES/EN no-code guides, evals page, case study, ADRs for the new decisions. |
| 11 | **Community signals** | **2** | **Good:** CoC, CONTRIBUTING, issue forms, PR template and Dependabot exist. **Gaps:** Discussions disabled (yet linked), 0 `good first issue`s, no releases/tags, 7 Dependabot PRs left open ([joaco-munoz/resumai#3](https://github.com/joaco-munoz/resumai/pull/3), [#4](https://github.com/joaco-munoz/resumai/pull/4), [#6](https://github.com/joaco-munoz/resumai/pull/6), [#7](https://github.com/joaco-munoz/resumai/pull/7), [#8](https://github.com/joaco-munoz/resumai/pull/8), [#9](https://github.com/joaco-munoz/resumai/pull/9), [#11](https://github.com/joaco-munoz/resumai/pull/11)), 1 star / 0 forks. 76 of 123 commits are by `gpt-engineer-app[bot]` (Lovable), which is worth telling as part of the story rather than hiding. | v1.0.0 release, curated good-first-issues, Discussions on, Dependabot triaged, topics fixed. |

**Average: 2.1 / 5.** The product idea and breadth are real. What's missing is
everything that makes it *usable by anyone, free, without a terminal*, plus the
evidence (evals, tests) that the AI part is engineered rather than prompted.

---

## 2. Each persona's path, as it works today

Legend for each friction point: **[T]** needs a terminal · **[A]** needs an
account · **[K]** needs a key or payment · **[J]** jargon or prior knowledge ·
**[X]** breaks or confuses.

### Persona 1 — Non-technical end user ("URL → improved PDF in < 10 min, also on a phone")

| Step | What happens today | Friction |
|---|---|---|
| 1. Open a URL | **No public demo is documented.** The repo homepage field says `https://resumai.dev/`, but I couldn't reach it from this sandbox, so it is unverified. | **[X] Blocks here.** |
| 2. Landing | The landing renders correctly on a 390 px phone (no horizontal scroll, screenshot taken). But it sells a **Pro plan at $6.990 CLP/month** (`PricingSection.tsx:52`) and claims "IA Avanzada". Lighthouse (mobile): Perf 53 · A11y 73 · BP 93 · SEO 100. | [X] pricing in an OSS product. |
| 3. Start | "Empieza gratis" → `/auth?mode=signup`. An account is mandatory (email+password or Google), and email confirmation depends on the operator's Supabase settings. | **[A]** |
| 4. Create a CV | Tabbed builder (personal, summary, experience, education, skills); the onboarding modal explains the steps. | — |
| 5. Improve with AI | Works only if the operator configured a **paid** provider; otherwise it uses mock text (`[Demo] …`). Every error shows as "Verifica tu conexión". Free plan: 5 improvements/month (`useFeatureLimits.ts:29`). Output is always Spanish. | **[K]** (operator) · [X] |
| 6. Adapt to an offer | Match works with a paid provider. **"Adapt" then appends every missing keyword to the user's skills** and writes "Experiencia con {keyword}" into the summary (`CVAdaptationModal.tsx:126`, `:131-139`), presenting skills the user may not have. | **[X] (honesty)** |
| 7. Download | PDF/Word export works on the client. From the 2nd download on, free users get a **watermark** (`useDownloadManager.ts:85`). | [X] |
| 8. Kanban on a phone | `react-beautiful-dnd` is deprecated. Touch drag and drop is **not verified** (it needs a running backend; covered later by the mobile E2E). | ? |

Verdict: **fails at step 1.** Even with an instance, it fails "free real AI"
(steps 5–6) and "no account".

### Persona 2 — Non-technical person who wants their own copy ("< 30 min, no terminal")

Source: `docs/self-hosting.md` (option A).

| Step | What it asks for | Friction |
|---|---|---|
| 1. Install the prerequisites | Node, npm, the Supabase CLI and Docker (`docs/self-hosting.md:27-40`). | **[T][J]** |
| 2. Create a Supabase project | Done in the web dashboard. | [A] |
| 3. `supabase link --project-ref …` | Terminal + "project ref". | **[T][J]** |
| 4. `supabase db push` | Terminal; this one does not hit the seed bug, because it doesn't seed. | **[T]** |
| 5. `supabase secrets set AI_PROVIDER=openai AI_API_KEY=sk-…` | Terminal and a **paid** key. | **[T][K][J]** |
| 6. `supabase functions deploy` | Terminal. It also deploys the 4 payment functions. | **[T]** |
| 7. Vercel import + `VITE_SUPABASE_*` | Web UI, but no Deploy button and no help text per variable. Forgetting a variable gives a blank page (see Persona 1). | [A][J][X] |
| 8. Auth redirect URLs | Manual dashboard setting; easy to miss. | [J] |

Verdict: **impossible without a terminal**: 4 terminal steps, and a paid key
to get real AI.

### Persona 3 — Developer ("app running with real AI in < 5 min, nothing installed locally")

| Step | Today | Friction |
|---|---|---|
| 1. Open in Codespaces | No `.devcontainer/` and no badge. | [X] |
| 2. `npm install` | Works (`npm ci`: 483 packages, exit 0). | — |
| 3. `cp .env.example .env` | Fine. | — |
| 4. `npm run db:start` | Needs Docker + the Supabase CLI. In this sandbox the images could not be pulled (section 4); the command itself exists. | [T] |
| 5. `npm run db:reset` | **Fails on `seed.sql`** (invalid UUID). Verified against PostgreSQL 16 (section 3.1). | **[X]** |
| 6. Use the AI locally | The docs put secrets in `supabase/.env`, but the CLI auto-loads `supabase/functions/.env`, so `AI_PROVIDER=mock` is probably ignored. There is no Ollama preset, and `ai.ts:104` rejects an empty key, so a local Ollama needs a dummy key and a manual base URL. | [X][J] |
| 7. Real AI | Only with a paid key. | **[K]** |

Verdict: realistic time is 30–60 min, it fails at the seed, and the AI is mock
or paid.

---

## 3. Known debt: confirmed or discarded

| # | Item | Verdict | Evidence |
|---|---|---|---|
| 1 | `documentacionflow.md` is a copy of Flow's docs with broken encoding and probably shouldn't be in the repo | **Confirmed** | 221 KB OpenAPI spec with mojibake (`IntroducciÃ³n`; 584 lines contain `Ã`/`â€`). Third-party content of unclear license. Remove it and link Flow's docs instead. |
| 2 | `src/assets/Logo - copia.png` and onboarding images with spaces in their names | **Confirmed** | Imported by `src/components/landing/Footer.tsx:3`, `src/pages/Auth.tsx:7` and `src/components/onboarding/OnboardingModal.tsx:5-8` (`1er onboarding.png`, `2do ob.png`, …). Size is also an issue: `Logo.png` is 788 KB and `Favicon.png` 294 KB in `dist`. |
| 3 | `AppSidebar.tsx` may be dead since the Dock arrived | **Confirmed dead** | Nothing imports it (`grep -rn AppSidebar src` only matches the file itself). 351 lines. |
| 4 | MercadoPago UI calling the nonexistent `create-mercadopago-subscription` | **Partly confirmed** | `MercadoPagoSubscription.tsx:163` calls the missing function, but **nothing imports the component**, so users don't see it. It's dead code; README and ROADMAP still advertise "MercadoPago referenced in the UI". |
| 5 | About 82 lint warnings, mostly `any` | **Confirmed** | `npm run lint` → 0 errors, 82 warnings: 49 `no-explicit-any`, 23 `react-hooks/exhaustive-deps`, 10 `react-refresh/only-export-components`. |
| 6 | `react-beautiful-dnd` is deprecated | **Confirmed** | Version 13.1.1, used in 7 files (Kanban + experience/education reordering). `@hello-pangea/dnd` is the drop-in fork, so the change should be low-risk. |
| 7 | Only 2 test files, no E2E | **Confirmed** | 2 files / 20 tests, all passing (output in section 4). |
| 8 | No public demo | **Confirmed in the repo** | No demo URL in README or docs. The repo homepage `resumai.dev` could not be checked from here. |
| 9 | Landing has a pricing section that doesn't fit OSS | **Confirmed** | `src/pages/Index.tsx:92` renders `PricingSection` (Free vs Pro $6.990 CLP). The pricing lines also appear in `PlanCard.tsx` and `FlowSubscription.tsx`. |
| 10 | UI is Spanish-only, no i18n | **Confirmed** | No i18n library or `t()` calls; all strings are hard-coded. `index.html:2` declares `lang="en"`, which is wrong for screen readers. |
| 11 | Flow webhook doesn't verify HMAC | **Discarded as stated, replaced by two real gaps** | Flow does not sign its callbacks. Its own spec says the callback is a POST with only a `token`, and the merchant must call `payment/getStatus` (`documentacionflow.md:224-226`). The webhook already does exactly that with a signed request (`flow-webhook/index.ts:50-78`), so there's no inbound HMAC to verify. **Real gaps:** (a) it never checks the **amount/currency** against the plan; (b) a replayed `token` re-activates Pro for another 30 days from *now* (`flow-webhook/index.ts:100-132`). Both get a test in Phase 4. |
| 12 | The deleted extension's `.pem` is still in git history | **Confirmed (recorded only, not purged)** | Added in commit `54a8409` (2025-07-11) together with `chrome-extension.crx`. Still reachable in history. Rotation and purge stay as manual actions for you. |

### 3.1 New finding: the seed fails and `log_user_activity` is broken (verified)

I applied every migration in order, then the seed, to a fresh **PostgreSQL 16.15** with a minimal Supabase shim (`auth.users`, `auth.uid()`, roles, `pgcrypto`):

```
OK    20250620220033-…sql   … (all 13 migrations OK, including 20250719000000_reconcile_schema_and_security.sql)
FAIL  seed.sql
      psql:supabase/seed.sql:96: ERROR:  invalid input syntax for type uuid: "00000000-0000-0000-0000-0000000000j1"
      CONTEXT:  PL/pgSQL function inline_code_block line 5 during statement block local variable initialization
```

- **Why the "exception-safe block" didn't save it:** the error is in the `DECLARE` section (`seed.sql:19`). PL/pgSQL never catches errors raised there, so `supabase db reset` aborts and no demo user exists.
- **Second break:** `public.log_user_activity` inserts a `text` value into the `uuid` column `user_activity_logs.resource_id`:
  - every call fails with `column "resource_id" is of type uuid but expression is of type text`;
  - the bug is in both the original definition and the reconciled one (`20250706001921-…sql:113-137`, `20250719000000_…sql:160-176`);
  - `useActivityLogger` ignores the returned error (`src/hooks/useActivityLogger.ts:18`).
- **Consequence:** on any fresh install the "activity log" product signal records nothing, and the admin dashboard's activity data stays empty.

### 3.2 New finding: the quota added in PR #2 can be bypassed (reproduced)

In the same database I acted as a normal `authenticated` user, the way PostgREST runs requests:

```
--- 1) attacker self-upgrades to Pro via profiles UPDATE
 subscription_tier | is_premium
 pro               | t
--- 2) attacker burns the victim quota via SECURITY DEFINER RPC (5 calls)
 victim_can_use = f
--- 3) attacker resets own usage counter
 ai_improvements | 0
--- 5) as role anon:  can_use_feature(<victim>) -> t ; increment_feature_usage(<victim>) -> succeeds
```

Causes:

1. **Profiles UPDATE has no column limit.** `"Users can update their own profile" … FOR UPDATE USING (auth.uid() = id)` (`20250620220033-…sql:26-29`) lets a user write `subscription_tier` / `is_premium`. `can_use_feature` reads exactly those columns.
2. **Users can write their own usage counter.** `"Users can update their own usage"` (`20250705035333-…sql:54-55`).
3. **The RPCs trust a caller-supplied `p_user_id`.** `increment_feature_usage(p_user_id, …)` and `can_use_feature(p_user_id, …)` are `SECURITY DEFINER` and use the supplied user id (`20250719000000_…sql:76-127`). With Supabase's default grants they are executable by `anon` and `authenticated`. `log_user_activity(p_user_id, …)` has the same pattern; it is broken today, but it would allow forged logs once fixed.
4. **Users can edit their own subscriptions.** `"Users can update their own subscriptions"` (`20250620221621-…sql:263`).
5. **The quota fails open** on any RPC error (`_shared/auth.ts:65-68`).

For a demo whose AI runs on shared free capacity, this has to be fixed **first in
Phase 1**, not left until Phase 4.

### 3.3 Other findings not on your list

| Finding | Evidence | Impact |
|---|---|---|
| Legacy Supabase keys end at **end of 2026** | Supabase docs: "legacy `anon` and `service_role` keys keep working until the end of 2026". The app uses `VITE_SUPABASE_ANON_KEY`; edge functions need `SUPABASE_ANON_KEY` (`_shared/auth.ts:35`) and `verify_jwt = true` (`supabase/config.toml:11-32`), which "only understands the legacy JWT-based keys". | Persona 2 copies created next year get **publishable keys only** → AI functions break. Fix in Phase 1 (read `SUPABASE_PUBLISHABLE_KEYS`, `verify_jwt=false` + in-code auth). |
| Landing counter shows wrong numbers on a fresh install | `CounterSection.tsx:23-38` counts `cvs`/`profiles` as an anonymous visitor. RLS limits that to public CVs and to 0 profiles. | Shows ~0. The mission's rule "keep the counter only if it shows real data" requires a `SECURITY DEFINER` count RPC that exposes only aggregates, or removing the counter. |
| Waitlist handler fakes success | `Index.tsx:43-48` shows "¡Te hemos añadido…!" but stores nothing. The section is not rendered today (only imported, `Index.tsx:13`). | Dead code; remove it. |
| `functions/.env` path is wrong in docs | `docs/configuration.md:43-44`, `docs/ai-providers.md:65-69`, `docs/self-hosting.md:168`. | Local mock/Ollama config gets silently ignored. |
| Bundle | One JS chunk of **2,071.98 kB (615.66 kB gzip)**, no route splitting; PNG logos of 788 KB + 294 KB. | Landing LCP 9.1 s (Lighthouse mobile, local). |
| `npm audit` | 33 vulnerabilities: 4 critical, 19 high, 8 moderate, 2 low. Direct ones: `jspdf` (critical; fix ≥ 4.2.1 is [joaco-munoz/resumai#9](https://github.com/joaco-munoz/resumai/pull/9)), `vitest`/`@vitest/coverage-v8`, `vite`, `react-router-dom`, `postcss`, `zod`. | `jspdf` runs on user data in the browser, so patch it early. |
| Edge-function imports can't be type-checked here | `deno.land` and `esm.sh` are blocked in this sandbox (`jsr.io` and npm work); `deno` 2.9.6 installs from npm. | Moving to `npm:`/`jsr:` specifiers (Supabase's current style) makes `deno check` possible here and in CI. |

---

## 4. Environment check (what this sandbox can and cannot do)

| Capability | Result | Detail |
|---|---|---|
| Node / npm | ✅ | Node v22.22.0, npm 10.9.4; `npm ci` exit 0 |
| Baseline checks | ✅ all pass | `lint`: 0 errors / 82 warnings · `typecheck`: exit 0 · `test`: **20 passed (2 files)** · `build`: built in 16.89 s, main chunk 2,071.98 kB |
| Docker daemon | ✅ | Started `dockerd` 29.9.2 (4 vCPU Xeon 2.1 GHz, 15 GiB RAM, no GPU) |
| **Ollama** | ✅ | `ollama/ollama:latest` from Docker Hub → **v0.40.13** (≥ 0.31.2, the version that fixed JSON `format` with thinking off, ollama#14645) |
| **Qwen weights** | ✅ via Docker Hub | `ollama.com`, `registry.ollama.ai` and `huggingface.co` are blocked by the sandbox proxy. Docker Hub's `ai/qwen3.5` repo carries the same weights as OCI artifacts (Unsloth GGUF builds). Downloaded `Qwen3.5-{0.8B,2B,4B}-Q4_K_M.gguf` and imported them with `RENDERER/PARSER qwen3.5`. GGUF metadata: `general.license = apache-2.0`. ⚠️ Docker Hub's anonymous limit (100 manifests/h, shared IP) was hit once; it reset within the hour. |
| **Real evals on CPU here** | ✅ **feasible** | See the smoke test below. Phase 1 can publish real Ollama-on-CPU numbers. |
| Supabase CLI | ✅ | `npx supabase` v2.122.0 (npm package with a platform binary) |
| **Supabase local stack (`supabase start`)** | ❌ | `ghcr.io` blobs → 403. With `SUPABASE_INTERNAL_IMAGE_REGISTRY=public.ecr.aws` → `Data limit exceeded` (shared egress IP). Docker Hub is rate-limited. |
| SQL validation | ✅ workaround | The system PostgreSQL 16.15 plus a Supabase shim validates migrations, seed and RLS (section 3). This becomes a CI job in Phase 4. |
| Hosted Qwen APIs (OpenRouter, Cloudflare, HF router) | ❌ | Hosts blocked by the proxy, and no keys. Hosted evals need you (or an allow-list change). |
| Lighthouse / Playwright | ✅ | Lighthouse 12 + the preinstalled Chromium |
| `deno check` | ⚠️ | Deno installs from npm, but `deno.land`/`esm.sh` imports are blocked (see 3.3) |

**Smoke test** (3 prompts per model, `think:false`, temperature 0.2, JSON schema
through Ollama `format`). It shows feasibility only; **it is not the eval suite.**

| Model (Q4_K_M) | Gen speed | Prompt speed | Bullet (ES) | Summary (EN) | Match JSON |
|---|---|---|---|---|---|
| Qwen3.5-0.8B | ~19–22 tok/s | ~160–270 tok/s | ❌ produced 3 bullets and **invented** "optimizó las operaciones comerciales", "control total sobre las ventas y la logística" | OK | valid JSON, but `score: 0`, empty strengths |
| **Qwen3.5-2B** | **~11–13 tok/s** | ~130–140 tok/s | ✅ nothing invented, but a weak rewrite ("Atiendo clientes y resolviendo…") | ✅ | valid JSON, correct missing keywords (Next.js, GraphQL, WCAG, mentoring), `score: 0` |
| Qwen3.5-4B | ~6 tok/s | ~50–65 tok/s | ✅ "Atendí a los clientes y resolví reclamos en la tienda." | ✅ | valid JSON, correct keywords, `score: 0` |

What the smoke test tells us:

1. **0.8B is out** for rewriting: it hallucinated on the first try.
2. **Every size returned `score: 0`.** With `score` as the first schema field, the
   model commits to a number before it has "read" anything. Phase 1 should
   either compute the score **deterministically** from the extracted
   requirements vs. the CV (consistent between runs, which the mission's rubric
   asks for) or put it last.
3. **CPU latency is real.** A full match prompt (~1,500 tokens in, ~300 out) is
   estimated at ~35 s on 2B and ~75 s on 4B here. That makes streaming plus a
   fast fallback necessary, as the mission already anticipates.

---

## 5. Product proposals (you decide)

| # | Proposal | Impact on the three tests and the "wow" | Effort | Recommendation |
|---|---|---|---|---|
| P1 | **Import an existing CV (PDF)**. The text is extracted in the browser (`pdfjs-dist`, lazy-loaded), Qwen maps it to the CV schema (zod-validated + repair), and the user reviews before saving. | **High.** Most people already have a CV, so "URL → improved PDF in < 10 min" becomes realistic even on a phone. It also shows structured-extraction skill in the evals. | **M–L.** Lazy pdf.js, extraction prompt, 6–8 eval cases, review UI. Risk: a 2-page CV is ~1.5–2.5 k tokens, which takes ~45–90 s on CPU 2B, so it needs streaming/progress and the hosted fallback. | **Yes**, in Phase 2. Text-based PDFs only (no OCR), marked as such. |
| P2 | **Visible privacy:** "Delete my account and data" (an edge function using the service role, behind re-auth) and "Download my data" (JSON, client-side). | **High for trust.** It's also a story point ("your data, your control"). | **S–M** | **Yes** (already in Phase 2.5). |
| P3 | **Make "Adapt to offer" honest.** The AI rewrites summary and bullets using only facts in the CV. Missing keywords are shown as "Do you have this? Add it yourself", never auto-inserted. | **High.** It fixes a feature that currently breaks the no-invention rule. | **M** | **Yes.** Strictly a fix, but it changes visible behavior, so I'm asking. |
| P4 | **Deterministic, explainable match score:** Qwen extracts requirements + evidence, and code computes the score. | **High** for "consistent score between runs" in the evals. | **S–M** | **Yes.** |
| P5 | **Remove the watermark and the Pro upsell** from the default experience. Daily limits stay only to protect the shared free capacity ("Te quedan 4 mejoras hoy"); Flow stays as an opt-in module. | **Medium–High.** It removes the "freemium SaaS" smell in an OSS product. | **S** | **Yes** (consistent with "Flow off by default"). |

I am not proposing anything else new: no cover letters, no templates. Everything
above either serves the three success tests or fixes an honesty problem.

---

## 6. Initial Qwen recommendation (final choice comes from Phase 1 evals)

Facts first (sources in section 10):

- **Latest generation: Qwen3.8** (27B and 2.4T-A95B, released Aug 2026). It has
  **no small model**.
- **Latest generation with small open models: Qwen3.5**, released 2026-03-02
  (0.8B, 2B, 4B, 9B). Licensed **Apache-2.0**, confirmed from the GGUF metadata of
  the files run here.
- Qwen3.5 small models are hybrid (Gated DeltaNet + attention) and natively
  multimodal; text-only use is fine.
- Thinking defaults: 0.8B/2B are **non-thinking**, 4B/9B are **thinking**. Always
  send `think:false` in Ollama, or `enable_thinking:false` through chat-template
  kwargs.
- The `/no_think` prompt switch is not supported in Qwen3.5.

| Path | Candidates to evaluate | Initial pick | Why |
|---|---|---|---|
| **Local + Codespaces** (Ollama, 2–4 cores, 8–16 GB) | `qwen3.5:2b`, `qwen3.5:4b` (Q4_K_M) | **2B by default, 4B as "better quality"** | Measured here: 2B runs at ~12 tok/s and hallucinated nothing in the smoke test. 4B is better but runs at ~6 tok/s. The model is 1.3 GB on disk / ~1.8 GB loaded (2B), so it fits a 2-core/8 GB Codespace. |
| **Own demo server** (Ollama on CPU) | same | **2B** (4B only on ≥ 4 vCPU if eval latency is acceptable) | See section 7: where to host it is now an open decision. |
| **Hosted API with a free tier** | Cloudflare Workers AI `@cf/qwen/qwen3-30b-a3b-fp8` or `@cf/qwen/qwen3.8-27b`; OpenRouter `qwen/qwen3.8-27b:free` | **Cloudflare Workers AI first, OpenRouter second** | Cloudflare: 10,000 neurons/day renewing, no card, no training on customer data, OpenAI-compatible endpoint. OpenRouter `:free`: 20 RPM / 50 req/day (1,000/day after a one-time $10 top-up), and free-model providers may log data. Estimate (unverified): a match ≈ 20 neurons on qwen3-30b-a3b ⇒ roughly 500 matches/day for free. |
| **Browser (WebLLM, experimental)** | `Qwen3.5-2B-q4f16_1` (2,245 MB VRAM), `Qwen3.5-0.8B-q4f16_1` (1,629 MB) | **2B**, with 0.8B as a low-VRAM option | Qwen3.5 has been supported since web-llm 0.2.83; the latest is 0.2.86 (2026-10-11). The context is capped at **4,096 tokens**, enough for bullet/summary and tight for a long match. |

**Not chosen:**

- **Qwen3.5-9B** (6.6 GB, too slow for CPU) — only revisited if 4B fails the
  quality bar.
- **Qwen3-4B-Instruct-2507** (older generation) — kept as a fallback candidate if
  Qwen3.5's hybrid architecture gives trouble in some runtime.

---

## 7. Evidence against an existing decision: Hugging Face Docker Spaces are no longer free

**Decision in the mission:** the demo's own Ollama server and Persona 2's "AI
server on Hugging Face" both run on a **free** Docker Space.

**Evidence:**

- The Hugging Face Hub docs (spaces-overview) say Gradio and Docker Spaces
  **require a paid plan to create**: PRO for personal accounts, Team/Enterprise
  for orgs.
- Free accounts keep Static Spaces and up to 2 ZeroGPU Gradio Spaces.
- Forum reports since July 2026: creating, *duplicating* or moving a Docker Space
  on cpu-basic without PRO fails with HTTP 402. Spaces that already run on CPU
  Basic keep running.
- CPU Basic is still 2 vCPU / 16 GB RAM / 50 GB ephemeral disk, and it sleeps
  after 48 h of inactivity.

**Caveat:** I could not open huggingface.co from this sandbox. This comes from
the official docs page as surfaced by search, plus forum threads.

**Consequence:** the Persona 2 path "duplicate this Space" now costs about
US$9/month (PRO price unverified). The public demo's own server either costs that
too or needs another host.

**Options:**

| Option | Cost | Persona-2 friendly? | Notes |
|---|---|---|---|
| **A. Restructure the chain (recommended)** | Free | ✅ | Default for every copy: **Cloudflare Workers AI (Qwen) → OpenRouter `:free` (Qwen) → plain-language message**. The own Ollama server becomes an **optional first link** that the public demo uses if you provide one (HF PRO, a VPS, or your own machine). Persona 2 trades the HF step for a Cloudflare account + token, with no card. The `deploy/ollama-server/` template is still delivered and documented as optional. |
| B. Pay HF PRO for the demo server only | ~US$9/mo (unverified) | ❌ for persona 2 | Keeps "own Ollama server" as the demo's first link; persona 2 still uses option A. |
| C. Oracle Cloud Always Free / other VPS | Free but **needs a card**, and setup is complex | ❌ | Not researched in depth; I'd only document it as advanced. |

Ollama stays the runtime for local, Codespaces and the optional server, so
**Decision 2 (Ollama) is unaffected.** Only the hosting assumption changes.

---

## 8. Prioritized plan (phases adjusted to what was found)

The ordering principle is to make the shared free AI **safe** before making it
**available**.

### Phase 1 — Free AI with Qwen (most important), reordered

1. **1.0 Safety first** (moved up from Phase 4):
   - fix the RLS/RPC bypasses: column-restricted profile updates or a separate server-owned plan table, no user writes to `user_usage`/`subscriptions`, RPCs derive the user from `auth.uid()`, `EXECUTE` revoked from `anon`;
   - make the quota fail **closed**;
   - add input-size limits;
   - fix `seed.sql` and `log_user_activity`;
   - add a **CI job that applies migrations + seed to Postgres and runs RLS tests**.
2. **1.1** Migrate edge functions to `npm:`/`jsr:` imports plus new Supabase API
   keys (legacy keys end in Dec 2026), so they can be `deno check`ed.
3. **1.2–1.6 AI layer and prompts:**
   - presets `ollama`, `cloudflare`, `openrouter` (plus existing `openai`/`deepseek`/`mock`);
   - an ordered fallback chain with a short timeout, health check and warm-up ping;
   - SSE streaming;
   - Ollama `format` JSON schema + zod + repair prompt;
   - short versioned prompts in `_shared/prompts/`, answering in the CV's language;
   - a deterministic match score;
   - per-user/IP rate limits (persisted in Postgres).
4. **1.8** Telemetry table (no CV content) + an admin view.
5. **1.9 Evals:**
   - `npm run eval` with a 24-case golden set (ES/EN, junior/senior, hard cases);
   - **real runs here** on Ollama 0.8B/2B/4B (CPU);
   - hosted runs need your keys or network allow-listing (exact commands provided);
   - mock mode in CI.
6. **1.10** WebLLM privacy mode, **last** in the phase, experimental.

**Deferred:** 1.7 "Bring your own free key" moves to after Phase 3. It is medium priority, and option A in section 7 already gives every copy free AI.

### Phase 2 — A product anyone can use

- Guest mode via Supabase anonymous sign-ins + Turnstile, upgrading to an account without losing data; magic link as the main login.
- Honest adaptation (P3); remove watermark/upsell (P5); guided first CV; mobile pass; ES/EN i18n.
- Landing reframe (three buttons, no pricing, honest feature list, "Open source & open AI"); privacy (P2).
- Cleanup of phantom UI: MercadoPago, AppSidebar, waitlist, false claims.
- Import CV (P1) if approved; a11y work toward Lighthouse ≥ 90 (from 73).

### Phase 3 — Your own copy without a terminal

- `deploy-backend.yml` (`workflow_dispatch`, fork-only guard).
- Vercel Deploy button: the Supabase Marketplace integration injects `NEXT_PUBLIC_SUPABASE_*`/`SUPABASE_*`, not `VITE_*`, so Vite needs `envPrefix`/aliases.
- `.devcontainer/` with Ollama + `qwen3.5:2b`.
- `npm run setup`.
- ES/EN no-code guides, validated by a context-free subagent until clean.
- **Not verifiable here:** Vercel, Supabase cloud, Codespaces, Cloudflare. Exact steps will be listed for you.

### Phase 4 — Engineering that survives a review

- Playwright E2E (desktop + mobile, mock AI).
- CI: E2E, `deno check`, eval-mock, actionlint, devcontainer, SQL/RLS.
- `any` → 0 or justified.
- Dependencies: `jspdf` ≥ 4.2.1, `@hello-pangea/dnd` replacing `react-beautiful-dnd`, plus Dependabot triage.
- Route code-splitting and lazy PDF/Word/WebLLM/charts, with before/after bundle size + Lighthouse.
- Flow amount/replay checks with tests.
- Independent security review subagent.
- Cleanup: Flow spec, asset names, docs paths.

### Phase 5 — The story

README (+ `README.es.md`) with a GIF recorded by Playwright, mermaid diagram of
the chain, AI runtime table and evals link. Case study, ADRs, v1.0.0 notes,
good-first-issues, CONTRIBUTING with Codespaces first.

### If we have to cut (proposed order, from first cut to last)

1. WebLLM privacy mode: ship it as a documented experiment, or not at all.
2. BYO free key (1.7).
3. Import CV (P1).
4. Full i18n of admin/billing screens; only the main flow gets EN.
5. Lighthouse ≥ 90 on the dashboard; the landing keeps priority.

**Never cut:** safety (1.0), free Qwen chain, evals, guest mode, no-terminal copy,
E2E of the critical flow.

### What I could **not** verify in Phase 0, and how you can

| Item | Why not | How to confirm |
|---|---|---|
| Supabase local stack (`supabase start`) | Image registries blocked or rate-limited from this sandbox | On your machine: `npx supabase start && npx supabase db reset`. Expect the seed error from 3.1 until Phase 1 fixes it. |
| `resumai.dev` live state | Host not resolvable from here | Open it in your browser. |
| HF Docker Space paywall, Cloudflare/OpenRouter free tiers | `huggingface.co`, `developers.cloudflare.com` and `openrouter.ai` are blocked here; facts come from official pages via search | Create a Space and check whether "Docker" says *Paid*; open the Cloudflare Workers AI pricing page. |
| Kanban drag on a phone, in-app mobile flow | Needs a running backend | Covered by the Phase 4 mobile E2E. |

---

## 9. Decisions I need from you

1. **"Mis datos" is unfilled in the mission:**
   - name for `LICENSE`/authorship (today it says "ResumAI contributors");
   - real metrics you can share (or "ninguna");
   - which accounts you have (Vercel, Supabase, Hugging Face, Codespaces);
   - demo domain;
   - your cut priority.
2. **Hosting for the AI server** (section 7): A (recommended), B or C?
3. **Free hosted Qwen APIs:** OK to use **Cloudflare Workers AI** (primary) and **OpenRouter `:free`** (secondary)? Both need accounts that only you can create.
4. **Product proposals P1–P5:** yes/no for each.
5. **Shared-capacity limits for the public demo:** I propose per user per day 10 AI rewrites, 3 matches and 2 imports, plus a per-IP cap for guests. Change the numbers if you like.
6. **Plan and cut list** in section 8: approve or adjust.
7. **Optional, speeds up Phase 1:** allow these hosts in this cloud environment's network settings so I can run hosted evals and the Codespaces/Ollama path for real:
   - `ollama.com`, `registry.ollama.ai`;
   - `huggingface.co`;
   - `openrouter.ai`, `api.cloudflare.com`;
   - `ghcr.io`, `pkg-containers.githubusercontent.com`.

   Each one you leave blocked is listed as "not verified" with exact steps for you.

---

## 10. Sources (all accessed 2026-10-29)

**Qwen and runtimes**

- QwenLM release timeline, Qwen3.5 sizes (2026-03-02: 9B/4B/2B/0.8B), "201 languages", llama.cpp support — https://github.com/QwenLM/Qwen3.5 · Qwen3.8 (2026-08-12/14) — https://github.com/QwenLM/Qwen3.8 · Qwen3 Apache-2.0 — https://github.com/QwenLM/Qwen3
- Qwen3.5 model cards: thinking defaults, architecture, IFEval/BFCL (search snippets of the official pages) — https://huggingface.co/Qwen/Qwen3.5-2B, https://huggingface.co/Qwen/Qwen3.5-4B
- License, verified locally: GGUF metadata `general.license = apache-2.0`, `general.license.link = https://huggingface.co/Qwen/Qwen3.5-{0.8B,2B,4B}/blob/main/LICENSE`; Docker Hub descriptor `"licenses":["Apache-2.0"]` — https://hub.docker.com/r/ai/qwen3.5
- Ollama releases (v0.17.4/0.17.5 Qwen3.5 support; latest v0.40.13) — https://github.com/ollama/ollama/releases · JSON-format-with-thinking-off bug fixed in 0.31.2 — https://github.com/ollama/ollama/issues/14645
- WebLLM prebuilt models and VRAM — https://raw.githubusercontent.com/mlc-ai/web-llm/main/src/config.ts · Qwen3.5 support PR — https://github.com/mlc-ai/web-llm/pull/820 · npm 0.2.86 — https://registry.npmjs.org/@mlc-ai/web-llm/latest

**Hosting and free tiers**

- HF Spaces paid requirement for Gradio/Docker — https://huggingface.co/docs/hub/en/spaces-overview · forum, July 2026 — https://discuss.huggingface.co/t/docker-sdk-now-marked-as-paid-when-creating-a-new-space/177580 · https://discuss.huggingface.co/t/new-free-accounts-cannot-create-cpu-basic-gradio-spaces-only-zerogpu-available/177629
- Cloudflare Workers AI pricing/free neurons and Qwen models — https://developers.cloudflare.com/workers-ai/platform/pricing/ · https://developers.cloudflare.com/workers-ai/models/qwen3-30b-a3b-fp8/ · data usage — https://developers.cloudflare.com/workers-ai/platform/data-usage/
- OpenRouter free models and limits — https://openrouter.ai/qwen/qwen3.8-27b:free · logging — https://openrouter.ai/docs/guides/privacy/provider-logging
- Supabase Edge Function limits (256 MB, 150 s wall clock free, 2 s CPU) — https://supabase.com/docs/guides/functions/limits · local secrets in `supabase/functions/.env` — https://supabase.com/docs/guides/functions/secrets · legacy keys end of 2026 — https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys · anonymous sign-ins — https://supabase.com/docs/guides/auth/auth-anonymous · CAPTCHA (Turnstile) — https://supabase.com/docs/guides/auth/auth-captcha · free-plan pausing — https://supabase.com/docs/guides/platform/free-project-pausing · Vercel Marketplace env vars — https://supabase.com/docs/guides/integrations/vercel-marketplace
- Codespaces quotas — https://docs.github.com/billing/managing-billing-for-github-codespaces/about-billing-for-github-codespaces · badge/quickstart — https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/setting-up-your-repository/facilitating-quick-creation-and-resumption-of-codespaces
- Vercel Deploy button parameters — https://vercel.com/docs/deploy-button/source · env vars — https://vercel.com/docs/deploy-button/environment-variables · Hobby plan — https://vercel.com/docs/plans/hobby
- Flow callback behavior: Flow's own OpenAPI spec as committed (`documentacionflow.md:224-226`)
