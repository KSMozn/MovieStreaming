import SwiftUI
import SwiftData

struct DetailView: View {
    let tmdbId: Int
    let mediaType: MediaType
    var prefetched: DiscoverResult? = nil

    @State private var vm = DetailViewModel()
    @Environment(\.modelContext) private var modelContext
    @Query private var watchlist: [WatchlistItem]

    private var isInWatchlist: Bool {
        let key = "\(mediaType.rawValue)-\(tmdbId)"
        return watchlist.contains { $0.compositeKey == key }
    }

    var body: some View {
        ZStack {
            Theme.bg.ignoresSafeArea()

            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    backdrop
                    titleBlock
                    ratingsRow
                    actions
                    if let d = vm.details {
                        overviewBlock(d)
                        if let a = vm.availability {
                            availabilityBlock(a)
                        }
                        castBlock(d.cast)
                    } else if vm.isLoading {
                        ProgressView().tint(Theme.accent)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 40)
                    } else if let msg = vm.errorMessage {
                        Text(msg)
                            .font(.footnote)
                            .foregroundStyle(.red)
                            .padding()
                    }
                }
                .padding(.bottom, 24)
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await vm.load(tmdbId: tmdbId, mediaType: mediaType, country: APIConfig.defaultCountry)
            recordView()
        }
    }

    private func recordView() {
        let title = vm.details?.title ?? prefetched?.title
        guard let title, !title.isEmpty else { return }
        let poster = vm.details?.posterUrl ?? prefetched?.posterUrl
        let year = vm.details?.releaseDate.flatMap { String($0.prefix(4)) } ?? prefetched?.releaseYear
        RecentItem.touch(
            context: modelContext,
            tmdbId: tmdbId,
            mediaType: mediaType,
            title: title,
            posterUrl: poster,
            releaseYear: year
        )
    }

    private var backdrop: some View {
        let backdrop = vm.details?.backdropUrl ?? prefetched?.posterUrl
        return ZStack(alignment: .bottomLeading) {
            RemoteImage(urlString: backdrop)
                .aspectRatio(16/9, contentMode: .fill)
                .frame(maxWidth: .infinity)
                .clipped()

            LinearGradient(
                colors: [Theme.bg.opacity(0), Theme.bg],
                startPoint: .top, endPoint: .bottom
            )
            .frame(height: 100)
            .frame(maxWidth: .infinity, alignment: .bottom)
        }
    }

    private var titleBlock: some View {
        let title = vm.details?.title ?? prefetched?.title ?? ""
        let year = vm.details?.releaseDate.flatMap { String($0.prefix(4)) } ?? prefetched?.releaseYear
        return VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.system(size: 24, weight: .bold))
                .foregroundStyle(Theme.textPrimary)
            HStack(spacing: 8) {
                Text(mediaType == .tv ? "TV" : "Movie")
                    .font(.system(size: 10, weight: .bold))
                    .padding(.horizontal, 6).padding(.vertical, 2)
                    .background(mediaType == .tv ? Color.green.opacity(0.8) : Color.blue.opacity(0.8))
                    .foregroundStyle(Theme.bg)
                    .clipShape(Capsule())
                if let year { Text(year).foregroundStyle(Theme.textSecondary) }
                if let runtime = vm.details?.runtime, runtime > 0 {
                    Text("· \(runtime) min").foregroundStyle(Theme.textSecondary)
                }
                if let seasons = vm.details?.numberOfSeasons, seasons > 0 {
                    Text("· \(seasons) season\(seasons == 1 ? "" : "s")")
                        .foregroundStyle(Theme.textSecondary)
                }
            }
            .font(.system(size: 13))
            if let genres = vm.details?.genres, !genres.isEmpty {
                Text(genres.joined(separator: " · "))
                    .font(.caption)
                    .foregroundStyle(Theme.textMuted)
            }
        }
        .padding(.horizontal, 16)
    }

    private var ratingsRow: some View {
        HStack(spacing: 12) {
            if let r = vm.details?.tmdbRating {
                ratingPill(value: String(format: "%.1f", r), label: "TMDb")
            }
            if let r = vm.details?.imdbRating {
                ratingPill(value: String(format: "%.1f", r), label: "IMDb")
            }
            if let v = vm.details?.tmdbVotes {
                Text("\(v.formatted()) votes")
                    .font(.caption)
                    .foregroundStyle(Theme.textMuted)
            }
            Spacer()
        }
        .padding(.horizontal, 16)
    }

    private func ratingPill(value: String, label: String) -> some View {
        HStack(spacing: 4) {
            Image(systemName: "star.fill").font(.caption).foregroundStyle(Theme.accent)
            Text(value).bold()
            Text(label).foregroundStyle(Theme.textSecondary)
        }
        .font(.system(size: 13))
        .padding(.horizontal, 10).padding(.vertical, 5)
        .background(Theme.surface)
        .overlay(Capsule().stroke(Theme.border))
        .clipShape(Capsule())
    }

    private var actions: some View {
        HStack(spacing: 10) {
            Button {
                toggleWatchlist()
            } label: {
                Label(
                    isInWatchlist ? "In watchlist" : "Add to watchlist",
                    systemImage: isInWatchlist ? "bookmark.fill" : "bookmark"
                )
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
            }
            .background(isInWatchlist ? Theme.accent : Theme.surface)
            .foregroundStyle(isInWatchlist ? Theme.bg : Theme.textPrimary)
            .overlay(RoundedRectangle(cornerRadius: 10).stroke(Theme.border))
            .clipShape(RoundedRectangle(cornerRadius: 10))

            if let imdb = vm.details?.imdbId {
                Link(destination: URL(string: "https://www.imdb.com/title/\(imdb)/")!) {
                    Label("IMDb", systemImage: "arrow.up.right.square")
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                }
                .background(Theme.surface)
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(Theme.border))
                .clipShape(RoundedRectangle(cornerRadius: 10))
            }
        }
        .padding(.horizontal, 16)
    }

    private func overviewBlock(_ d: MovieDetails) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Overview").font(.headline).foregroundStyle(Theme.textPrimary)
            Text(d.overview.isEmpty ? "No overview available." : d.overview)
                .font(.system(size: 14))
                .foregroundStyle(Theme.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(.horizontal, 16)
        .padding(.top, 4)
    }

    private func availabilityBlock(_ a: Availability) -> some View {
        let available = a.providers.filter { $0.available }
        return VStack(alignment: .leading, spacing: 8) {
            Text("Watch in \(a.country)")
                .font(.headline)
                .foregroundStyle(Theme.textPrimary)

            if available.isEmpty {
                Text("Not available on tracked providers in \(a.country).")
                    .font(.footnote)
                    .foregroundStyle(Theme.textMuted)
            } else {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 10) {
                        ForEach(available) { p in
                            providerCard(p)
                        }
                    }
                }
            }
        }
        .padding(.horizontal, 16)
    }

    @ViewBuilder
    private func providerCard(_ p: ProviderAvailability) -> some View {
        if let urlString = p.streamingUrl, let url = URL(string: urlString) {
            Link(destination: url) { providerCardLabel(p) }
        } else {
            providerCardLabel(p)
        }
    }

    private func providerCardLabel(_ p: ProviderAvailability) -> some View {
        VStack(spacing: 6) {
            Image(systemName: p.providerKey.sfSymbol)
                .font(.title2)
                .foregroundStyle(Theme.accent)
            Text(p.providerName)
                .font(.caption2)
                .foregroundStyle(Theme.textPrimary)
            if let t = p.availabilityType {
                Text(t.rawValue.capitalized)
                    .font(.system(size: 9, weight: .semibold))
                    .padding(.horizontal, 6).padding(.vertical, 2)
                    .background(Theme.surface2)
                    .foregroundStyle(Theme.textSecondary)
                    .clipShape(Capsule())
            }
        }
        .frame(width: 84, height: 90)
        .padding(8)
        .background(Theme.surface)
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Theme.border))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }

    private func castBlock(_ cast: [CastMember]) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            if !cast.isEmpty {
                Text("Cast")
                    .font(.headline)
                    .foregroundStyle(Theme.textPrimary)
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(alignment: .top, spacing: 10) {
                        ForEach(cast.prefix(15)) { c in
                            VStack(spacing: 4) {
                                RemoteImage(urlString: c.profileUrl)
                                    .frame(width: 64, height: 64)
                                    .clipShape(Circle())
                                Text(c.name)
                                    .font(.system(size: 11, weight: .medium))
                                    .multilineTextAlignment(.center)
                                    .lineLimit(2)
                                if let ch = c.character {
                                    Text(ch)
                                        .font(.system(size: 10))
                                        .foregroundStyle(Theme.textMuted)
                                        .multilineTextAlignment(.center)
                                        .lineLimit(1)
                                }
                            }
                            .frame(width: 84)
                        }
                    }
                }
            }
        }
        .padding(.horizontal, 16)
    }

    private func toggleWatchlist() {
        let key = "\(mediaType.rawValue)-\(tmdbId)"
        if let existing = watchlist.first(where: { $0.compositeKey == key }) {
            modelContext.delete(existing)
        } else if let d = vm.details {
            modelContext.insert(WatchlistItem(from: d))
        } else if let r = prefetched {
            modelContext.insert(WatchlistItem(from: r))
        }
        try? modelContext.save()
    }
}

