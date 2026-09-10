# ANM’s — Advancing New Milestones

**Business Systems Engineering.** Your problem. Engineered into a solution.

A Next.js full-stack application with a living Canvas hero, discovery experience, server-only intelligence adapters, Supabase persistence and protected engineering pipeline. The original repository contained only a README; application work is isolated on `feat/anms-platform`.

## Run

Requires Node.js 22+ and npm.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

The public website builds without secrets. Discovery and team access display unavailable states until configured; they never simulate a real submission. No payment gateway or external notification sending is included.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

## Activate Supabase

1. Create/select the ANM’s Supabase project. Apply `supabase/migrations/20260908151759_anms_platform.sql` to that project only, using the Supabase migration workflow or SQL editor.
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable key or legacy anon key), and server-only `SUPABASE_SERVICE_ROLE_KEY` in Vercel environment settings.
3. Generate a random `AUTH_SECRET` of at least 32 characters and save it as an encrypted server environment variable. Never paste it into tracked source.
4. Create an actual team user through Supabase Auth. Disable public signups if they are not needed. Insert the verified user's UUID and display name into `admin_users` using an authorized database session. Only active membership grants access; arbitrary authenticated users have no internal access.
5. Set the Supabase Site URL and permitted redirect URLs for the actual domain. Password sign-in is server-side; no client database access is used.
6. Run Supabase security advisors, verify anonymous and ordinary authenticated reads fail, then test with a real authorized user. Existing test results do not claim this remote-project verification.

All application tables enable RLS and explicitly revoke public/anon/authenticated access. The server validates the discovery cookie or admin identity before service-role use. RPCs are SECURITY INVOKER and execute privileges are limited to service_role. Do not grant public access to them.

## Activate discovery

Set `AI_PROVIDER=openai-compatible`, `AI_BASE_URL`, `AI_API_KEY`, and `AI_MODEL`. The selected API/model must support Chat Completions with `response_format: {type: "json_object"}` and `max_completion_tokens`. JSON output is additionally validated with strict Zod schemas. Provider changes using this protocol require configuration only; other protocols can implement `IntelligenceProvider` without frontend changes.

The model provider's storage/retention settings must be chosen for ANM’s actual data-handling policy. Contact fields are collected separately and are not sent to the model. The transcript itself may contain visitor-provided personal information.

Customer-facing prompts and internal report prompts are separate server-only modules. The public API returns only the public transcript/summary/receipt. Model failure preserves the saved user message; retries reuse its client ID. A 90-second database lease prevents concurrent turns, while a transaction saves reports, submission, reference and notifications together. No receipt is displayed before commit. Idempotent retries return the same reference.

Limits: 4,000 characters per message, 24 turns per session, 7-day session cookie, 45-second model timeout, 60-second API function duration. Sessions and submission limits use database-backed counters. Configure deployment-level bot/rate controls if traffic warrants them. IP headers assume a trusted Vercel ingress; self-hosting requires a trusted reverse proxy that overwrites forwarded headers.

## Contact and site settings

- `NEXT_PUBLIC_SITE_URL`: exact HTTPS origin used for canonical URLs, sitemap and write-request origin checks. Configure separately for preview and production; production writes intentionally fail closed when absent.
- `NEXT_PUBLIC_WHATSAPP_NUMBER`: ANM’s business number in international digits (e.g. country code plus number, no `+`). No default personal number is assumed.
- General contact opens WhatsApp. Consultation first records interest, then opens a reference-specific message. Fees, bank transfer, payment confirmation and scheduling remain manual.

No secrets belong in `NEXT_PUBLIC_*` variables. The Supabase URL/publishable key, website URL and public WhatsApp number are non-secret. The service role key and model key remain server-only.

## Vercel deployment

Import `wassaw252-dotcom/anms-website`, choose the application branch, select Next.js and Node.js 22+; root directory is the repository root. Build: `npm run build`; install: `npm ci`; output: Next.js default. Add the environment values above for the target environment. Keep the production deployment gated until actual model/database/Auth/WhatsApp flows are verified. A successful compile is not a claim that integrations are live.

The dev launcher translates supervised preview flags to Next.js flags; this does not replace Next.js with another framework. Production uses `next build` / `next start`.

## Operator workflow

Open `/dashboard`, sign in, review NEW requests, inspect transcript/opportunity/brief, assign an active team member, add notes and advance the pipeline. High-value flags are preliminary and never public. Internal dashboard notifications cover new requests, high-value opportunities and consultation interest. Email and WhatsApp Business API notifications are not activated.

`WON` is the V1 active-project proxy, displayed explicitly in the dashboard; project delivery lifecycle is future work. Latest 100 matching requests are listed. Records are not automatically deleted when the session cookie expires. Operators must establish an appropriate retention schedule and handle verified correction/deletion requests. Review privacy copy against the actual processing configuration before launch.

## Tests and limitations

`npm test` runs schema validation and a real embedded PostgreSQL engine (PGlite) test of the migration, role isolation, consent enforcement, turn retries, finalization, reference uniqueness, notifications, rate limits and admin status history. It does not replace verification of a configured Supabase project, live Auth, model behavior or deployed Vercel ingress.

See `docs/ARCHITECTURE.md` and `docs/QA.md` for scope and verification status.
