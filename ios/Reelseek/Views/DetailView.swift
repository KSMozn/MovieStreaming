import SwiftUI
import SwiftData

struct DetailView: View {
    let tmdbId: Int
    let mediaType: MediaType
    var prefetched: DiscoverResult? = nil

    @State private var vm = DetailViewModel()
    @State private var showTrailer = false
    @Environment(\.modelContext) private var modelContext
    @Query private var watchlist: [WatchlistItem]
    // Persisted availability country (EG/SA/AE), shared with FiltersSheet —
    // the web keeps this in the URL, here it's an app-wide preference.
    @AppStorage("country") private var country: String = APIConfig.defaultCountry

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
                        if let trailer = d.trailer {
                            trailerBlock(trailer)
                        }
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
        .navigationDestination(for: CastMember.self) { c in
            PersonView(personId: c.personId)
        }
        .task {
            await vm.load(tmdbId: tmdbId, mediaType: mediaType, country: country)
            recordView()
        }
        .onChange(of: country) { _, newCountry in
            Task {
                await vm.reloadAvailability(tmdbId: tmdbId, mediaType: mediaType, country: newCountry)
            }
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
        return ZStack(alignment: .bottom) {
            RemoteImage(urlString: backdrop, contentMode: .fill)
                .frame(maxWidth: .infinity)
                .frame(height: 220)
                .clipped()

            LinearGradient(
                colors: [Theme.bg.opacity(0), Theme.bg],
                startPoint: .top, endPoint: .bottom
            )
            .frame(height: 100)
            .frame(maxWidth: .infinity)
        }
        .frame(height: 220)
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

    // MARK: Trailer

    private func trailerBlock(_ trailer: Trailer) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Trailer").font(.headline).foregroundStyle(Theme.textPrimary)
            Button {
                showTrailer = true
            } label: {
                ZStack {
                    RemoteImage(urlString: trailer.thumbnailUrl, contentMode: .fill)
                        .frame(maxWidth: .infinity)
                        .frame(height: 190)
                        .clipped()
                    Color.black.opacity(0.25)
                    Image(systemName: "play.circle.fill")
                        .font(.system(size: 54))
                        .foregroundStyle(.white)
                        .shadow(radius: 8)
                }
                .frame(height: 190)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Theme.border))
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Play official trailer")
        }
        .padding(.horizontal, 16)
        .sheet(isPresented: $showTrailer) {
            NavigationStack {
                TrailerPlayerView(youtubeKey: trailer.key)
                    .aspectRatio(16.0 / 9.0, contentMode: .fit)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Color.black)
                    .navigationTitle(trailer.name)
                    .navigationBarTitleDisplayMode(.inline)
                    .toolbar {
                        ToolbarItem(placement: .topBarLeading) {
                            if let url = URL(string: trailer.url) {
                                Link("YouTube", destination: url)
                            }
                        }
                        ToolbarItem(placement: .topBarTrailing) {
                            Button("Done") { showTrailer = false }
                        }
                    }
            }
        }
    }

    // MARK: In-theaters

    private func countryLabel(_ code: String) -> String {
        APIConfig.countries.first { $0.code == code }?.label ?? code
    }

    private func showtimesURL(title: String, countryLabel: String) -> URL? {
        let q = "\(title) showtimes \(countryLabel)"
        let encoded = q.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? q
        return URL(string: "https://www.google.com/search?q=\(encoded)")
    }

    private func theatricalBanner(_ th: Theatrical, countryLabel: String, title: String) -> some View {
        let heading = th.status == "now"
            ? "In theaters now in \(countryLabel)"
            : "Coming to cinemas in \(countryLabel)"
        return HStack(spacing: 10) {
            Image(systemName: "ticket.fill").foregroundStyle(Theme.accent)
            VStack(alignment: .leading, spacing: 2) {
                Text(heading)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(Theme.textPrimary)
                if let d = th.releaseDate {
                    Text(String(d.prefix(10)))
                        .font(.caption)
                        .foregroundStyle(Theme.textSecondary)
                }
            }
            Spacer()
            if let url = showtimesURL(title: title, countryLabel: countryLabel) {
                Link("Showtimes", destination: url)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(Theme.accent)
            }
        }
        .padding(10)
        .background(Theme.accent.opacity(0.12))
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Theme.accent.opacity(0.3)))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }

    private func availabilityBlock(_ a: Availability) -> some View {
        let available = a.providers.filter { $0.available }
        return VStack(alignment: .leading, spacing: 8) {
            if let th = a.theatrical, th.status != "none" {
                theatricalBanner(
                    th,
                    countryLabel: countryLabel(a.country),
                    title: vm.details?.title ?? ""
                )
            }
            HStack {
                Text("Watch in \(countryLabel(a.country))")
                    .font(.headline)
                    .foregroundStyle(Theme.textPrimary)
                Spacer()
                // Same country switcher as the web detail page (TitleDetails.tsx).
                // Menu (not segmented) so all supported countries fit.
                Picker("Country", selection: $country) {
                    ForEach(APIConfig.countries, id: \.code) { c in
                        Text(c.label).tag(c.code)
                    }
                }
                .pickerStyle(.menu)
                .tint(Theme.accent)
            }

            if available.isEmpty {
                Text("Not available on tracked providers in \(countryLabel(a.country)).")
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
                            // Tappable, like CastList on the website.
                            NavigationLink(value: c) {
                                VStack(spacing: 4) {
                                    RemoteImage(urlString: c.profileUrl)
                                        .frame(width: 64, height: 64)
                                        .clipShape(Circle())
                                    Text(c.name)
                                        .font(.system(size: 11, weight: .medium))
                                        .multilineTextAlignment(.center)
                                        .lineLimit(2)
                                    if let ch = c.character, !ch.isEmpty {
                                        Text(ch)
                                            .font(.system(size: 10))
                                            .foregroundStyle(Theme.textMuted)
                                            .multilineTextAlignment(.center)
                                            .lineLimit(1)
                                    }
                                }
                                .frame(width: 84)
                            }
                            .buttonStyle(.plain)
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

