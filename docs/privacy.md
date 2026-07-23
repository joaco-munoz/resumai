# Privacy and data handling

ResumAI is a **self-hosted** application: when you run it, the data lives in
**your** Supabase project and is processed by **your** AI provider of choice.
There is no ResumAI-operated service collecting your data. This page explains
what personal data ResumAI stores, how it is isolated, what leaves your
infrastructure, and what you — as the operator — are responsible for.

> This document describes how the software handles data. It is **not** a legal
> privacy policy, and ResumAI does **not** claim GDPR, CCPA, or any other
> regulatory compliance. See [Self-hoster responsibilities](#self-hoster-responsibilities).

For the deployment model and secret handling, see
[self-hosting.md](./self-hosting.md) and [SECURITY.md](../SECURITY.md). For the
full schema, see the [Database](../README.md#database) section of the README.

## What data ResumAI stores

All application data is stored in your Supabase Postgres database across 14
tables (RLS enabled on every one). The personal data broadly falls into:

- **Account / identity** — the `profiles` table holds `full_name` and `email`,
  populated from Supabase Auth on sign-up. Authentication credentials
  themselves are managed by Supabase Auth (`auth.users`), not by application
  tables.
- **CV content** — the `cvs` table stores each resume: `title`, the full resume
  body in a `content` JSONB column, `target_job_title` / `target_industry`, and
  AI output such as `ai_score` and `ai_feedback`. This is the most sensitive
  personal data in the app.
- **Job-search data** — `job_descriptions`, `cv_job_matches`,
  `job_applications`, and `job_applications_tracking` (the Kanban board) hold
  job postings you paste in and the applications you track.
- **Usage and product analytics** — `user_activity_logs`, `feature_usage`,
  `user_usage`, `business_metrics`, and `nps_responses` record per-user activity
  and quota counters used to enforce free-tier limits.
- **Billing (only if you enable payments)** — `subscriptions` and `payments`
  hold subscription and payment records. Payments are optional; see
  [Payments are optional](./self-hosting.md#payments-are-optional).

**No Supabase Storage buckets are configured.** URL columns such as `pdf_url`
(and `avatar_url`, where present) are plain `TEXT` fields — ResumAI does not
upload files to object storage. PDF and Word exports are generated entirely in
the browser (`jspdf` / `docx`) and are never sent to the server.

## Per-user isolation (Row Level Security)

Row Level Security is enabled on **all** tables, and policies restrict rows to
their owner via `auth.uid()`. One authenticated user cannot read or modify
another user's CVs, job data, usage records, or billing rows. The Supabase
**anon** key shipped to the browser is public by design; access is enforced by
RLS, not by keeping that key secret. The **service-role** key (which bypasses
RLS) is server-side only and must never reach the browser — see
[configuration.md](./configuration.md) and [SECURITY.md](../SECURITY.md).

## What is sent to AI providers

The AI features run **only** in server-side Supabase Edge Functions
(`improve-cv-content`, `improve-bullet-point`, `analyze-job-compatibility`).
Provider API keys are edge-function secrets and **never** reach the browser.

What leaves your infrastructure depends on the configured provider
(`AI_PROVIDER`):

| Provider | What is sent |
| --- | --- |
| `mock` | **Nothing.** Responses are deterministic, offline, and require no network or key. Ideal for demos, tests, and privacy-sensitive use. |
| `openai`, `deepseek`, `openai-compatible` | The relevant CV text is sent to that provider for processing: the professional **summary** (`improve-cv-content`), individual **experience bullet points** (`improve-bullet-point`), and the **CV content plus the job description** when scoring compatibility (`analyze-job-compatibility`). |

When you use a real provider, that provider's own data-handling and retention
policies apply to the text you send. If you do not want any CV text to leave
your environment, run with `AI_PROVIDER=mock`. See
[ai-providers.md](./ai-providers.md) for provider configuration.

## Consent considerations

Because you operate the instance, you are the party who decides what is
collected and where it is sent. If you run ResumAI for anyone other than
yourself, consider:

- **Disclose the AI provider.** Users should know that, with a real provider,
  their CV text and job descriptions are transmitted to a third party for
  processing. The `mock` provider avoids this entirely.
- **Disclose analytics.** The usage and metrics tables record per-user activity;
  decide whether and how you inform users about this.
- **Lawful basis and notices** (privacy policy, consent, retention periods) are
  your responsibility as the operator, not something the software provides.

## Data deletion

Foreign keys are defined with `ON DELETE CASCADE` down the ownership chain:
`profiles.id` references `auth.users` with cascade, and the CV, job, usage, and
billing tables reference `profiles` (or `auth.users`) with cascade. As a
result, **deleting a user in Supabase Auth removes that user's profile and all
of their associated rows** (CVs, job descriptions, matches, application
tracking, usage records, and billing history) in a single cascade.

**There is no in-app "delete account" button yet.** Today, deletion is
performed by an operator using Supabase's Auth admin tools — for example, the
Dashboard under **Authentication → Users**, or the Admin API
(`auth.admin.deleteUser`) with the service-role key. Individual CVs and job
entries can also be removed by the owner through the app UI.

> **Roadmap:** self-serve account and data deletion from the UI is a planned
> feature (see the [Roadmap](../README.md#roadmap) and [ROADMAP.md](../ROADMAP.md)).
> Until it lands, treat account deletion as a manual, operator-run action.

## Self-hoster responsibilities

Running your own instance makes you the data controller/operator for the data it
holds. You are responsible for:

- **Choosing your AI provider** and understanding its data-handling terms — or
  using `mock` to keep all processing offline.
- **Protecting secrets.** Never prefix a server secret with `VITE_` (that inlines
  it into the public bundle). Keep provider keys, the service-role key, and any
  Flow credentials as edge-function secrets only.
- **Rotating exposed credentials.** A previously committed Chrome extension
  private key (`chrome-extension.pem`) was removed from the repository but
  remains in git history and must be treated as compromised — regenerate it
  before publishing an extension. See [SECURITY.md](../SECURITY.md).
- **Handling deletion and data requests** manually until self-serve deletion
  exists.
- **Your own legal and regulatory obligations** (privacy notices, consent,
  retention, data-subject requests). ResumAI provides the software; it does not
  make it compliant with any specific regulation.

## No compliance claim

ResumAI is provided under the [MIT License](../LICENSE) **as is**, without
warranty. It does **not** claim compliance with GDPR, CCPA, or any other data
protection framework. Assessing and meeting those obligations for your
deployment and jurisdiction is your responsibility.
