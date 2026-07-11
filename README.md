# ReelSeek

**Find what to watch. Know where to stream it.**

ReelSeek is a movie and TV **streaming-discovery service** for Egypt, Saudi
Arabia and the UAE. It searches any title, shows ratings, cast and details,
and answers the real question — *which streaming service carries this in my
country?* — across **Netflix, OSN+, Amazon Prime Video, Shahid, Watch It,
TOD, Disney+ and Apple TV+**, labelled as subscription, rent or buy.

ReelSeek does **not** host or stream video, requires no account, and is not
affiliated with any provider.

> **Internal legacy identifiers:** the repository name `MovieStreaming`, the
> Cloud Run service name `movie-streaming`, the iOS target/folder `Reelseek`
> and the bundle/application id `com.khaledsamir.reelseek` predate the
> ReelSeek branding and are intentionally retained. The public brand is
> always **ReelSeek**.

## What's in this repo

| Path | What it is |
|---|---|
| `src/` | Next.js 14 (App Router) web app: public site, SEO layer, and the JSON API |
| `ios/` | Native iOS app (SwiftUI, iOS 17+, XcodeGen — `ios/project.yml` is the source of truth) |
| `android/` | Native Android app (Kotlin + Jetpack Compose, Gradle version catalog) |
| `public/brand/` | Official ReelSeek logo/icon assets |
| `docs/` | GitHub Pages (legacy privacy URL) + engineering docs (SEO setup, AI crawler policy, authority plan, public facts) |
| `.github/workflows/` | CI: web (test+build), Android (lint+test+APK, tagged signed AAB), iOS (simulator build) |

Both mobile apps consume the same keyless JSON API under `/api/*`; no
third-party API keys ship in any client.

## Architecture

- **Web + API**: Next.js 14, React 18, TypeScript (strict), Tailwind. Server
  components render all public pages (home, movie/TV/person, marketing,
  Arabic `/ar` pages); small client islands handle interactivity
  (availability country switching, local recents/watchlist).
- **Data**: TMDb (metadata, cast, provider mappings), Watchmode
  (supplemental availability), OMDb (IMDb ratings) — normalized server-side
  into the DTOs in `src/types/index.ts`. No database by design; short-lived
  in-process caching only.
- **SEO layer**: canonical config in `src/lib/site.ts`; metadata builders in
  `src/lib/seo/`; JSON-LD schema builders + safe serialization; `robots.ts`,
  `sitemap.ts`, `llms.txt`, `llms-full.txt`, Atom feed, IndexNow utility
  (`npm run indexnow`); public facts single-source in
  `src/content/publicFacts.ts`.
- **Brand**: tokens in `src/app/globals.css` (+ `src/lib/brand.ts`), shared
  by the web app and mirrored in the mobile themes.

## Setup (web)

```bash
npm install
cp .env.example .env.local   # add TMDB_API_KEY (required), WATCHMODE/OMDB (recommended)
npm run dev
```

Checks: `npm test` · `npm run lint` · `npm run typecheck` · `npm run build`

Key environment variables (see `.env.example` for all): `TMDB_API_KEY`
(required), `WATCHMODE_API_KEY`, `OMDB_API_KEY`, `DEFAULT_COUNTRY`,
`NEXT_PUBLIC_SITE_URL` (canonical origin, defaults to
`https://reelseek.co`), `SEO_INDEXING_ENABLED` (set `false` only on
previews), `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION`,
`INDEXNOW_KEY`.

## Mobile apps

- **Android** (`android/README.md`): `./gradlew :app:assembleDebug` with JDK
  17; release signing via gitignored `keystore.properties`; Play submission
  checklist included.
- **iOS** (`ios/README.md`): `xcodegen generate` then build `Reelseek.xcodeproj`;
  App Store submission checklist included.

Both apps are feature-complete and in pre-release; store listings are
pending (do not advertise store links until they exist).

## Deployment

Docker multi-stage build (Next standalone output) → Google Cloud Run
(`europe-west1`): `gcloud run deploy movie-streaming --source . --region
europe-west1`. Production domain: `https://reelseek.co` (see
`docs/SEARCH_ENGINE_SETUP.md` for domain, Search Console, Bing and IndexNow
setup). Preview deployments must set `SEO_INDEXING_ENABLED=false`.

## Legal positioning

ReelSeek links to third-party streaming services and displays availability
compiled from licensed data sources; availability varies by country and can
change. This product uses the TMDb API but is not endorsed or certified by
TMDb. Privacy policy and terms live at `/privacy` and `/terms` on the
production site.
