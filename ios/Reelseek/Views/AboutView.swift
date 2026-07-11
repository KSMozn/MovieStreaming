import SwiftUI

struct AboutView: View {
    @Environment(\.dismiss) private var dismiss

    private var appVersion: String {
        let v = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
        let b = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
        return "v\(v) (\(b))"
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 22) {
                    header

                    section(title: "About") {
                        Text("ReelSeek helps you find where to watch any movie or TV show in your country, with ratings, cast, and live availability across major streaming providers.")
                            .foregroundStyle(Theme.textSecondary)
                    }

                    section(title: "Data sources") {
                        attributionRow(
                            name: "The Movie Database (TMDb)",
                            blurb: "Title metadata, ratings, cast, posters, and streaming-provider mappings.",
                            link: URL(string: "https://www.themoviedb.org/")
                        )
                        Divider().background(Theme.border)
                        attributionRow(
                            name: "OMDb",
                            blurb: "IMDb ratings.",
                            link: URL(string: "https://www.omdbapi.com/")
                        )
                        Divider().background(Theme.border)
                        attributionRow(
                            name: "Watchmode",
                            blurb: "Supplemental streaming availability data.",
                            link: URL(string: "https://watchmode.com/")
                        )
                    }

                    section(title: "Required notice") {
                        Text("This product uses the TMDb API but is not endorsed or certified by TMDb.")
                            .font(.footnote)
                            .foregroundStyle(Theme.textSecondary)
                            .padding(10)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Theme.surface2)
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                    }

                    section(title: "Privacy") {
                        VStack(alignment: .leading, spacing: 8) {
                            bullet("No account, no sign-in, no analytics, no third-party SDKs.")
                            bullet("Your watchlist is stored only on this device.")
                            bullet("Search queries go to our own server, which proxies TMDb. We do not retain personal data.")
                        }
                        if let url = URL(string: "https://ksmozn.github.io/MovieStreaming/privacy") {
                            Link(destination: url) {
                                Label("Full privacy policy", systemImage: "arrow.up.right.square")
                                    .font(.footnote)
                            }
                            .padding(.top, 4)
                        }
                    }

                    section(title: "Version") {
                        Text(appVersion).foregroundStyle(Theme.textSecondary)
                    }
                }
                .padding(20)
            }
            .background(Theme.bg)
            .navigationTitle("About")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }

    private var header: some View {
        HStack(spacing: 14) {
            Image(systemName: "play.tv.fill")
                .font(.system(size: 36))
                .foregroundStyle(Theme.accent)
                .frame(width: 64, height: 64)
                .background(Theme.surface2)
                .clipShape(RoundedRectangle(cornerRadius: 14))
            VStack(alignment: .leading, spacing: 2) {
                Text("ReelSeek")
                    .font(.title2).bold()
                    .foregroundStyle(Theme.textPrimary)
                Text("Find what to watch.")
                    .font(.footnote)
                    .foregroundStyle(Theme.textSecondary)
            }
            Spacer()
        }
    }

    private func section<Content: View>(
        title: String,
        @ViewBuilder content: () -> Content
    ) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title.uppercased())
                .font(.system(size: 11, weight: .semibold))
                .tracking(1.2)
                .foregroundStyle(Theme.textMuted)
            content()
        }
    }

    private func attributionRow(name: String, blurb: String, link: URL?) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            if let link {
                Link(destination: link) {
                    HStack(spacing: 4) {
                        Text(name).font(.system(size: 15, weight: .semibold))
                        Image(systemName: "arrow.up.right.square").font(.caption)
                    }
                    .foregroundStyle(Theme.textPrimary)
                }
            } else {
                Text(name)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(Theme.textPrimary)
            }
            Text(blurb)
                .font(.footnote)
                .foregroundStyle(Theme.textSecondary)
        }
    }

    private func bullet(_ s: String) -> some View {
        HStack(alignment: .top, spacing: 6) {
            Text("•").foregroundStyle(Theme.textMuted)
            Text(s).foregroundStyle(Theme.textSecondary)
        }
        .font(.footnote)
    }
}
