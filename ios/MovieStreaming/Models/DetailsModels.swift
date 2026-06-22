import Foundation

struct CastMember: Codable, Identifiable, Hashable {
    let personId: Int
    let name: String
    let character: String?
    let profileUrl: String?

    var id: Int { personId }
}

struct MovieDetails: Codable {
    let tmdbId: Int
    let mediaType: MediaType
    let imdbId: String?
    let title: String
    let originalTitle: String
    let overview: String
    let posterUrl: String?
    let backdropUrl: String?
    let releaseDate: String?
    let runtime: Int?
    let numberOfSeasons: Int?
    let numberOfEpisodes: Int?
    let genres: [String]
    let imdbRating: Double?
    let tmdbRating: Double?
    let tmdbVotes: Int?
    let cast: [CastMember]
}

struct ProviderAvailability: Codable, Identifiable, Hashable {
    let providerKey: ProviderKey
    let providerName: String
    let logoUrl: String
    let available: Bool
    let availabilityType: AvailabilityType?
    let streamingUrl: String?
    let startsAt: String?
    let endsAt: String?
    let providerGenre: String?

    var id: String { providerKey.rawValue }
}

struct Availability: Codable {
    let country: String
    let providers: [ProviderAvailability]
    let lastCheckedAt: String
}

struct PersonSearchResult: Codable, Identifiable, Hashable {
    let personId: Int
    let name: String
    let profileUrl: String?
    let knownForDepartment: String?
    let knownForTitles: [String]

    var id: Int { personId }
}
