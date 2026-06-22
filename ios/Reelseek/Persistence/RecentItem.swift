import Foundation
import SwiftData

@Model
final class RecentItem {
    @Attribute(.unique) var compositeKey: String
    var tmdbId: Int
    var mediaTypeRaw: String
    var title: String
    var posterUrl: String?
    var releaseYear: String?
    var viewedAt: Date

    init(tmdbId: Int, mediaType: MediaType, title: String, posterUrl: String?, releaseYear: String?) {
        self.tmdbId = tmdbId
        self.mediaTypeRaw = mediaType.rawValue
        self.compositeKey = "\(mediaType.rawValue)-\(tmdbId)"
        self.title = title
        self.posterUrl = posterUrl
        self.releaseYear = releaseYear
        self.viewedAt = Date()
    }

    var mediaType: MediaType {
        MediaType(rawValue: mediaTypeRaw) ?? .movie
    }
}

extension RecentItem {
    static func touch(
        context: ModelContext,
        tmdbId: Int,
        mediaType: MediaType,
        title: String,
        posterUrl: String?,
        releaseYear: String?,
        maxItems: Int = 20
    ) {
        let key = "\(mediaType.rawValue)-\(tmdbId)"
        let pred = #Predicate<RecentItem> { $0.compositeKey == key }
        let descriptor = FetchDescriptor<RecentItem>(predicate: pred)

        if let existing = try? context.fetch(descriptor).first {
            existing.viewedAt = Date()
            existing.title = title
            existing.posterUrl = posterUrl
            existing.releaseYear = releaseYear
        } else {
            context.insert(RecentItem(
                tmdbId: tmdbId, mediaType: mediaType,
                title: title, posterUrl: posterUrl, releaseYear: releaseYear
            ))
        }
        try? context.save()

        // Trim to maxItems most recent.
        var trim = FetchDescriptor<RecentItem>(
            sortBy: [SortDescriptor(\.viewedAt, order: .reverse)]
        )
        trim.fetchLimit = 200
        if let all = try? context.fetch(trim), all.count > maxItems {
            for stale in all.dropFirst(maxItems) {
                context.delete(stale)
            }
            try? context.save()
        }
    }
}
