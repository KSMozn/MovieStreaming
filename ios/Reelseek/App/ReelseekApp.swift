import SwiftUI
import SwiftData

@main
struct ReelseekApp: App {
    var body: some Scene {
        WindowGroup {
            RootTabView()
                .preferredColorScheme(.dark)
                .tint(Theme.accent)
        }
        .modelContainer(for: [WatchlistItem.self, RecentItem.self])
    }
}
