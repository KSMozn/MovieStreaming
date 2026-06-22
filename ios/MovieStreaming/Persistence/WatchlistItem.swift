import Foundation
import SwiftData

@Model
final class WatchlistItem {
    @Attribute(.unique) var compositeKey: String
    var tmdbId: Int
    var mediaTypeRaw: String
    var title: String
    var releaseYear: String?
    var posterUrl: String?
    var addedAt: Date

    init(tmdbId: Int, mediaType: MediaType, title: String, releaseYear: String?, posterUrl: String?) {
        self.tmdbId = tmdbId
        self.mediaTypeRaw = mediaType.rawValue
        self.compositeKey = "\(mediaType.rawValue)-\(tmdbId)"
        self.title = title
        self.releaseYear = releaseYear
        self.posterUrl = posterUrl
        self.addedAt = Date()
    }

    var mediaType: MediaType {
        MediaType(rawValue: mediaTypeRaw) ?? .movie
    }
}

extension WatchlistItem {
    convenience init(from r: DiscoverResult) {
        self.init(
            tmdbId: r.tmdbId,
            mediaType: r.mediaType,
            title: r.title,
            releaseYear: r.releaseYear,
            posterUrl: r.posterUrl
        )
    }

    convenience init(from d: MovieDetails) {
        self.init(
            tmdbId: d.tmdbId,
            mediaType: d.mediaType,
            title: d.title,
            releaseYear: d.releaseDate.flatMap { String($0.prefix(4)) },
            posterUrl: d.posterUrl
        )
    }
}
