# Roadmap

This roadmap reflects the **current, honest** state of ResumAI and where it's
headed. It is intentionally free of fixed dates. Statuses:

- ✅ **Available** — implemented and usable today.
- 🔵 **In progress** — actively being worked on.
- 🟡 **Planned** — intended, not started.
- 🔎 **Under consideration** — being evaluated; may not happen.
- 🚫 **Out of scope** — deliberately not planned.

## Product vision

A resume tool that people can **run themselves**, that uses AI **responsibly**
and **transparently**, and that never locks users in: bring your own AI provider,
keep your data in your own Supabase project, and pay providers directly.

## Current capabilities (✅ Available)

- Multi-section CV builder with autosave and multiple CVs per account
- AI improvement of professional summary and experience bullets (BYOK)
- Job ↔ CV matching with a structured report (score, strengths, missing
  keywords, suggestions)
- Kanban application tracking
- PDF and Word export (client-side)
- Supabase Auth (email/password + Google) with per-user RLS isolation
- Provider-agnostic AI layer (OpenAI / DeepSeek / OpenAI-compatible / **mock**)
- Reproducible database (migrations + demo seed) and unit tests that don't spend
  AI credits

## In progress (🔵)

- Server-side quota/cost hardening for AI endpoints
- Richer, savable job-match reports

## Planned (🟡)

- **Self-serve account & data deletion** from the UI (today deletion cascades at
  the DB level and is performed via Supabase admin)
- **End-to-end tests** (Playwright): app boot, auth/demo, create CV, mock AI
  generation, persistence, route protection
- **MercadoPago** subscription backend (currently referenced in the UI only)
- Additional **resume templates**
- **Data export** (download all your data as JSON)

## Under consideration (🔎)

- **Per-user encrypted API keys** (each end-user supplies their own key, stored
  encrypted rather than as a shared server secret)
- More first-class **AI providers** (Anthropic, Gemini, local models) as presets
- **Internationalization** (the UI is currently primarily Spanish)
- Optional, **opt-in** telemetry / error tracking
- Storybook for the component library

## Out of scope (🚫)

- Automated deploys to production from this repository
- Shipping any real credentials, keys, or personal data in the repo or tests
- Marking regulatory compliance (GDPR/CCPA) as "guaranteed" without a real legal
  review

---

Have an idea? Open a
[Discussion](https://github.com/joaco-munoz/resumai/discussions) under **Ideas**.
Want to build one of these? See [CONTRIBUTING.md](./CONTRIBUTING.md).
