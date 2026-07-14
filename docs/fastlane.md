# Fastlane — build & release automation

Lanes live per-platform in [`android/fastlane`](../android/fastlane) and
[`ios/fastlane`](../ios/fastlane). Each has a `beta` lane (test track) and a
`release` lane (store). All secrets are read from a git-ignored
`fastlane/.env`; copy the `.env.example` next to it and fill it in.

These are additive to the existing CI: [`android.yml`](../.github/workflows/android.yml)
and [`ios.yml`](../.github/workflows/ios.yml) still build both apps on every PR.
Fastlane is only for the store uploads.

## Lanes

| Platform | Command (run from the platform dir) | What it does |
|----------|-------------------------------------|--------------|
| Android  | `fastlane beta`    | Build signed AAB → Play **internal** track |
| Android  | `fastlane release` | Build signed AAB → Play **production** as a *draft* |
| iOS      | `fastlane beta`    | Archive → **TestFlight** |
| iOS      | `fastlane release` | Archive → **App Store** (upload only, no auto-submit) |
| both     | `fastlane build`   | Produce the signed artifact without uploading |

Run them from the platform directory, e.g. `cd android && fastlane beta` or
`cd ios && fastlane beta`.

## Running it

macOS's built-in Ruby is SIP-locked and too old for fastlane. Install a modern
Ruby (rbenv with 3.3.x is what wadihome uses) and then `gem install fastlane`,
or run `bundle exec fastlane` against the root `Gemfile`. The root `Gemfile`
pins fastlane for **CI** reproducibility; in CI pin bundler 2.x
(`gem install bundler -v '~> 2.5'`) or just `gem install fastlane` directly
(bundler 4.x hung on resolution in testing).

## One-time setup

### iOS — `ios/fastlane/.env`
- **App Store Connect API key** (App Store Connect → Users and Access →
  Integrations → App Store Connect API): download the `.p8`, then set
  `ASC_KEY_ID`, `ASC_ISSUER_ID`, and `ASC_KEY_PATH` (point it at the `.p8`).
- **`APPLE_TEAM_ID`** — optional; `ios/project.yml` already bakes in the team
  (`52GK9NV362`). Set it only to override. The lane passes
  `-allowProvisioningUpdates` so Xcode fetches or creates the provisioning
  profile through the API key.
- The app record (`com.khaledsamir.reelseek`) must already exist in App Store
  Connect.
- Requires `xcodegen` and Xcode CLT on `PATH`. The `.xcodeproj` is XcodeGen-
  generated and git-ignored, so each lane regenerates it before archiving.

### Android — `android/fastlane/.env`
- **Play service-account JSON** (Play Console → Setup → API access): create or
  link a service account, grant it release permissions, download the JSON key,
  and set `PLAY_JSON_KEY_PATH`.
- The **upload keystore** is already wired into `app/build.gradle.kts` via
  `android/keystore.properties` (git-ignored) — nothing to add for fastlane.
- The app must have had **at least one manual AAB upload** in the Play Console
  before the API will accept uploads.
- `JAVA_HOME` is auto-detected (Homebrew `openjdk@17`, else Android Studio's
  bundled JBR); override with `ANDROID_JAVA_HOME` if you keep a JDK 17
  elsewhere.

## Versioning

Handled automatically — each build stamps a unique build number so repeated
uploads don't collide:
- **iOS**: the `build` lane queries TestFlight for the latest build of the
  current `MARKETING_VERSION` and injects `CURRENT_PROJECT_VERSION = latest + 1`
  via `xcargs`. `project.yml` now maps `CFBundleVersion` →
  `$(CURRENT_PROJECT_VERSION)` and `CFBundleShortVersionString` →
  `$(MARKETING_VERSION)` so the stamp takes effect.
- **Android**: injected as `-PversionCode` (the git commit count via
  `number_of_commits`), which `app/build.gradle.kts` reads (falling back to `1`
  for plain local builds).

The user-facing version (`versionName` / `MARKETING_VERSION`, currently
`1.0.0`) is still bumped by hand when you cut a release.

## Store listing metadata

The `release` lanes upload the **binary only** and leave the live store listing
untouched (`skip_metadata` / `skip_upload_metadata`). To let fastlane manage the
listing too, populate `fastlane/metadata` + `fastlane/screenshots` (via
`fastlane deliver init` / `fastlane supply init`) and flip the skip flags off in
the `release` lanes.

## CI (GitHub Actions)

[`.github/workflows/release.yml`](../.github/workflows/release.yml) runs the
lanes on hosted runners (Ubuntu for Android, macOS for iOS). It's **manual
only** — nothing deploys on push:

1. GitHub → **Actions** → **Release** → **Run workflow**
2. Pick **platform** (android / ios / both) and **lane** (beta / release)

CI reconstructs every secret file at runtime from repository secrets (nothing
sensitive is committed). Set these under **Settings → Secrets and variables →
Actions**:

| Secret | Used by | What it is |
|--------|---------|------------|
| `KEYSTORE_B64` | android | base64 of the upload keystore (`.jks`) |
| `KEYSTORE_PASSWORD` | android | keystore store password |
| `KEY_ALIAS` | android | key alias |
| `KEY_PASSWORD` | android | key password |
| `PLAY_JSON_KEY_B64` | android | base64 of the Play service-account JSON |
| `ASC_KEY_B64` | ios | base64 of the App Store Connect API key `.p8` |
| `ASC_KEY_ID` | ios | API key ID |
| `ASC_ISSUER_ID` | ios | API key issuer ID |
| `APPLE_TEAM_ID` | ios | Apple Developer team ID (`52GK9NV362`) |
| `MATCH_GIT_URL` | ios | git URL of the private certificates repo |
| `MATCH_PASSWORD` | ios | passphrase that encrypts the match repo |
| `MATCH_GIT_BASIC_AUTHORIZATION` | ios | base64 of `user:personal-access-token` for the match repo |

The Android keystore secrets are the **same four** used by
[`android.yml`](../.github/workflows/android.yml)'s tag-gated release job, so if
those are already set there's nothing new to add for Android except
`PLAY_JSON_KEY_B64`.

Encode a file for a `*_B64` secret with:

```sh
base64 -i path/to/file | pbcopy   # then paste as the secret value
```

## How to get each key

### 1. Android upload keystore → `KEYSTORE_B64`
The local keystore is `android/upload-keystore.jks` (referenced by
`android/keystore.properties`). For CI:
```sh
base64 -i android/upload-keystore.jks | pbcopy   # → KEYSTORE_B64
```
Then set `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD` to the same values in
your local `keystore.properties`. **Back the `.jks` up off-repo** — losing it
means you can never update the app on Play.

### 2. Google Play service-account JSON → `PLAY_JSON_KEY_B64`
1. [Play Console](https://play.google.com/console) → **Setup → API access**.
2. **Create new service account** → follow the link to Google Cloud → create a
   service account → **Keys → Add key → JSON** → download it.
3. Back in Play Console, **grant access** with the **Release** permission.
4. Encode: `base64 -i play-service-account.json | pbcopy`.
5. **First upload must be manual**: the API can't create an app, so upload one
   AAB by hand in the Play Console before `fastlane beta` will work. (Personal
   Play accounts created after Nov 2023 also owe a 14-day / 12-tester closed
   test before production.)

### 3. App Store Connect API key → `ASC_KEY_B64` / `ASC_KEY_ID` / `ASC_ISSUER_ID`
1. [App Store Connect](https://appstoreconnect.apple.com) → **Users and Access
   → Integrations → App Store Connect API**.
2. **Generate API Key** with the **App Manager** role. Note the **Key ID** and
   the **Issuer ID** shown above the table.
3. Download the `.p8` (**one-time download**). Encode it:
   `base64 -i AuthKey_XXXXXXXXXX.p8 | pbcopy` → `ASC_KEY_B64`.

### 4. `APPLE_TEAM_ID`
[developer.apple.com](https://developer.apple.com/account) → **Membership** →
the 10-character **Team ID** (`52GK9NV362`).

### 5. iOS signing via `match` (one-time, for CI)
CI can't use your local login-keychain certificate, so `match` stores the
distribution cert + provisioning profile in a private git repo, encrypted.
Run **once locally** with the ASC key already in `ios/fastlane/.env`:
```sh
cd ios
# create an EMPTY private repo first, e.g. github.com/<you>/reelseek-certs
fastlane match init          # paste the certs repo URL when prompted
fastlane match appstore      # creates + uploads the dist cert & profile
```
- `MATCH_GIT_URL` = that certs repo URL.
- `MATCH_PASSWORD` = the passphrase you set during `match appstore`.
- `MATCH_GIT_BASIC_AUTHORIZATION` = `echo -n 'YOUR_GH_USERNAME:YOUR_PAT' | base64`
  — a GitHub PAT with `repo` scope so CI can read the certs repo. (Locally you
  don't need this; your git credentials are used, and with `MATCH_GIT_URL`
  unset the lanes fall back to your login-keychain certificate.)

The App Store app record must exist in App Store Connect before an upload lane
will succeed.
