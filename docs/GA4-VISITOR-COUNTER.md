# GA4 visitor counter setup

The footer and `/api/visitor-stats` are implemented. They deliberately show no counts until GA4 read access is configured. The existing GTM container and `G-37Q7F0TD0R` collect events; neither is a Data API credential or the numeric property ID.

## Owner setup

1. In Google Analytics, open Admin → Property details and find the numeric **Property ID**.
2. In a Google Cloud project, enable **Google Analytics Data API**. Create a dedicated service account. No project-wide Editor/Owner role or domain-wide delegation is needed for this use.
3. In GA4 → Admin → Property access management, add the service account email with **Viewer** access to this property.
4. Create a JSON key for that service account. Keep it private; do not commit it, put it in the client, or paste it in chat.
5. Cloudflare → Workers & Pages → pocket-utility → Settings → Variables and Secrets: add these **runtime** settings, not build variables:
   - `GA4_PROPERTY_ID`: numeric property ID, e.g. `123456789`. Using a Secret also avoids plain-variable drift with Wrangler deployments.
   - `GA4_SERVICE_ACCOUNT`: **Secret**, the complete JSON service-account key.
   - Optional `GA4_START_DATE`: first date of measurement, default `2026-11-16`.
   - Optional `GA4_SITE_HOST`: default `mypocketutility.com`; reports also include its www host.
6. Deploy the saved runtime settings. Verify `/api/visitor-stats` returns `status: "ok"` with counts. Configuration/error results may be cached by the browser for up to 10 minutes and upstream failures for 15 minutes.
7. Compare `totalUsers` with GA4 over the same date ranges, host filter and property timezone. A GA4 overview that uses active users is a different metric.

## Load and scope

- Browser fetch happens only when the footer approaches the viewport, once per application mount; responses can be reused locally for 5 minutes. No polling timer or per-second counter.
- Cloudflare Cache API stores a successful aggregate for 30 minutes per data center. Cache hits do not query Google. A miss makes one OAuth request and one batch request containing today's report and a report from the start date through today.
- Requests for the same key within a Worker isolate share an in-flight refresh. Query strings cannot select properties, ranges, metrics or force a cache refresh. Errors are cached for 15 minutes.
- Cache API entries are regional and may be evicted. This is not a globally scheduled two-requests-per-hour guarantee. Each stats HTTP request still invokes a Worker, even for a cache hit. Existing Workers quotas still apply; no paid plan is enabled by this change.
- Only aggregate counts, start date, property timezone, retrieval time and a limited-data flag are public. Tokens, credentials, user-level records, URL query parameters and GA4 property ID are not returned.
- “Total” is deduplicated `totalUsers` for the whole date range, not the sum of daily totals and not a real-time online count. The report can be delayed, thresholded or sampled. Counts before the configured start date are not included.

## Validation

Automated tests cover signed JWTs and read-only scope, report filters/date ranges, caching/concurrent requests, absent credentials, and safe error responses. Real GA4 read access cannot be verified until the owner supplies the runtime settings. The published GTM collection setup is unchanged.

References:
- https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart
- https://developers.google.com/identity/protocols/oauth2/service-account
- https://developers.cloudflare.com/workers/runtime-apis/cache/
