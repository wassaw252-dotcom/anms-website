# Verification record

## Confirmed locally

- Dependency installation and production Next.js compilation succeed.
- TypeScript and lint checks are run before handoff.
- Embedded PostgreSQL migration test passes: public/authenticated access denial across all confidential tables, function access denial, persistent turns, retry deduplication, lease contention, consent rejection, atomic handoff with reports, unique reference on repeat submission, consultation notification deduplication, rate limiting, authorized status update/history.
- Strict contact/model-output validation rejects unknown public-output keys, oversized messages, malformed emails and missing consent; individual submissions need no company.
- No secret values were provided or committed. Server-only imports guard database, auth and model modules.

## Browser verification limitation

The supervised browser reached the Next.js public page and exposed all public content. Development-mode React initialization did not complete in this browser, leaving the Canvas and client controls uninitialized. The initial development CSP eval warning was addressed with development-only allowance; production does not allow eval. The remaining preview initialization issue is unresolved. Do not claim animation, mobile visual QA or browser end-to-end verification passed. Hero content and the primary link have progressive enhancement fallbacks.

## Activation-dependent verification

No Supabase projects or Vercel teams were returned by the connected services during initial inspection. No model credentials, business WhatsApp number or site URL were supplied. These checks remain mandatory after activation:

1. Provision migration in the selected Supabase project; run advisors and verify live RLS.
2. Exercise individual, business and enterprise conversations against the configured model.
3. Refresh/retry after model timeout and database failure; confirm persisted progress and no duplicate reference.
4. Verify complete real submission writes, private report visibility and dashboard sign-in/authorization.
5. Verify manual consultation WhatsApp destination and reference, without sending a message automatically.
6. Verify mobile/desktop/reduced-motion and keyboard behavior on an initialized browser.
7. Deploy preview; test production CSP, cookies, origin validation, API failures and caching on Vercel before production promotion.

These activation gates are not represented as successful tests.
