import Foundation
import Observation

@Observable
@MainActor
final class HomeViewModel {
    var results: [DiscoverResult] = []
    var isLoading = false
    var errorMessage: String?

    func load() async {
        isLoading = true
        defer { isLoading = false }
        do {
            let resp = try await MovieAPI.trending()
            self.results = resp.results
            self.errorMessage = nil
        } catch {
            self.errorMessage = (error as? LocalizedError)?.errorDescription ?? error.localizedDescription
        }
    }
}
