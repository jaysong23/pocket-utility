# Cloudflare Pages deployment

Keep GitHub as the source repository. No server functions or database are required.

- Connect `jaysong23/pocket-utility`, branch `main` in Cloudflare Pages.
- Framework preset: None. Build command: `npm run build`. Output: `dist`.
- Node version: 22.22.2 or a later supported Node 22/24 release (jsdom requires 24.15.0+ on Node 24).
- Set `SITE_URL` to the final public URL, including https and a trailing slash. For example, your actual Pages URL or purchased domain. Do not leave an example domain in production.
- Without SITE_URL, Cloudflare builds use CF_PAGES_URL. Existing GitHub Actions builds use https://jaysong23.github.io/pocket-utility/.
- Before connecting a custom domain, update SITE_URL and rebuild so canonical URLs, assets, sitemap and robots match.
- Direct routes are real folders, not SPA fallback rewrites. The generated `_redirects` only redirects the old Markdown route. Do not add a catch-all 200 redirect. Unknown URLs should return 404.
- Legacy `#/tool?q=...` bookmarks are migrated by the client; new links use `/tool/?q=...`, `/en/tool/` or `/ja/tool/`.
- Submit the final sitemap URL to Search Console after domain verification. On GitHub project hosting, robots.txt is served under the project path; domain-root hosting resolves this.

## AdSense preparation still requiring owner details

No ad code is installed. Add the actual publisher ID and corresponding ads.txt only after account setup. Before applying, publish an accurate privacy policy reflecting host logs, external font/CDN/API requests, local browser preferences, advertising and consent requirements; add operator/contact information. Do not invent legal identity or contact details. Review advertising placement so it cannot be confused with conversion/download controls. Approval and revenue are not guaranteed by technical SEO changes.

## Existing Cloudflare Workers static-assets project

The production project was created as a static-assets Worker (not Pages).
Use the checked-in `wrangler.jsonc` to publish only the generated `dist` directory.
Uploading the repository root serves the source index.html without entry.js/entry.css.

In Settings > Build, connect jaysong23/pocket-utility, branch main:
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Root directory: repository root (leave empty)
- Production build variable SITE_URL: `https://mypocketutility.com/`
- Build variable NODE_VERSION: `22.22.2`

Remove any `--assets .` or `--assets ./public` override from the deploy command.
Runtime variables are not needed. Add the custom domain through the Worker Domains UI.
After deploying, verify /entry.js, /entry.css, /sitemap.xml and localized tool pages.


## URL resolver Worker

`wrangler.jsonc` now includes `main: worker/index.mjs`, the `ASSETS` binding, and API-only Worker-first routing. Keep build command `npm run build` and deploy command `npx wrangler deploy`. Do not use an assets-only deploy override. Static pages continue to be served directly. `/api/expand-url`, `/api/inspect-url`, and `/api/naver-time` handle POST JSON requests. They share the rate limiter. HTML inspection is capped at 2MB; Naver time reads only the fixed Search Ads root HTTP Date.

The configured `URL_RATE_LIMITER` binding is deployed with Wrangler (4.36+). This change does not subscribe to Workers Paid or enable a paid third-party URL API. Confirm the account remains on Workers Free in the dashboard if zero overage billing is required; the daily free quota is shared across the account. Rate limiting reduces repeated outbound work but rejected requests still count as Worker invocations. No strict global daily budget is implemented.

Manual smoke test: POST `{"url":"https://bit.ly/3sKSL66"}` to `/api/expand-url` with `Content-Type: application/json` and `Origin: https://mypocketutility.com`. The returned destination should be on `www.hyundaicard.com` (the link owner may change it). Client-side time sync and OG URL fetching remain browser-only; this endpoint does not proxy HTML, images or files.
