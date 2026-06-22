import Foundation

struct DiscoverResult: Codable, Identifiable, Hashable {
    let tmdbId: Int
    let mediaType: MediaType
    let title: String
    let releaseYear: String?
    let posterUrl: String?
    let voteAverage: Double?
    let voteCount: Int?

    var id: String { "\(mediaType.rawValue)-\(tmdbId)" }
}

struct DiscoverAppliedFilters: Codable {
    let name: String?
    let year: Int?
    let genreIds: [Int]
    let providerKey: ProviderKey?
    let voteAverageGte: Double?
    let personId: Int?
    let mediaType: String
    let country: String
    let page: Int
    let sortBy: SortKey
}

struct DiscoverResponse: Codable {
    let results: [DiscoverResult]
    let page: Int
    let totalPages: Int
    let totalResults: Int
    let appliedFilters: DiscoverAppliedFilters
    let warnings: [String]
}

struct CombinedGenre: Codable, Identifiable, Hashable {
    let id: Int
    let name: String
    let appliesTo: [String]
}
