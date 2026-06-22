import SwiftUI
import SwiftData

struct WatchlistView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \WatchlistItem.addedAt, order: .reverse) private var items: [WatchlistItem]

    private let columns = [
        GridItem(.flexible(), spacing: 10),
        GridItem(.flexible(), spacing: 10),
        GridItem(.flexible(), spacing: 10)
    ]

    var body: some View {
        ZStack {
            Theme.bg.ignoresSafeArea()

            if items.isEmpty {
                emptyState
            } else {
                ScrollView {
                    LazyVGrid(columns: columns, spacing: 14) {
                        ForEach(items) { item in
                            NavigationLink {
                                DetailView(tmdbId: item.tmdbId, mediaType: item.mediaType)
                            } label: {
                                PosterCard(result: DiscoverResult(
                                    tmdbId: item.tmdbId,
                                    mediaType: item.mediaType,
                                    title: item.title,
                                    releaseYear: item.releaseYear,
                                    posterUrl: item.posterUrl,
                                    voteAverage: nil,
                                    voteCount: nil
                                ))
                            }
                            .buttonStyle(.plain)
                            .contextMenu {
                                Button(role: .destructive) {
                                    modelContext.delete(item)
                                    try? modelContext.save()
                                } label: {
                                    Label("Remove", systemImage: "trash")
                                }
                            }
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 14)
                }
            }
        }
        .navigationTitle("Watchlist")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "bookmark")
                .font(.system(size: 40))
                .foregroundStyle(Theme.textMuted)
            Text("Your watchlist is empty")
                .font(.headline)
                .foregroundStyle(Theme.textPrimary)
            Text("Add titles from the detail view to keep them here.")
                .font(.footnote)
                .multilineTextAlignment(.center)
                .foregroundStyle(Theme.textSecondary)
        }
        .padding(32)
    }
}
