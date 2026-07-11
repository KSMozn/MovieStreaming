import Foundation

struct DiscoverQuery {
    var name: String = ""
    var year: String = ""
    var genreIds: [Int] = []
    var provider: ProviderKey? = nil
    var voteGte: String = ""
    var personId: Int? = nil
    var mediaType: MediaTypeFilter = .both
    var country: String = APIConfig.defaultCountry
    var sortBy: SortKey = .default
    var page: Int = 1

    func toQuery() -> [String: String?] {
        [
            "q": name.isEmpty ? nil : name,
            "year": year.isEmpty ? nil : year,
            "genres": genreIds.isEmpty ? nil : genreIds.map(String.init).joined(separator: ","),
            "provider": provider?.rawValue,
            "voteGte": voteGte.isEmpty ? nil : voteGte,
            "personId": personId.map(String.init),
            "mediaType": mediaType == .both ? nil : mediaType.rawValue,
            "country": country,
            "sortBy": sortBy == .default ? nil : sortBy.rawValue,
            "page": page > 1 ? String(page) : nil
        ]
    }
}

enum MovieAPI {
    static func discover(_ q: DiscoverQuery) async throws -> DiscoverResponse {
        try await APIClient.shared.get("/api/discover", query: q.toQuery())
    }

    static func genres() async throws -> [CombinedGenre] {
        try await APIClient.shared.get("/api/genres")
    }

    static func details(tmdbId: Int, mediaType: MediaType) async throws -> MovieDetails {
        try await APIClient.shared.get(
            "/api/movies/\(tmdbId)",
            query: ["type": mediaType.rawValue]
        )
    }

    static func availability(tmdbId: Int, mediaType: MediaType, country: String) async throws -> Availability {
        try await APIClient.shared.get(
            "/api/movies/\(tmdbId)/availability",
            query: ["type": mediaType.rawValue, "country": country]
        )
    }

    static func searchPerson(_ name: String) async throws -> [PersonSearchResult] {
        try await APIClient.shared.get("/api/people/search", query: ["q": name])
    }

    /// Person detail + filmography — mirrors the web /person/[personId] page.
    static func person(_ personId: Int) async throws -> Person {
        try await APIClient.shared.get("/api/people/\(personId)")
    }

    /// Instant title search — autocomplete style. Returns lightweight items
    /// matching the web's `/api/movies/search` endpoint.
    static func searchMovies(_ name: String) async throws -> [DiscoverResult] {
        try await APIClient.shared.get("/api/movies/search", query: ["q": name])
    }

    /// Trending: /api/discover with no filters, sorted by popularity.
    static func trending(mediaType: MediaTypeFilter = .both, page: Int = 1) async throws -> DiscoverResponse {
        var q = DiscoverQuery()
        q.mediaType = mediaType
        q.sortBy = .popularityDesc
        q.page = page
        return try await discover(q)
    }
}
