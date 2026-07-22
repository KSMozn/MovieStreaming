import Foundation

struct CastMember: Codable, Identifiable, Hashable {
    let personId: Int
    let name: String
    let character: String?
    let profileUrl: String?

    var id: Int { personId }
}

// Official trailer from TMDb's curated feed, embedded via YouTube's
// privacy-enhanced no-cookie player. Optional — many titles have none.
struct Trailer: Codable, Hashable {
    let site: String
    let key: String
    let name: String
    let url: String
    let embedUrl: String
    let thumbnailUrl: String
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
    let trailer: Trailer?
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

// Per-country theatrical status derived from TMDb release dates (movies only).
struct Theatrical: Codable, Hashable {
    let status: String   // "now" | "upcoming" | "none"
    let inTheaters: Bool
    let releaseDate: String?
    let certification: String?
}

struct Availability: Codable {
    let country: String
    let providers: [ProviderAvailability]
    let lastCheckedAt: String
    let theatrical: Theatrical?
}

struct PersonSearchResult: Codable, Identifiable, Hashable {
    let personId: Int
    let name: String
    let profileUrl: String?
    let knownForDepartment: String?
    let knownForTitles: [String]

    var id: Int { personId }
}

struct PersonCredit: Codable, Identifiable, Hashable {
    let tmdbId: Int
    let mediaType: MediaType
    let title: String
    let character: String?
    let releaseYear: String?
    let releaseDate: String?
    let posterUrl: String?
    let voteAverage: Double?
    let popularity: Double

    var id: String { "\(mediaType.rawValue)-\(tmdbId)" }
}

struct Person: Codable {
    let personId: Int
    let name: String
    let imdbId: String?
    let biography: String
    let birthday: String?
    let deathday: String?
    let placeOfBirth: String?
    let knownForDepartment: String?
    let profileUrl: String?
    let credits: [PersonCredit]
}
