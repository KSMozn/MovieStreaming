import Foundation

enum ProviderKey: String, Codable, CaseIterable, Identifiable {
    case netflix
    case osn
    case amazon_prime_video
    case shahid
    case watch_it
    case tod
    case disney_plus
    case apple_tv_plus

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .netflix:            return "Netflix"
        case .osn:                return "OSN+"
        case .amazon_prime_video: return "Prime Video"
        case .shahid:             return "Shahid"
        case .watch_it:           return "Watch It"
        case .tod:                return "TOD"
        case .disney_plus:        return "Disney+"
        case .apple_tv_plus:      return "Apple TV+"
        }
    }

    /// SF Symbol used as a small visual badge when no remote logo is loaded.
    var sfSymbol: String {
        switch self {
        case .netflix:            return "play.rectangle.fill"
        case .osn:                return "sparkles.tv.fill"
        case .amazon_prime_video: return "cart.fill"
        case .shahid:             return "s.circle.fill"
        case .watch_it:           return "eye.fill"
        case .tod:                return "soccerball"
        case .disney_plus:        return "wand.and.stars"
        case .apple_tv_plus:      return "applelogo"
        }
    }
}

enum AvailabilityType: String, Codable {
    case subscription, free, rent, buy, ads, unknown
}
