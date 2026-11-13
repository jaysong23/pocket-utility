# Cloudflare Pages deployment

Keep GitHub as the source repository. No server functions or database are required.

- Connect `jaysong23/pocket-utility`, branch `main` in Cloudflare Pages.
- Framework preset: None. Build command: `npm run build`. Output: `dist`.
- Node version: 22.22.2 or a later supported Node 22/24 release (jsdom requires 24.15.0+ on Node 24).
- Set `SITE_URL` to the final public URL, including https and a trailing slash. For example, your actual Pages URL or purchased domain. Do not leave an example domain in production.
- Without SITE_URL, Cloudflare builds use CF_PAGES_URL. Existing GitHub Actions builds use https://jaysong23.github.io/pocket-utility/.
- Before connecting a custom domain, update SITE_URL and rebuild so canonical URLs, assets, sitemap and robots match.
- Direct routes are real folders, not SPA fallback rewrites. Do not add a catch-all 200 redirect. Unknown URLs should return 404.
- Legacy `#/tool?q=...` bookmarks are migrated by the client; new links use `/tool/?q=...`.
- Submit the final sitemap URL to Search Console after domain verification. On GitHub project hosting, robots.txt is served under the project path; domain-root hosting resolves this.

## AdSense preparation still requiring owner details

No ad code is installed. Add the actual publisher ID and corresponding ads.txt only after account setup. Before applying, publish an accurate privacy policy reflecting host logs, external font/CDN/API requests, local browser preferences, advertising and consent requirements; add operator/contact information. Do not invent legal identity or contact details. Review advertising placement so it cannot be confused with conversion/download controls. Approval and revenue are not guaranteed by technical SEO changes.
