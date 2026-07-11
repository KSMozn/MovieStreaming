# Reelseek — Android

Native Android client (Kotlin + Jetpack Compose) for the Reelseek streaming-availability
service. Mirrors the website and the iOS app in `../ios`, consuming the same keyless JSON
API on Cloud Run — no API keys ship in the app.

## Build

Requires JDK 17 and the Android SDK (`local.properties` → `sdk.dir`).

```bash
# Debug APK
JAVA_HOME=$(/usr/libexec/java_home -v 17 2>/dev/null || echo ~/homebrew/opt/openjdk@17) \
  ./gradlew :app:assembleDebug

# Unit tests (DTO parsing against live-API fixtures + query mapping)
./gradlew :app:testDebugUnitTest

# Signed release bundle (needs keystore.properties, see below)
./gradlew :app:bundleRelease
```

Point the app at a different backend with `-PapiBaseUrl=…` (defaults to the production
Cloud Run URL, same as `ios/project.yml`).

## Project layout

- `app/src/main/kotlin/com/khaledsamir/reelseek/`
  - `model/` — DTOs mirroring `src/types/index.ts`
  - `network/` — Retrofit interface for the 7 `/api/*` endpoints
  - `data/` — Room (watchlist + recents, capped at 20) and DataStore (country pref)
  - `viewmodel/`, `ui/` — Compose screens: Home, Search + Filters, Detail, Person,
    Watchlist, About
- `app/src/test/` — unit tests; fixtures captured from the live API

## Release signing

`app/build.gradle.kts` reads `android/keystore.properties` (gitignored):

```
storeFile=upload-keystore.jks
storePassword=…
keyAlias=upload
keyPassword=…
```

The upload keystore was generated with `keytool -genkeypair -keystore upload-keystore.jks
-alias upload -keyalg RSA -keysize 2048 -validity 10000`. **Back up
`upload-keystore.jks` + `keystore.properties` outside the repo** (e.g. alongside
`~/Documents/wadihome-keystore-backup`). With Play App Signing, Google can reset a lost
upload key, but the backup saves the support round-trip.

## Play Store submission checklist

One-time setup:
- [ ] Create a Google Play Console developer account ($25 one-time).
      **Note:** personal accounts created after Nov 2023 must run a closed test with
      12 testers for 14 days before production access — start this early.
- [ ] Enroll the app in Play App Signing (default on first AAB upload).
- [ ] TMDb commercial-use approval email (same requirement as the iOS app).

Per release:
- [ ] Bump `versionCode` / `versionName` in `app/build.gradle.kts`.
- [ ] `./gradlew bundleRelease` → upload `app/build/outputs/bundle/release/app-release.aab`
      (or tag `android-v*` and let CI build the artifact).

Store listing:
- [ ] App icon 512×512 PNG (export from `ic_launcher` layers).
- [ ] Feature graphic 1024×500.
- [ ] ≥2 phone screenshots (emulator: `adb exec-out screencap -p > shot.png`).
- [ ] Short + full description.
- [ ] Privacy policy URL: `https://ksmozn.github.io/MovieStreaming/privacy` (already live).
- [ ] Data safety form: **no data collected or shared** — no accounts, no analytics,
      no third-party SDKs; watchlist/recents are on-device (Room).
- [ ] Content rating questionnaire.
- [ ] Target API: 36 (Play requires 35+ now, 36 by Aug 31, 2026) ✓.

## CI

`.github/workflows/android.yml` — lint + unit tests + debug APK on every PR/push touching
`android/`; tag `android-v*` builds a signed AAB from repo secrets (`KEYSTORE_B64`,
`KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`). Play upload stays manual.
