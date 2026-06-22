import SwiftUI

struct SearchView: View {
    @State private var vm = SearchViewModel()
    @State private var showFilters = false

    private let columns = [
        GridItem(.flexible(), spacing: 10),
        GridItem(.flexible(), spacing: 10),
        GridItem(.flexible(), spacing: 10)
    ]

    var body: some View {
        @Bindable var vm = vm
        return ZStack {
            Theme.bg.ignoresSafeArea()

            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    queryBar(vm: vm)

                    activeFiltersStrip

                    if let msg = vm.errorMessage {
                        Text(msg)
                            .font(.footnote)
                            .foregroundStyle(.red)
                            .padding(10)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color.red.opacity(0.1))
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                    }

                    if !vm.warnings.isEmpty {
                        VStack(alignment: .leading, spacing: 4) {
                            ForEach(vm.warnings, id: \.self) { w in
                                Text("⚠ \(w)")
                                    .font(.system(size: 12))
                                    .foregroundStyle(.orange)
                            }
                        }
                        .padding(10)
                        .background(Color.orange.opacity(0.08))
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                    }

                    resultsSummary

                    if vm.results.isEmpty && !vm.isLoading {
                        emptyState
                    } else {
                        grid
                    }

                    if vm.isLoading {
                        ProgressView().tint(Theme.accent)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                    } else if !vm.results.isEmpty && vm.query.page < vm.totalPages {
                        Button("Load more") {
                            vm.nextPage()
                        }
                        .buttonStyle(.bordered)
                        .tint(Theme.accent)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 24)
            }
        }
        .navigationTitle("Search")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    showFilters = true
                } label: {
                    Image(systemName: "slider.horizontal.3")
                }
            }
        }
        .sheet(isPresented: $showFilters) {
            FiltersSheet(vm: vm)
                .presentationDetents([.large])
        }
        .navigationDestination(for: DiscoverResult.self) { r in
            DetailView(tmdbId: r.tmdbId, mediaType: r.mediaType, prefetched: r)
        }
        .task {
            await vm.loadGenres()
        }
    }

    private func queryBar(vm: SearchViewModel) -> some View {
        @Bindable var vm = vm
        return HStack(spacing: 8) {
            HStack(spacing: 6) {
                Image(systemName: "magnifyingglass")
                    .foregroundStyle(Theme.textMuted)
                TextField("Title (optional)", text: $vm.query.name)
                    .textInputAutocapitalization(.never)
                    .submitLabel(.search)
                    .onSubmit { vm.runSearch() }
                if !vm.query.name.isEmpty {
                    Button {
                        vm.query.name = ""
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(Theme.textMuted)
                    }
                }
            }
            .padding(10)
            .background(Theme.surface)
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .overlay(RoundedRectangle(cornerRadius: 10).stroke(Theme.border))

            Button("Go") { vm.runSearch() }
                .buttonStyle(.borderedProminent)
                .tint(Theme.accent)
                .foregroundStyle(Theme.bg)
        }
    }

    @ViewBuilder
    private var activeFiltersStrip: some View {
        let chips = filterChips()
        if !chips.isEmpty {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 6) {
                    ForEach(chips, id: \.self) { c in
                        Text(c)
                            .font(.system(size: 11, weight: .medium))
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Theme.surface2)
                            .clipShape(Capsule())
                            .foregroundStyle(Theme.textSecondary)
                    }
                    Button {
                        vm.reset()
                    } label: {
                        Label("Clear", systemImage: "xmark.circle")
                            .font(.system(size: 11, weight: .medium))
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                    }
                    .tint(.red)
                }
            }
        }
    }

    private func filterChips() -> [String] {
        var out: [String] = []
        if !vm.query.year.isEmpty           { out.append("Year: \(vm.query.year)") }
        if !vm.query.genreIds.isEmpty       { out.append("\(vm.query.genreIds.count) genre(s)") }
        if let p = vm.query.provider        { out.append(p.displayName) }
        if !vm.query.voteGte.isEmpty        { out.append("≥ \(vm.query.voteGte) ★") }
        if !vm.selectedPersonName.isEmpty   { out.append("with \(vm.selectedPersonName)") }
        if vm.query.mediaType != .both      { out.append(vm.query.mediaType.label) }
        if vm.query.country != "EG"         { out.append("📍 \(vm.query.country)") }
        if vm.query.sortBy != .default      { out.append(vm.query.sortBy.label) }
        return out
    }

    @ViewBuilder
    private var resultsSummary: some View {
        if vm.totalResults > 0 {
            Text("\(vm.totalResults.formatted()) matches · page \(vm.query.page) of \(vm.totalPages)")
                .font(.system(size: 12))
                .foregroundStyle(Theme.textMuted)
        }
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
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "slider.horizontal.3")
                .font(.title)
                .foregroundStyle(Theme.textMuted)
            Text("Pick any combination of genre, provider, year, rating, sort order, or cast member — title is optional.")
                .multilineTextAlignment(.center)
                .font(.footnote)
                .foregroundStyle(Theme.textSecondary)
            HStack(spacing: 8) {
                Button {
                    showFilters = true
                } label: {
                    Label("Open filters", systemImage: "slider.horizontal.3")
                }
                .buttonStyle(.borderedProminent)
                .tint(Theme.accent)
                .foregroundStyle(Theme.bg)

                Button {
                    vm.runSearch()
                } label: {
                    Label("Browse popular", systemImage: "flame")
                }
                .buttonStyle(.bordered)
                .tint(Theme.accent)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(32)
    }
}
