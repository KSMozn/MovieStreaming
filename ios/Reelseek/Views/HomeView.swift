import SwiftUI
import SwiftData

struct HomeView: View {
    // The enclosing NavigationStack's path (owned by RootTabView). Programmatic
    // pushes (e.g. picking an instant-search result) append to this, so the
    // whole stack uses ONE value-based navigation mechanism — mixing
    // navigationDestination(item:) with navigationDestination(for:) in the same
    // stack is undefined behavior and mis-routed cast taps to the current movie.
    @Binding var path: NavigationPath

    @State private var vm = HomeViewModel()
    @State private var showAbout = false
    @State private var searchText: String = ""

    @Query(sort: \RecentItem.viewedAt, order: .reverse) private var recents: [RecentItem]

    private let columns3 = [
        GridItem(.flexible(), spacing: 10),
        GridItem(.flexible(), spacing: 10),
        GridItem(.flexible(), spacing: 10)
    ]
    private let columns5 = [
        GridItem(.flexible(), spacing: 8),
        GridItem(.flexible(), spacing: 8),
        GridItem(.flexible(), spacing: 8),
        GridItem(.flexible(), spacing: 8),
        GridItem(.flexible(), spacing: 8)
    ]

    var body: some View {
        ZStack {
            Theme.bg.ignoresSafeArea()

            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    hero
                    SearchBarField(text: $searchText) { result in
                        path.append(result)
                    }

                    advancedSearchCTA

                    if !recents.isEmpty {
                        recentlyViewedSection
                    }

                    trendingSection

                    footer
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 24)
                .padding(.top, 4)
            }
        }
        .navigationTitle("ReelSeek")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Button {
                    showAbout = true
                } label: {
                    Image(systemName: "info.circle")
                        .foregroundStyle(Theme.accent)
                }
            }
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    Task { await vm.load() }
                } label: {
                    Image(systemName: "arrow.clockwise")
                }
                .disabled(vm.isLoading)
            }
        }
        .sheet(isPresented: $showAbout) {
            AboutView()
        }
        .navigationDestination(for: DiscoverResult.self) { r in
            DetailView(tmdbId: r.tmdbId, mediaType: r.mediaType, prefetched: r)
        }
        .navigationDestination(for: AdvancedSearchTarget.self) { _ in
            SearchView()
        }
        .task {
            if vm.results.isEmpty { await vm.load() }
        }
        .refreshable { await vm.load() }
    }

    // MARK: – Sections

    private var hero: some View {
        VStack(alignment: .center, spacing: 8) {
            Text("Find what to watch.")
                .font(.system(size: 30, weight: .bold))
                .foregroundStyle(Theme.textPrimary)
                .multilineTextAlignment(.center)
            Text("Discover movies and TV shows and see where they are streaming in your country.")
                .font(.system(size: 13))
                .foregroundStyle(Theme.textSecondary)
                .multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 12)
    }

    private var advancedSearchCTA: some View {
        NavigationLink(value: AdvancedSearchTarget.open) {
            HStack(spacing: 8) {
                Image(systemName: "slider.horizontal.3")
                Text("Advanced search")
                    .fontWeight(.medium)
                Spacer()
                Image(systemName: "chevron.right")
                    .foregroundStyle(Theme.textMuted)
            }
            .font(.system(size: 14))
            .foregroundStyle(Theme.textPrimary)
            .padding(.horizontal, 14)
            .padding(.vertical, 11)
            .background(Theme.surface)
            .overlay(
                RoundedRectangle(cornerRadius: 12).stroke(Theme.border, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }

    private var recentlyViewedSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            sectionHeader("RECENTLY VIEWED")
            LazyVGrid(columns: columns5, spacing: 10) {
                ForEach(recents.prefix(10)) { item in
                    let r = DiscoverResult(
                        tmdbId: item.tmdbId,
                        mediaType: item.mediaType,
                        title: item.title,
                        releaseYear: item.releaseYear,
                        posterUrl: item.posterUrl,
                        voteAverage: nil,
                        voteCount: nil
                    )
                    NavigationLink(value: r) {
                        compactPoster(r)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private var trendingSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            sectionHeader("TRENDING")
            if vm.isLoading && vm.results.isEmpty {
                ProgressView().tint(Theme.accent)
                    .frame(maxWidth: .infinity, minHeight: 140)
            } else if let msg = vm.errorMessage, vm.results.isEmpty {
                Text(msg)
                    .font(.footnote)
                    .foregroundStyle(.red)
            } else {
                LazyVGrid(columns: columns3, spacing: 14) {
                    ForEach(vm.results.prefix(12)) { r in
                        NavigationLink(value: r) {
                            PosterCard(result: r)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    private var footer: some View {
        Text("Data from TMDb, Watchmode, and OMDb. Not affiliated with any provider.")
            .font(.system(size: 11))
            .foregroundStyle(Theme.textMuted)
            .multilineTextAlignment(.center)
            .frame(maxWidth: .infinity)
            .padding(.top, 12)
    }

    // MARK: – Helpers

    private func sectionHeader(_ title: String) -> some View {
        Text(title)
            .font(.system(size: 11, weight: .semibold))
            .tracking(1.4)
            .foregroundStyle(Theme.textMuted)
    }

    private func compactPoster(_ r: DiscoverResult) -> some View {
        VStack(spacing: 4) {
            ZStack(alignment: .topLeading) {
                RemoteImage(urlString: r.posterUrl)
                    .aspectRatio(2/3, contentMode: .fit)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                if r.mediaType == .tv {
                    Text("TV")
                        .font(.system(size: 8, weight: .bold))
                        .tracking(0.5)
                        .padding(.horizontal, 4).padding(.vertical, 1)
                        .background(Color.green.opacity(0.85))
                        .foregroundStyle(Theme.bg)
                        .clipShape(Capsule())
                        .padding(4)
                }
            }
            Text(r.title)
                .font(.system(size: 10))
                .foregroundStyle(Theme.textSecondary)
                .lineLimit(2)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

/// Distinct hashable so the navigationDestination to advanced search doesn't
/// collide with DiscoverResult destinations.
enum AdvancedSearchTarget: Hashable {
    case open
}
