# Security Policy

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Instead, report privately using **GitHub Security Advisories**:

1. Go to the repository's **Security** tab → **Report a vulnerability** (this
   opens a private [GitHub Security Advisory](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)).
2. Describe the issue, affected version/commit, and reproduction steps.

If private advisories are not enabled on a fork, contact the maintainers through
the channel listed on the repository's profile. _(Maintainers: replace this line
with a real security contact if you prefer email.)_

We aim to acknowledge reports within a few days and to coordinate a fix and
disclosure timeline with you. Please give us reasonable time to remediate before
any public disclosure.

## What NOT to put in a report or issue

- Real API keys, tokens, service-role keys, or passwords — **revoke/rotate them
  immediately** instead, then reference that they were exposed.
- Real personal data or real resumes.
- Live exploit payloads against third-party production systems.

## Supported versions

ResumAI is pre-1.0 and evolving. Security fixes are applied to the **latest**
`main`. There are no long-term-support branches yet.

| Version | Supported |
|---------|-----------|
| `main` (latest) | ✅ |
| older tags | ❌ |

## Project-specific risks to be aware of

Because ResumAI is **self-hosted** and processes personal data, keep these in
mind when you deploy:

- **API keys.** AI and Flow keys must be set as **server-side edge-function
  secrets** (`supabase secrets set …`) — never as `VITE_`-prefixed variables,
  which are bundled into the public browser build. The Supabase **anon** key is
  publishable by design (protected by RLS); the **service-role** key must never
  leave the server.
- **Resume data.** CVs are personal data stored in your Supabase project,
  isolated per-user by Row Level Security. If you send content to a real AI
  provider, that content leaves your infrastructure — use the `mock` provider to
  avoid this entirely.
- **Chrome extension signing key.** A previous version of this repository
  committed a Chrome extension private key (`chrome-extension.pem`). It has been
  removed, but **it exists in git history and must be treated as compromised**:
  regenerate the extension signing key before publishing an extension, and
  consider purging it from history (`git filter-repo` / BFG) — a history rewrite
  requires a force-push and coordination with any forks.
- **Quotas & cost.** AI edge functions enforce per-user monthly quotas
  server-side, but you are responsible for monitoring provider spend on your own
  account.

## Hardening checklist for self-hosters

- Set edge-function secrets via the Supabase CLI/dashboard, not in the frontend.
- Restrict `ALLOWED_ORIGINS` for edge functions to your app's origin in
  production.
- Keep RLS enabled on all tables; review policies when adding tables.
- Rotate any credential that may have been exposed.
