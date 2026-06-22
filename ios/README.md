# MovieStreaming iOS

Native SwiftUI iOS client for the MovieStreaming web app. Talks to the existing Cloud Run API (`https://movie-streaming-150176375922.europe-west1.run.app`) so all TMDb logic, sort rules, provider mappings, and IMDb enrichment stay in one place.

## Requirements

- Xcode 15.3+
- iOS 17.0+ deployment target (uses SwiftData + `@Observable`)
- [XcodeGen](https://github.com/yonaskolb/XcodeGen) — to regenerate the `.xcodeproj` from `project.yml`

```sh
brew install xcodegen
```

## First-time setup

From the repo root:

```sh
cd ios
xcodegen generate
open MovieStreaming.xcodeproj
```

Then in Xcode: pick a Simulator (or your device), select the *MovieStreaming* scheme, ⌘R.

The Cloud Run base URL is baked into `Info.plist` (`APIBaseURL`). To point at a local Next.js dev server, edit that key in `MovieStreaming/Info.plist` before building — e.g. `http://localhost:3000` — and also flip `NSAllowsArbitraryLoads` to `true` for that build only.

## Project layout

```
ios/
├── project.yml                       # XcodeGen spec — single source of truth
└── MovieStreaming/
    ├── Info.plist                    # APIBaseURL, dark UI, portrait-only iPhone
    ├── App/                          # @main entry point + Theme
    ├── Models/                       # Codable mirrors of API DTOs
    ├── Networking/                   # APIClient (URLSession) + MovieAPI facade
    ├── ViewModels/                   # @Observable @MainActor view models
    ├── Persistence/                  # SwiftData @Model (WatchlistItem)
    ├── Views/                        # SwiftUI screens + reusable components
    └── Resources/Assets.xcassets/    # AppIcon, AccentColor, LaunchBackground
```

## Feature parity with the web app

| Web | iOS |
|---|---|
| Trending / home grid | `HomeView` |
| Advanced search form + sort-by | `SearchView` + `FiltersSheet` |
| Movie/TV detail page (cast, ratings, providers) | `DetailView` |
| Where-to-watch availability | provider cards on `DetailView` |
| Person search (autocomplete) | inline in `FiltersSheet` |
| — | Watchlist (SwiftData, iOS-only) |

The iOS app **does not** ship a TMDb or OMDb key. All title/genre/availability calls hit `/api/...` on Cloud Run.

## Regenerating the project after editing `project.yml`

```sh
cd ios
xcodegen generate
```

The `.xcodeproj` is gitignored (or should be) because it is regenerated. Source of truth: `project.yml` + the Swift files.

## Notes on sort-by

The iOS app respects the same `SortKey` set as the web form (`popularity.desc`, `rating.desc/asc`, `release.desc/asc`, `votes.desc`). When sorting by rating, the API automatically applies a `vote_count.gte=200` floor — no client-side workaround needed.
