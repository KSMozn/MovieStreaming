import Foundation
import Observation

@Observable
@MainActor
final class SearchViewModel {
    var query = DiscoverQuery()
    var results: [DiscoverResult] = []
    var totalResults: Int = 0
    var totalPages: Int = 1
    var isLoading = false
    var errorMessage: String?
    var warnings: [String] = []
    var genres: [CombinedGenre] = []
    var personResults: [PersonSearchResult] = []
    var selectedPersonName: String = ""

    private var searchTask: Task<Void, Never>?
    private var personTask: Task<Void, Never>?

    init() {
        // Default the country filter to the persisted preference (@AppStorage
        // in DetailView/FiltersSheet writes the same UserDefaults key).
        if let saved = UserDefaults.standard.string(forKey: "country") {
            query.country = saved
        }
    }

    func loadGenres() async {
        if !genres.isEmpty { return }
        do {
            genres = try await MovieAPI.genres()
        } catch {
            // genres are non-critical; silently swallow
        }
    }

    func runSearch(resetPage: Bool = true) {
        if resetPage { query.page = 1 }
        searchTask?.cancel()
        searchTask = Task { [query] in
            await self.fetch(query: query)
        }
    }

    func nextPage() {
        guard query.page < totalPages, !isLoading else { return }
        query.page += 1
        runSearch(resetPage: false)
    }

    private func fetch(query q: DiscoverQuery) async {
        self.isLoading = true
        defer { self.isLoading = false }
        do {
            let resp = try await MovieAPI.discover(q)
            try Task.checkCancellation()
            if q.page == 1 {
                self.results = resp.results
            } else {
                self.results.append(contentsOf: resp.results)
            }
            self.totalResults = resp.totalResults
            self.totalPages = resp.totalPages
            self.warnings = resp.warnings
            self.errorMessage = nil
        } catch is CancellationError {
            // ignore
        } catch {
            self.errorMessage = (error as? LocalizedError)?.errorDescription ?? error.localizedDescription
        }
    }

    func searchPerson(_ name: String) {
        personTask?.cancel()
        let trimmed = name.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty else {
            personResults = []
            return
        }
        personTask = Task { @MainActor in
            try? await Task.sleep(nanoseconds: 250_000_000)
            if Task.isCancelled { return }
            do {
                let res = try await MovieAPI.searchPerson(trimmed)
                if Task.isCancelled { return }
                self.personResults = res
            } catch {
                // ignore
            }
        }
    }

    func selectPerson(_ p: PersonSearchResult) {
        query.personId = p.personId
        selectedPersonName = p.name
        personResults = []
    }

    func clearPerson() {
        query.personId = nil
        selectedPersonName = ""
        personResults = []
    }

    func reset() {
        query = DiscoverQuery()
        results = []
        totalResults = 0
        totalPages = 1
        warnings = []
        selectedPersonName = ""
        personResults = []
        errorMessage = nil
    }
}
