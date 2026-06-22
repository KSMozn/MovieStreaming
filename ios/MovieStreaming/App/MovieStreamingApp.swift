import SwiftUI
import SwiftData

@main
struct MovieStreamingApp: App {
    var body: some Scene {
        WindowGroup {
            RootTabView()
                .preferredColorScheme(.dark)
                .tint(Theme.accent)
        }
        .modelContainer(for: [WatchlistItem.self])
    }
}
