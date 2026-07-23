# AI Providers

ResumAI's AI features — CV summary improvement, bullet-point rewriting, and
job-compatibility analysis — run **only server-side**, inside Supabase Edge
Functions. API keys are read from the environment and **never reach the
browser**. The layer is provider-agnostic: you bring your own key and choose the
provider that fits your budget and privacy requirements, or run fully offline
with the built-in `mock` provider.

This page explains how to configure each provider. For installation and the
first-run flow, see the [Installation guide](./installation.md); for the overall
stack, see the [README](../README.md).

## How the AI layer works

All provider logic lives in a single, provider-agnostic module:

- **[`supabase/functions/_shared/ai.ts`](../supabase/functions/_shared/ai.ts)**

It exposes two functions the edge functions rely on:

- `resolveAIConfig(env)` — reads the `AI_*` environment variables and produces a
  normalized config (provider, key, base URL, model, and tuning parameters),
  applying per-provider defaults when values are omitted.
- `createChatCompletion(config, params)` — sends an OpenAI-style
  `/chat/completions` request, with a timeout, bounded retries and exponential
  backoff, and normalized errors. In `mock` mode it returns deterministic output
  with **no network access**.

Every supported provider speaks the OpenAI `/chat/completions` schema, so adding
one is a matter of configuration, not code. Usage is also metered per user
server-side via the `can_use_feature` / `increment_feature_usage` RPCs (free-tier
limits: `ai_improvements` 5/month, `job_matcher_advanced` 3/month), independently
of which provider you pick.

## Environment variables

These are **edge-function secrets** — server-side only. Never prefix them with
`VITE_` and never ship them to the client. They are documented alongside the rest
of the configuration in [`.env.example`](../.env.example).

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `AI_PROVIDER` | No | `openai` | One of `openai`, `deepseek`, `openai-compatible`, `mock`. |
| `AI_API_KEY` | Yes (except `mock`) | — | API key for the selected provider. `OPENAI_API_KEY` is honored as a fallback. |
| `AI_BASE_URL` | Depends | per-provider preset | API base URL. Required for `openai-compatible`; presets exist for `openai` and `deepseek`. |
| `AI_MODEL` | Depends | per-provider preset | Model name. Required for `openai-compatible`; presets exist for `openai` and `deepseek`. |
| `AI_TEMPERATURE` | No | `0.7` | Sampling temperature (some functions override this per call). |
| `AI_MAX_TOKENS` | No | `1000` | Max completion tokens (some functions override this per call). |
| `AI_TIMEOUT_MS` | No | `30000` | Per-request timeout in milliseconds. |
| `AI_MAX_RETRIES` | No | `2` | Retries for timeouts and `429` / `5xx` responses. |

For any real (non-`mock`) provider the layer requires a **non-empty**
`AI_API_KEY` plus a resolved `AI_BASE_URL` and `AI_MODEL`; otherwise the function
returns a configuration error instead of calling out.

## Setting the secrets

For a **hosted** Supabase project, set secrets with the CLI:

```sh
supabase secrets set AI_PROVIDER=openai AI_API_KEY=sk-your-provider-key
```

For **local** development with `supabase functions serve`, put the same values in
`supabase/.env` (gitignored) instead:

```sh
# supabase/.env
AI_PROVIDER=openai
AI_API_KEY=sk-your-provider-key
```

Then serve the functions:

```sh
supabase functions serve
```

## Providers

### OpenAI (default)

The default provider. No `AI_BASE_URL` or `AI_MODEL` needed unless you want to
override the presets.

```sh
# supabase/.env
AI_PROVIDER=openai
AI_API_KEY=sk-...
# AI_MODEL=gpt-4o        # default; e.g. gpt-4o-mini for lower cost
```

- **Base URL (preset):** `https://api.openai.com/v1`
- **Model (preset):** `gpt-4o`
- **Cost:** Paid, usage-based per token. `gpt-4o` is a premium model; consider a
  smaller model such as `gpt-4o-mini` to cut cost substantially. Check OpenAI's
  pricing page for current rates.
- **Privacy:** CV text (summary, bullet points, or the assembled CV for job
  matching) is sent to OpenAI's API for processing. Review their data-usage and
  retention policies.
- **Limitations:** Requires a funded OpenAI account and network egress from
  wherever the edge functions run.

### DeepSeek

OpenAI-compatible, configured as a first-class provider with presets.

```sh
# supabase/.env
AI_PROVIDER=deepseek
AI_API_KEY=sk-...
# AI_MODEL=deepseek-chat   # default
```

- **Base URL (preset):** `https://api.deepseek.com/v1`
- **Model (preset):** `deepseek-chat`
- **Cost:** Paid, usage-based, typically much cheaper per token than OpenAI's
  flagship models. Check DeepSeek's pricing page for current rates.
- **Privacy:** CV text is sent to DeepSeek's API for processing. Review their
  data-usage and retention policies (note that servers are operated in China).
- **Limitations:** Requires a funded DeepSeek account.

### OpenAI-compatible (Groq, Together, Ollama, LM Studio, ...)

Use this for any endpoint that implements the OpenAI `/chat/completions` schema.
There is **no preset**, so you must set both `AI_BASE_URL` and `AI_MODEL`.

```sh
# supabase/.env — example: Groq
AI_PROVIDER=openai-compatible
AI_BASE_URL=https://api.groq.com/openai/v1
AI_MODEL=llama-3.3-70b-versatile
AI_API_KEY=gsk_...
```

Common base URLs (verify against the provider's docs, as they change):

| Endpoint | Example base URL | Notes |
| --- | --- | --- |
| Groq | `https://api.groq.com/openai/v1` | Hosted, paid; fast inference. |
| Together AI | `https://api.together.xyz/v1` | Hosted, paid; wide model catalog. |
| Ollama | `http://localhost:11434/v1` | Local, free compute; runs models on your machine. |
| LM Studio | `http://localhost:1234/v1` | Local, free compute; desktop model runner. |

- **Recommended model:** Any chat model your endpoint serves (for example a Llama
  or Mixtral variant). Consult the provider's model list and set `AI_MODEL`
  accordingly.
- **Cost:** Varies. Hosted services (Groq, Together) are usage-based and paid;
  local runtimes (Ollama, LM Studio) cost nothing beyond your own hardware.
- **Privacy:** For hosted endpoints, CV text is sent to that third party — review
  their policies. For **local** endpoints, data stays on your machine.
- **Limitations:**
  - The layer requires a **non-empty** `AI_API_KEY`. For local endpoints that do
    not authenticate (Ollama, LM Studio), set any placeholder value (e.g.
    `AI_API_KEY=local`).
  - Job-compatibility analysis requests a JSON-object response; a model or
    endpoint that ignores `response_format` may return malformed output, which
    the function rejects. Prefer models with reliable JSON adherence.
  - `localhost` endpoints only work when the edge functions run on the same
    machine (`supabase functions serve`). They are **not** reachable from
    Supabase-hosted functions in the cloud.

### Mock (offline / dev / testing)

A deterministic, offline provider that returns canned responses with **no network
calls and no cost**. It is the default for demos, local development, and the test
suite, and needs no API key.

```sh
# supabase/.env
AI_PROVIDER=mock
```

- **Cost:** Zero. Nothing leaves your machine.
- **Privacy:** No CV data is ever sent anywhere.
- **Behavior:** Each AI feature supplies a realistic canned response (for example,
  a lightly annotated version of the input, or a fixed job-match result), so the
  full UI flow works end to end without a provider.
- **Limitations:** Output is fixed and non-intelligent — use it to exercise the
  app and tests, not to evaluate real AI quality.

## Adding a new provider

If a service speaks the OpenAI `/chat/completions` schema, you do **not** need to
write code. Configure it as an OpenAI-compatible provider:

```sh
supabase secrets set \
  AI_PROVIDER=openai-compatible \
  AI_BASE_URL=https://your-endpoint.example.com/v1 \
  AI_MODEL=your-model-name \
  AI_API_KEY=your-api-key
```

The layer will POST to `${AI_BASE_URL}/chat/completions` with a
`Bearer ${AI_API_KEY}` header. If a provider needs genuinely different behavior
(a non-OpenAI schema, custom headers, or a new preset), that belongs in the
abstraction at
[`supabase/functions/_shared/ai.ts`](../supabase/functions/_shared/ai.ts) —
extend `AIProviderName`, add a preset or branch, and cover it in
[`ai.test.ts`](../supabase/functions/_shared/ai.test.ts).

## Privacy: what data is sent

- With **`mock`**, nothing is transmitted; all processing is local and offline.
- With any **real** provider, the relevant CV text is sent to that provider:
  the professional summary (content improvement), a single bullet point
  (bullet rewriting), or the assembled CV plus the job description
  (job-compatibility analysis).
- CV records hold personal data and are isolated per user by Row Level Security;
  choosing a provider is choosing who else sees that text. Prefer a **local**
  OpenAI-compatible endpoint or the `mock` provider when data must not leave your
  environment.

Self-hosting ResumAI does not by itself make you compliant with any particular
data-protection regime; evaluate your chosen provider's terms against your own
obligations.

## Testing without spending credits

The AI-layer unit tests in
[`ai.test.ts`](../supabase/functions/_shared/ai.test.ts) inject a fake `fetch`,
so they make **no real network calls and consume no credits** while covering the
mock provider, retries, timeouts, invalid/empty responses, provider errors, and
config resolution. Run them with:

```sh
npm test
```
