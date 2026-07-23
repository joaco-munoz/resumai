# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project aims to follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> This changelog begins with the open-source preparation of ResumAI. Earlier
> development happened in a private repository and is not versioned here.

## [Unreleased]

### Added
- Provider-agnostic AI layer (`supabase/functions/_shared/ai.ts`) supporting
  OpenAI, DeepSeek, any OpenAI-compatible endpoint, and a deterministic **mock**
  provider (offline, zero cost), with configurable model, temperature, tokens,
  timeout and retries.
- Server-side per-user quota enforcement for AI features (`can_use_feature` /
  `increment_feature_usage`).
- Reproducible database: a reconciliation migration recreating the columns and
  RPCs the app requires, plus a fictional demo seed (`supabase/seed.sql`,
  `demo@resumai.local`).
- `.env.example`, env-driven Supabase configuration, and typed `import.meta.env`.
- Tooling: `typecheck`, `test`, `format` and `db:*` npm scripts; Vitest tests for
  the AI layer (mock/retries/timeouts/invalid responses) and a pure util;
  Prettier config; `.nvmrc` and `engines`.
- Open-source documentation: `README`, `ARCHITECTURE.md`, `CONTRIBUTING.md`,
  `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md`, `ROADMAP.md`, `LICENSE`
  (MIT), and a `docs/` suite; GitHub issue/PR templates, CI, and Dependabot.

### Changed
- Refactored the three AI edge functions onto the shared AI layer with
  authentication, quota enforcement, timeouts/retries and tighter CORS/logging.
- Wired the Job Matcher to the real `analyze-job-compatibility` edge function
  (previously it called a nonexistent endpoint).
- Single package manager (npm); removed the competing `bun.lockb`.
- Fixed `index.html` social/favicon asset paths that broke in production.

### Fixed
- **Security:** closed an IDOR in `analyze-job-compatibility` (the user is now
  derived from the verified JWT instead of a client-supplied `userId`).
- **Security:** `business_metrics` is no longer world-readable; the `admin_users`
  RLS policy no longer self-references (infinite recursion); `SECURITY DEFINER`
  functions now pin `search_path`.
- Reduced sensitive logging in the Flow webhook.
- Removed a duplicate migration file and resolved all ESLint errors.

### Removed
- The experimental **Chrome extension** (`chrome-extension/`), which never
  reached a finished state, along with its committed private signing key
  (`chrome-extension.pem`) and packaged `.crx`. **The key remains in git history
  and must be treated as compromised and rotated** — see [SECURITY.md](./SECURITY.md).

[Unreleased]: https://github.com/joaco-munoz/resumai/commits/main
