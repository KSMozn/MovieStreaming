import SwiftUI

struct RootTabView: View {
    @State private var homePath = NavigationPath()

    var body: some View {
        TabView {
            NavigationStack(path: $homePath) {
                HomeView(path: $homePath)
            }
            .tabItem { Label("Home", systemImage: "house.fill") }

            NavigationStack {
                SearchView()
            }
            .tabItem { Label("Search", systemImage: "magnifyingglass") }

            NavigationStack {
                WatchlistView()
            }
            .tabItem { Label("Watchlist", systemImage: "bookmark.fill") }
        }
        .tint(Theme.accent)
        .background(Theme.bg.ignoresSafeArea())
    }
}
