import Foundation

enum APIConfig {
    static let baseURL: URL = {
        if let s = Bundle.main.object(forInfoDictionaryKey: "APIBaseURL") as? String,
           let url = URL(string: s) {
            return url
        }
        return URL(string: "https://reelseek.co")!
    }()

    /// Same fixed list as the website (src/lib/site.ts).
    static let countries: [(code: String, label: String)] = [
        ("EG", "Egypt"),
        ("SA", "Saudi Arabia"),
        ("AE", "United Arab Emirates"),
        ("US", "United States"),
        ("GB", "United Kingdom"),
        ("CA", "Canada")
    ]

    static let fallbackCountry = "EG"

    /// The country to start on: the device's region when ReelSeek supports it,
    /// otherwise Egypt. Mirrors the website's geo default (CF-IPCountry).
    static var defaultCountry: String {
        if let region = Locale.current.region?.identifier,
           countries.contains(where: { $0.code == region }) {
            return region
        }
        return fallbackCountry
    }
}
