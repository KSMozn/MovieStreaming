import Foundation

enum APIConfig {
    static let baseURL: URL = {
        if let s = Bundle.main.object(forInfoDictionaryKey: "APIBaseURL") as? String,
           let url = URL(string: s) {
            return url
        }
        return URL(string: "https://movie-streaming-150176375922.europe-west1.run.app")!
    }()

    static let defaultCountry = "EG"

    /// Same fixed list as the website (TitleDetails.tsx COUNTRIES).
    static let countries: [(code: String, label: String)] = [
        ("EG", "Egypt"),
        ("SA", "Saudi Arabia"),
        ("AE", "United Arab Emirates")
    ]
}
