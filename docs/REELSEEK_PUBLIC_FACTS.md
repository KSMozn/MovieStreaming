# ReelSeek Public Facts

Human-readable mirror of `src/content/publicFacts.ts` — update both
together. This file is the review checklist; the TypeScript module is what
generates the About page, Press boilerplate, FAQ answers, JSON-LD,
llms.txt, llms-full.txt, and `/api/public/reelseek.json`.

Last factual review: **2026-07-11**

| Fact | Value |
|---|---|
| Product name | ReelSeek |
| Canonical domain | https://reelseek.co |
| Category | Movie and TV streaming-discovery service |
| Slogan | Find what to watch. Know where to stream it. |
| Hosts/streams video | **No** — links out to third-party providers |
| Content types | Movies, TV shows |
| Supported countries | Egypt, Saudi Arabia, United Arab Emirates |
| Providers checked | Netflix, OSN+, Amazon Prime Video, Shahid, Watch It, TOD, Disney+, Apple TV+ (derived from `src/lib/providers.ts`) |
| Data sources | TMDb (metadata, ratings, cast, provider mappings), Watchmode (supplemental availability), OMDb (IMDb ratings) |
| Account required | No |
| Ads / analytics SDKs | None |
| Platforms | Web (live); iOS and Android apps in pre-release (no store listings yet) |
| Affiliations | None with any streaming provider |
| Required notice | This product uses the TMDb API but is not endorsed or certified by TMDb. |
| Public contact | GitHub issues (dedicated support email pending) |

## Review procedure

When anything above changes (new country, new provider, store launch,
support email): update `src/content/publicFacts.ts`, bump `lastReviewed`,
update this table, and re-run `npm test` (the facts-consistency tests keep
generated surfaces in sync).
