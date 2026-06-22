import SwiftUI
import Observation

/// Autocomplete search field. Mirrors the web `SearchBar` component — debounced
/// 300ms, hits `/api/movies/search`, shows a dropdown of titles + posters.
struct SearchBarField: View {
    @Binding var text: String
    var onPick: (DiscoverResult) -> Void

    @State private var results: [DiscoverResult] = []
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var debounceTask: Task<Void, Never>?
    @FocusState private var focused: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            field

            if focused && !text.isEmpty {
                dropdown
                    .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
        .animation(.easeOut(duration: 0.12), value: results.count)
        .animation(.easeOut(duration: 0.12), value: focused)
    }

    private var field: some View {
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass")
                .foregroundStyle(Theme.textMuted)
            TextField("Search a movie… e.g. Inception", text: $text)
                .textInputAutocapitalization(.words)
                .autocorrectionDisabled()
                .submitLabel(.search)
                .focused($focused)
                .onChange(of: text) { _, new in
                    schedule(new)
                }
            if isLoading {
                ProgressView().controlSize(.small).tint(Theme.textMuted)
            } else if !text.isEmpty {
                Button {
                    text = ""
                    results = []
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundStyle(Theme.textMuted)
                }
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 13)
        .background(Theme.surface)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(focused ? Theme.accent : Theme.border, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    @ViewBuilder
    private var dropdown: some View {
        VStack(spacing: 0) {
            if let err = errorMessage {
                Text(err)
                    .font(.footnote)
                    .foregroundStyle(.red)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(12)
            } else if isLoading && results.isEmpty {
                Text("Searching…")
                    .font(.footnote)
                    .foregroundStyle(Theme.textSecondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(12)
            } else if results.isEmpty {
                Text("No results for \u{201C}\(text)\u{201D}.")
                    .font(.footnote)
                    .foregroundStyle(Theme.textSecondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(12)
            } else {
                ForEach(Array(results.prefix(8).enumerated()), id: \.element.id) { idx, r in
                    Button {
                        onPick(r)
                        focused = false
                    } label: {
                        row(r)
                    }
                    .buttonStyle(.plain)
                    if idx < min(results.count, 8) - 1 {
                        Divider().background(Theme.border)
                    }
                }
            }
        }
        .background(Theme.surface)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Theme.border, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .padding(.top, 6)
    }

    private func row(_ r: DiscoverResult) -> some View {
        HStack(spacing: 10) {
            RemoteImage(urlString: r.posterUrl)
                .frame(width: 36, height: 50)
                .clipShape(RoundedRectangle(cornerRadius: 4))
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    Text(r.title)
                        .font(.system(size: 14))
                        .foregroundStyle(Theme.textPrimary)
                        .lineLimit(1)
                    Text(r.mediaType == .tv ? "TV" : "MOVIE")
                        .font(.system(size: 9, weight: .bold))
                        .tracking(0.5)
                        .padding(.horizontal, 5).padding(.vertical, 1)
                        .background(r.mediaType == .tv ? Color.green.opacity(0.20) : Color.blue.opacity(0.20))
                        .foregroundStyle(r.mediaType == .tv ? Color.green : Color.blue)
                        .clipShape(Capsule())
                }
                Text(r.releaseYear ?? "—")
                    .font(.system(size: 11))
                    .foregroundStyle(Theme.textMuted)
            }
            Spacer()
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 8)
        .contentShape(Rectangle())
    }

    private func schedule(_ q: String) {
        debounceTask?.cancel()
        let trimmed = q.trimmingCharacters(in: .whitespaces)
        if trimmed.isEmpty {
            results = []
            isLoading = false
            errorMessage = nil
            return
        }
        debounceTask = Task {
            try? await Task.sleep(nanoseconds: 300_000_000)
            if Task.isCancelled { return }
            await runSearch(trimmed)
        }
    }

    @MainActor
    private func runSearch(_ q: String) async {
        isLoading = true
        errorMessage = nil
        do {
            let res = try await MovieAPI.searchMovies(q)
            if Task.isCancelled { return }
            self.results = res
        } catch {
            self.errorMessage = (error as? LocalizedError)?.errorDescription ?? error.localizedDescription
        }
        isLoading = false
    }
}
