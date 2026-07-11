import Foundation
import Observation

@Observable
@MainActor
final class DetailViewModel {
    var details: MovieDetails?
    var availability: Availability?
    var isLoading = false
    var errorMessage: String?

    func load(tmdbId: Int, mediaType: MediaType, country: String) async {
        isLoading = true
        defer { isLoading = false }
        do {
            async let d = MovieAPI.details(tmdbId: tmdbId, mediaType: mediaType)
            async let a = try? await MovieAPI.availability(
                tmdbId: tmdbId,
                mediaType: mediaType,
                country: country
            )
            self.details = try await d
            self.availability = await a
            self.errorMessage = nil
        } catch {
            self.errorMessage = (error as? LocalizedError)?.errorDescription ?? error.localizedDescription
        }
    }

    /// Country switch: details are unchanged, only availability moves.
    func reloadAvailability(tmdbId: Int, mediaType: MediaType, country: String) async {
        availability = try? await MovieAPI.availability(
            tmdbId: tmdbId,
            mediaType: mediaType,
            country: country
        )
    }
}
