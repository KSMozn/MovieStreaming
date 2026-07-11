import Foundation
import Observation

@Observable
@MainActor
final class PersonViewModel {
    var person: Person?
    var isLoading = false
    var errorMessage: String?

    func load(personId: Int) async {
        guard person?.personId != personId else { return }
        isLoading = true
        defer { isLoading = false }
        do {
            person = try await MovieAPI.person(personId)
            errorMessage = nil
        } catch {
            errorMessage = (error as? LocalizedError)?.errorDescription ?? error.localizedDescription
        }
    }
}
