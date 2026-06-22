import Foundation

enum APIError: LocalizedError {
    case badStatus(Int, String)
    case decoding(Error)
    case transport(Error)
    case invalidURL

    var errorDescription: String? {
        switch self {
        case let .badStatus(code, msg): return "Server returned \(code): \(msg)"
        case let .decoding(e):          return "Could not decode response: \(e.localizedDescription)"
        case let .transport(e):         return "Network error: \(e.localizedDescription)"
        case .invalidURL:               return "Bad URL"
        }
    }
}

actor APIClient {
    static let shared = APIClient()

    private let session: URLSession
    private let decoder: JSONDecoder

    init() {
        let cfg = URLSessionConfiguration.default
        cfg.timeoutIntervalForRequest = 20
        cfg.timeoutIntervalForResource = 30
        cfg.waitsForConnectivity = true
        self.session = URLSession(configuration: cfg)
        self.decoder = JSONDecoder()
    }

    func get<T: Decodable>(_ path: String, query: [String: String?] = [:]) async throws -> T {
        guard var comps = URLComponents(url: APIConfig.baseURL.appendingPathComponent(path),
                                        resolvingAgainstBaseURL: false) else {
            throw APIError.invalidURL
        }
        let items = query.compactMap { (k, v) -> URLQueryItem? in
            guard let v, !v.isEmpty else { return nil }
            return URLQueryItem(name: k, value: v)
        }
        if !items.isEmpty { comps.queryItems = items }
        guard let url = comps.url else { throw APIError.invalidURL }

        var req = URLRequest(url: url)
        req.setValue("application/json", forHTTPHeaderField: "Accept")

        do {
            let (data, resp) = try await session.data(for: req)
            guard let http = resp as? HTTPURLResponse else {
                throw APIError.badStatus(-1, "no response")
            }
            guard (200..<300).contains(http.statusCode) else {
                let body = String(data: data, encoding: .utf8) ?? ""
                throw APIError.badStatus(http.statusCode, body)
            }
            do {
                return try decoder.decode(T.self, from: data)
            } catch {
                throw APIError.decoding(error)
            }
        } catch let e as APIError {
            throw e
        } catch {
            throw APIError.transport(error)
        }
    }
}
