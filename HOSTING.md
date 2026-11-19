# Production hosting

Production is Cloudflare Workers + Static Assets, not Cloudflare Pages.
The canonical URL is https://mypocketutility.com/ and the source is `jaysong23/pocket-utility`, branch `main`.

## Build settings

- Build: `npm run build`
- Deploy: `npx wrangler deploy`
- Root: repository root
- Build environment: `SITE_URL=https://mypocketutility.com/`
- Node: supported Node 22 (22.22.2+) or Node 24 (24.15.0+)
- Asset directory: `dist`, via checked-in `wrangler.jsonc`. Never override with `--assets .`.

GitHub Pages is an independent static preview deployed by `.github/workflows/`. It cannot serve the Worker APIs.

Run `npm ci`, `npm test`, and a production build before pushing. Verify the live `/version.json` commit after deployment.
Do not add a catch-all 200 redirect: pages have real directories and unknown paths must return 404.

## Bindings

`ASSETS` serves static files; only `/api/*` runs the Worker first.
`URL_RATE_LIMITER` limits outbound API work and counter writes.
`VISITOR_COUNTER` is a SQLite Durable Object with migration `visitor-counter-v1`. Preserve its name, ID and migration history when deploying; it contains persistent visitor counts. No GA4 credentials are required.

No paid plan is enabled by the code. Requests and storage consume applicable account quotas; rate limiting is not a global billing cap.

## Checks

Check `/`, `/en/`, `/ja/`, a nested tool URL, `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `/favicon.ico` and `/api/visitor-stats`.
AVIF assets: `/codecs/avif-worker.js`, `/codecs/avif_enc.wasm`, `/codecs/avif_dec.wasm`.
The image codec runs in the user's browser, not the server Worker.

AdSense verification meta tag is installed; advertising script/placements and account approval are separate.
For complete operations, limitations and current owner-facing status, read [HANDOVER.md](docs/HANDOVER.md).
