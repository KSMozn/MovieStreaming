# ReelSeek — streaming discovery

> Repo name `MovieStreaming` and the Cloud Run service name are retained
> internal legacy identifiers; the public brand is **ReelSeek**.

A small Next.js app that lets you search any movie and shows where to stream it
across **Netflix, OSN+, Amazon Prime Video, Shahid, and Watch It**, alongside
the IMDb rating, cast, genres, poster, and description.

Default country is **Egypt (EG)**; Saudi Arabia and UAE are also selectable.

## Tech

- Next.js 14 (App Router) + React 18 + TypeScript (strict)
- Tailwind CSS
- TMDb (search, metadata, cast, poster)
- Watchmode (streaming availability, optional start/end dates and provider category)
- OMDb (IMDb rating fallback)
- Jest + ts-jest for unit tests

> Database (PostgreSQL/Prisma) and Redis are intentionally **not** used in the MVP.
> The shape is ready to be extended with caching/favorites later.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Get API keys**

   - TMDb — https://www.themoviedb.org/settings/api (required)
   - Watchmode — https://api.watchmode.com/ (recommended for streaming data)
   - OMDb — https://www.omdbapi.com/apikey.aspx (recommended for IMDb rating)

3. **Configure environment**

   Copy the example file and fill in your keys:

   ```bash
   cp .env.example .env.local
   ```

   Variables:

   | Name                              | Required | Purpose                                   |
   | --------------------------------- | -------- | ----------------------------------------- |
   | `TMDB_API_KEY`                    | yes      | Movie search, metadata, cast              |
   | `WATCHMODE_API_KEY`               | no\*     | Streaming availability per region         |
   | `OMDB_API_KEY`                    | no\*     | IMDb rating                               |
   | `STREAMING_AVAILABILITY_API_KEY`  | no       | Reserved for an alternative provider      |
   | `DEFAULT_COUNTRY`                 | no       | Default region code (defaults to `EG`)    |
   | `DATABASE_URL`                    | no       | Reserved for future Postgres caching      |

   \* Without these the app still runs; the corresponding fields fall back to
   `null` / "Not available" in the UI.

4. **Run dev server**

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

5. **Run tests**

   ```bash
   npm test
   ```

## Project layout

```
src/
  app/
    page.tsx                                    # Home (search + recents)
    movie/[tmdbId]/page.tsx                     # Details page
    api/movies/search/route.ts                  # GET /api/movies/search?q=
    api/movies/[tmdbId]/route.ts                # GET /api/movies/:tmdbId
    api/movies/[tmdbId]/availability/route.ts   # GET …/availability?country=EG
  components/   # SearchBar, ProviderCard, Badges, CastList, Skeletons
  lib/          # tmdbClient, watchmodeClient, omdbClient, providers, http, useDebounced
  types/        # Normalized DTOs
  __tests__/    # Jest tests for normalization
public/providers/   # Provider logo SVGs (placeholder marks)
```

## API contracts

### `GET /api/movies/search?q={query}`

Returns up to 8 normalized search results.

### `GET /api/movies/:tmdbId`

Returns normalized `MovieDetailsDto` (see `src/types/index.ts`).

### `GET /api/movies/:tmdbId/availability?country=EG`

Always returns all 5 provider cards, even when not available. Optional fields
(`startsAt`, `endsAt`, `providerGenre`, `streamingUrl`, `availabilityType`)
fall back to `null` and the UI shows "Not available".

## Design notes

- **No scraping.** All streaming data comes from Watchmode's official API.
- **Strict TypeScript** with normalized DTOs — UI components never see raw
  upstream payloads.
- **Graceful degradation:** if Watchmode/OMDb keys are missing or fail, the
  app still renders TMDb metadata and shows "Not available" where appropriate.
- **Region filtering** via `?country=` (default `EG`); selector supports `EG`,
  `SA`, `AE`. Add more in `src/app/movie/[tmdbId]/page.tsx`.
- **Provider mapping** is centralized in `src/lib/providers.ts` — extending the
  list is one entry per provider.
- **Caching:** Next.js `fetch` revalidate is set conservatively (60s for search,
  30 min for availability, 1h for details). Plug Redis/Postgres in later by
  replacing `fetchJson`'s call sites.

## Extending

- **Add a provider:** append a `ProviderConfig` entry in `src/lib/providers.ts`,
  drop a logo into `public/providers/`. The UI updates automatically.
- **Add a country:** extend the `COUNTRIES` array in `src/app/movie/[tmdbId]/page.tsx`.
- **Persistent recents/favorites:** add Prisma + Postgres and a `favorites`
  table; replace the `localStorage` block in `src/app/page.tsx` and the
  recents-write block in the details page.

## Legal

This project uses TMDb, Watchmode, and OMDb under their respective terms of
service. Logos are placeholder marks; replace with the official press-kit
artwork before public deployment.
