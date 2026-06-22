---
title: Privacy Policy — Reelseek
permalink: /privacy/
---

# Privacy Policy

**Last updated:** 22 June 2026

This is the privacy policy for the **Reelseek** iOS app and web app (the "App"), operated by Khaled Samir (the "Operator").

The App is designed to collect as little data as possible. We do not require an account, we do not show ads, we do not embed third-party analytics or advertising SDKs, and we do not sell or share personal data.

## 1. What the App stores on your device

- **Watchlist.** Titles you bookmark are saved locally on your device using Apple SwiftData. This data never leaves your device and is not synced to any server we operate. Uninstalling the App deletes it.
- **App preferences.** Country code and last-used filters may be cached in `UserDefaults` on your device.

We do not have access to anything stored on your device.

## 2. What the App sends to our server

When you search or open a title, the App makes a network request to our backend (`movie-streaming-150176375922.europe-west1.run.app`, hosted on Google Cloud Run in the EU). Each request may include:

- Your search query or selected filter parameters (genre, year, provider, country, sort order).
- The TMDb numeric ID of a title you opened.
- A country code used to look up regional streaming availability (defaults to "EG").

The request also includes standard network metadata that any web request sends — your IP address, user-agent string, and timestamp. We do not store these in a user-identifiable database. Cloud Run access logs are retained for **30 days** for operational and security purposes and are then deleted.

We do **not** receive or store: your Apple ID, your name, your email, your contacts, your device identifiers, your location (beyond country code if you change it), or any payment information. The App does not request these.

## 3. Third-party services the App relies on

To answer your queries, our server calls these third-party APIs. **You do not interact with them directly through the App, but they receive the request metadata our server forwards.**

| Service | Purpose | Privacy policy |
|---|---|---|
| The Movie Database (TMDb) | Title metadata, ratings, cast, posters, watch-provider mappings | [themoviedb.org/privacy-policy](https://www.themoviedb.org/privacy-policy) |
| OMDb API | IMDb rating lookup | [omdbapi.com](https://www.omdbapi.com/) |
| Watchmode | Supplemental streaming-availability data | [watchmode.com/privacy](https://www.watchmode.com/privacy) |
| Google Cloud Run (Google LLC) | Hosting the backend | [policies.google.com/privacy](https://policies.google.com/privacy) |

Poster, backdrop, and cast profile images are loaded **directly** from TMDb's public image CDN (`image.tmdb.org`) by your device. This means TMDb's CDN sees your IP address when those images load.

## 4. Children's privacy

The App is not directed at children under 13 and does not knowingly collect personal information from children. If you believe a child has provided personal information to us, please contact us and we will delete it.

## 5. Your rights

Because we do not maintain user accounts or user-identifiable records beyond short-lived operational logs, there is typically no personal record to access, correct, or delete. If you have specific questions about data tied to your IP address in our access logs, contact us at the address below within the 30-day retention window and we will assist within applicable legal timeframes.

## 6. Changes to this policy

We may update this policy from time to time. The "Last updated" date at the top will change accordingly. Material changes will be highlighted in the App's About screen.

## 7. Contact

Questions about this policy? Email **samir.k@mozn.sa**.

---

*This product uses the TMDb API but is not endorsed or certified by TMDb.*
