import Foundation

enum SortKey: String, CaseIterable, Identifiable, Codable {
    case popularityDesc = "popularity.desc"
    case ratingDesc     = "rating.desc"
    case ratingAsc      = "rating.asc"
    case releaseDesc    = "release.desc"
    case releaseAsc     = "release.asc"
    case votesDesc      = "votes.desc"

    var id: String { rawValue }

    var label: String {
        switch self {
        case .popularityDesc: return "Most popular"
        case .ratingDesc:     return "Rating ↓ (high to low)"
        case .ratingAsc:      return "Rating ↑ (low to high)"
        case .releaseDesc:    return "Newest first"
        case .releaseAsc:     return "Oldest first"
        case .votesDesc:      return "Most voted"
        }
    }

    static let `default`: SortKey = .popularityDesc
}

enum MediaType: String, Codable, CaseIterable, Identifiable {
    case movie, tv
    var id: String { rawValue }
    var label: String { self == .tv ? "TV" : "Movie" }
}

enum MediaTypeFilter: String, CaseIterable, Identifiable {
    case both, movie, tv
    var id: String { rawValue }
    var label: String {
        switch self {
        case .both:  return "Both"
        case .movie: return "Movies"
        case .tv:    return "TV"
        }
    }
}
