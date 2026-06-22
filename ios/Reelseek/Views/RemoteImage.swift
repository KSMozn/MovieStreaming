import SwiftUI
import UIKit

/// Image loader that survives transient network failures, unlike `AsyncImage`
/// which caches the failed phase and never retries — leaving recently-viewed
/// cells stuck on a placeholder forever after one blip. Uses URLSession with
/// the shared URLCache (HTTP caching) and retries up to `maxAttempts` times
/// with short backoff on error.
struct RemoteImage: View {
    let urlString: String?
    var contentMode: ContentMode = .fill
    var maxAttempts: Int = 3

    @State private var image: UIImage?
    @State private var failed = false

    var body: some View {
        Group {
            if let image {
                Image(uiImage: image)
                    .resizable()
                    .aspectRatio(contentMode: contentMode)
            } else if failed {
                placeholder
            } else {
                ZStack {
                    Theme.surface2
                    ProgressView().tint(Theme.textMuted)
                }
            }
        }
        .task(id: urlString) {
            await load()
        }
    }

    private var placeholder: some View {
        ZStack {
            Theme.surface2
            Image(systemName: "film")
                .font(.title2)
                .foregroundStyle(Theme.textMuted)
        }
    }

    private func load() async {
        // The `.task(id:)` cancels and restarts whenever urlString changes
        // (e.g. cells reusing in a grid), so we reset on entry.
        await MainActor.run {
            self.image = nil
            self.failed = false
        }
        guard let s = urlString, let url = URL(string: s) else {
            await MainActor.run { self.failed = true }
            return
        }

        for attemptIndex in 0..<maxAttempts {
            if Task.isCancelled { return }
            do {
                let (data, response) = try await URLSession.shared.data(from: url)
                if Task.isCancelled { return }
                guard let http = response as? HTTPURLResponse,
                      (200..<300).contains(http.statusCode) else {
                    throw URLError(.badServerResponse)
                }
                if let img = UIImage(data: data) {
                    await MainActor.run {
                        self.image = img
                        self.failed = false
                    }
                    return
                }
                throw URLError(.cannotDecodeContentData)
            } catch is CancellationError {
                return
            } catch {
                // Backoff: 0.4s, 1.2s, 3.6s …
                let factor = pow(3.0, Double(attemptIndex))
                let delayMs = UInt64(400_000_000 * factor)
                try? await Task.sleep(nanoseconds: delayMs)
            }
        }
        await MainActor.run { self.failed = true }
    }
}
