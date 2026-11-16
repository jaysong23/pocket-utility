# First-party visitor counter

No GA4 credentials or external analytics API. The existing Cloudflare host runs our code; a SQLite Durable Object persists counts. Wrangler creates the binding/class through the `visitor-counter-v1` migration on deployment. No paid-plan switch is made.

- Browser creates a random UUID for each Korea-time day in `mpu-visit-day`. It POSTs once after page load, then records success. Refreshes and route changes do not increment again. Concurrent/retried POSTs with the same ID are also deduplicated transactionally by the server.
- The API hashes day + UUID before sending to storage. IPs/fingerprints are not stored in the counter database. Hosting/security infrastructure may still process request metadata.
- One durable instance uses a primary key for daily hashes and atomic count updates. An alarm deletes hashes at midnight KST; the next request also performs rollover as a fallback. Aggregates persist across deployments.
- Total is the sum of daily unique-browser visits, NOT lifetime unique people. Different browsers/devices or deleted site data can count again. This is an approximate informational counter, not a fraud-resistant billing metric. Forged IDs or automated browser traffic cannot be eliminated completely; same-origin checks and the existing rate limiter reduce abuse.
- Storage-disabled browsers only read counts. The existing GA4 collector is independent.
- Repeated aggregate reads use a 60-second regional cache. POST responses are never cached. Footer requests still invoke Workers; new visits also use Durable Object requests and storage. Free-tier quotas apply, so usage is not unlimited or guaranteed cost-free on paid accounts.
- Counts start with this feature, not historical analytics. No seed/fake values.

AdSense verification: the account meta tag is in `index.html` and inherited by localized pages. No ad script, placement, or approval is implied by adding that tag.
