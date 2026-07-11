# Search Engine Setup — Google Search Console, Bing Webmaster Tools, IndexNow

One-time, human-performed steps after `https://reelseek.co` goes live.
Application-side prerequisites (robots, sitemap, canonicals, verification
meta-tag support) are already implemented.

## Prerequisites

1. Map `reelseek.co` to the Cloud Run service (Cloud Run → Custom domains,
   or a load balancer) and confirm HTTPS.
2. Set env vars on the production service:
   - `NEXT_PUBLIC_SITE_URL=https://reelseek.co`
   - `SEO_INDEXING_ENABLED=true` (or unset — enabled is the default)
3. For any preview/staging deployment set `SEO_INDEXING_ENABLED=false`.

## Google Search Console

1. Create a **Domain property** for `reelseek.co` (DNS TXT verification —
   preferred), or a URL-prefix property using the HTML meta tag: set
   `GOOGLE_SITE_VERIFICATION=<token>` on the service and redeploy; the tag
   renders in `<head>` automatically.
2. Submit the sitemap: `https://reelseek.co/sitemap.xml`.
3. URL-inspect (Request indexing where appropriate):
   homepage, `/countries/egypt`, `/providers/shahid`, one `/movie/…`, one
   `/tv/…`, one `/person/…`, one `/guides/…`.
4. Rich results: test the homepage, a movie page, a person page, and `/faq`
   with https://search.google.com/test/rich-results.

## Bing Webmaster Tools

1. Add the site (imports from Search Console are supported) or verify via
   `BING_SITE_VERIFICATION=<token>` (renders `msvalidate.01`).
2. Submit `https://reelseek.co/sitemap.xml`.
3. Confirm IndexNow shows as active once keys are configured (below).

## IndexNow

1. Generate a key (any 8–128 char hex/UUID string), set `INDEXNOW_KEY` on
   the production service. The key is then served at
   `https://reelseek.co/indexnow-key.txt` (`INDEXNOW_KEY_LOCATION` can
   override the advertised location).
2. Manual submission: `npm run indexnow -- <url> [...urls]` or
   `npm run indexnow -- --sitemap`.
3. Submit only changed URLs; receipt does not guarantee crawling.

## Post-deployment verification checklist

1. `https://reelseek.co` → 200, canonical `https://reelseek.co`, title
   contains "ReelSeek".
2. Cloud Run URL and any `www` variant redirect (or at minimum canonicalize)
   to `https://reelseek.co`.
3. `/robots.txt` → 200, references the sitemap, allows public content.
4. `/sitemap.xml` → 200, all URLs on `https://reelseek.co`.
5. Inspect one **country** page (`/countries/egypt`).
6. Inspect one **provider** page (`/providers/shahid`).
7. Inspect one **movie** page (`/movie/27205`) — unique title/description.
8. Inspect one **TV** page (`/tv/1399`).
9. Inspect one **person** page (`/person/6193`).
10. Validate structured data (Organization, WebSite, SoftwareApplication,
    Movie, TVSeries, Person, FAQPage, BreadcrumbList, Article).
11. Confirm `/search` and `/search?q=anything` return
    `<meta name="robots" content="noindex, follow">` with canonical
    `/search`.
12. Confirm preview/staging deployments serve global noindex + empty
    sitemap.
13. `/llms.txt`, `/llms-full.txt`, `/feed.xml` → 200 with correct content
    types.

## Crawler access verification

robots permission is insufficient if infrastructure blocks the agents.
Public pages require no authentication (verify none is ever added in front
of Cloud Run). Spot-check with spoofed user agents (a 200 here proves the
app serves them; infrastructure-level blocks would surface as 403/503):

```bash
for UA in "Googlebot/2.1" "bingbot/2.0" "OAI-SearchBot/1.0" "Claude-SearchBot/1.0"; do
  curl -s -o /dev/null -w "%{http_code}  $UA\n" -A "$UA" https://reelseek.co/
done
curl -s -o /dev/null -w "%{http_code}  robots\n" https://reelseek.co/robots.txt
curl -s -o /dev/null -w "%{http_code}  sitemap\n" https://reelseek.co/sitemap.xml
curl -s -o /dev/null -w "%{http_code}  logo asset\n" https://reelseek.co/brand/icons/icon-512.png
```

For authoritative verification, use Search Console's URL Inspection (live
test) and Bing's URL inspection, which fetch from real crawler
infrastructure.

## Enabling geo auto-detect (Cloudflare)

The detail pages default the country selector to the visitor's country
(via Cloudflare's `CF-IPCountry` header) when it's a supported market,
falling back to Egypt. This stays dormant until the DNS records are
proxied — the header is simply absent otherwise, so everyone defaults to
EG with no code change. To turn it on:

1. **Cloudflare → reelseek.co → SSL/TLS → Overview:** set encryption mode
   to **Full (strict)**. (Google's managed cert on the Cloud Run origin is
   publicly trusted, so strict works. Do NOT use "Flexible" — it causes an
   HTTP→HTTPS redirect loop against Cloud Run.)
2. **Cloudflare → DNS:** switch the eight apex `A`/`AAAA` records from
   "DNS only" (grey cloud) to **Proxied** (orange cloud). Keep the
   `google-site-verification` TXT record.
3. Wait a few minutes, then confirm the header arrives and geo works:
   ```bash
   curl -s -H "CF-IPCountry: US" https://reelseek.co/movie/27205 \
     | grep -o '<option value="US" selected'
   # → should print: <option value="US" selected
   ```
   (Cloudflare sets `CF-IPCountry` from the real client IP in production;
   the manual header above just proves the app honours it.)

Notes:
- Cloudflare does not cache HTML by default, so per-country initial HTML
  is not wrongly shared between visitors. Do not add a Cache Rule that
  caches HTML on the detail routes.
- Canonical URLs stay country-agnostic (`/movie/<id>`), so geo defaulting
  does not create duplicate indexable URLs.
- To revert, flip the records back to "DNS only"; the app falls back to
  EG automatically.
