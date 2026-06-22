import SwiftUI

struct HomeView: View {
    @State private var vm = HomeViewModel()
    @State private var showAbout = false

    private let columns = [
        GridItem(.flexible(), spacing: 10),
        GridItem(.flexible(), spacing: 10),
        GridItem(.flexible(), spacing: 10)
    ]

    var body: some View {
        ZStack {
            Theme.bg.ignoresSafeArea()

            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    header

                    if vm.isLoading && vm.results.isEmpty {
                        loadingState
                    } else if let msg = vm.errorMessage, vm.results.isEmpty {
                        errorState(msg)
                    } else {
                        grid
                    }
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 24)
            }
        }
        .navigationTitle("Trending")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Button {
                    showAbout = true
                } label: {
                    Image(systemName: "info.circle")
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
        .task {
            if vm.results.isEmpty { await vm.load() }
        }
        .refreshable { await vm.load() }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Find where to watch")
                .font(.system(size: 28, weight: .bold))
                .foregroundStyle(Theme.textPrimary)
            Text("Trending across movies and TV")
                .font(.system(size: 14))
                .foregroundStyle(Theme.textSecondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.top, 8)
    }

    private var grid: some View {
        LazyVGrid(columns: columns, spacing: 14) {
            ForEach(vm.results) { r in
                NavigationLink(value: r) {
                    PosterCard(result: r)
                }
                .buttonStyle(.plain)
            }
        }
        .navigationDestination(for: DiscoverResult.self) { r in
            DetailView(tmdbId: r.tmdbId, mediaType: r.mediaType, prefetched: r)
        }
    }

    private var loadingState: some View {
        VStack(spacing: 12) {
            ProgressView().tint(Theme.accent)
            Text("Loading…").foregroundStyle(Theme.textMuted)
        }
        .frame(maxWidth: .infinity, minHeight: 240)
    }

    private func errorState(_ msg: String) -> some View {
        VStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle")
                .font(.title)
                .foregroundStyle(.orange)
            Text(msg)
                .multilineTextAlignment(.center)
                .font(.footnote)
                .foregroundStyle(Theme.textSecondary)
            Button("Retry") { Task { await vm.load() } }
                .buttonStyle(.borderedProminent)
                .tint(Theme.accent)
        }
        .padding(24)
        .frame(maxWidth: .infinity)
    }
}
