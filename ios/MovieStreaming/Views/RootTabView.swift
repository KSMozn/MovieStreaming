import SwiftUI

struct RootTabView: View {
    var body: some View {
        TabView {
            NavigationStack {
                HomeView()
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
