import SwiftUI

/// Mirrors the web /person/[personId] page: profile, bio, filmography grid.
struct PersonView: View {
    let personId: Int

    @State private var vm = PersonViewModel()

    private let columns = [
        GridItem(.flexible(), spacing: 10),
        GridItem(.flexible(), spacing: 10),
        GridItem(.flexible(), spacing: 10)
    ]

    var body: some View {
        ZStack {
            Theme.bg.ignoresSafeArea()

            ScrollView {
                if let p = vm.person {
                    VStack(alignment: .leading, spacing: 16) {
                        header(p)
                        if !p.biography.isEmpty {
                            Text(p.biography)
                                .font(.system(size: 14))
                                .foregroundStyle(Theme.textSecondary)
                        }
                        filmography(p)
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 24)
                } else if vm.isLoading {
                    ProgressView().tint(Theme.accent)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 60)
                } else if let msg = vm.errorMessage {
                    Text(msg)
                        .font(.footnote)
                        .foregroundStyle(.red)
                        .padding()
                }
            }
        }
        .navigationTitle(vm.person?.name ?? "")
        .navigationBarTitleDisplayMode(.inline)
        .navigationDestination(for: PersonCredit.self) { c in
            DetailView(
                tmdbId: c.tmdbId,
                mediaType: c.mediaType,
                prefetched: DiscoverResult(
                    tmdbId: c.tmdbId,
                    mediaType: c.mediaType,
                    title: c.title,
                    releaseYear: c.releaseYear,
                    posterUrl: c.posterUrl,
                    voteAverage: c.voteAverage,
                    voteCount: nil
                )
            )
        }
        .task {
            await vm.load(personId: personId)
        }
    }

    private func header(_ p: Person) -> some View {
        HStack(alignment: .top, spacing: 16) {
            RemoteImage(urlString: p.profileUrl)
                .frame(width: 120, height: 180)
                .clipShape(RoundedRectangle(cornerRadius: Theme.cornerRadius))

            VStack(alignment: .leading, spacing: 4) {
                Text(p.name)
                    .font(.system(size: 22, weight: .bold))
                    .foregroundStyle(Theme.textPrimary)
                if let d = p.knownForDepartment {
                    infoLine("Known for", d)
                }
                if let born = lifespanLine(p) {
                    infoLine("Born", born)
                }
                if let from = p.placeOfBirth {
                    infoLine("From", from)
                }
                if let imdb = p.imdbId,
                   let url = URL(string: "https://www.imdb.com/name/\(imdb)/") {
                    Link(destination: url) {
                        Text("IMDb · View on IMDb ↗")
                            .font(.system(size: 12, weight: .semibold))
                            .padding(.horizontal, 10)
                            .padding(.vertical, 4)
                            .background(Theme.accent)
                            .foregroundStyle(Theme.bg)
                            .clipShape(RoundedRectangle(cornerRadius: 6))
                    }
                    .padding(.top, 4)
                }
            }
            Spacer()
        }
        .padding(.top, 8)
    }

    private func infoLine(_ label: String, _ value: String) -> some View {
        HStack(alignment: .top, spacing: 4) {
            Text("\(label):").foregroundStyle(Theme.textMuted)
            Text(value).foregroundStyle(Theme.textSecondary)
        }
        .font(.system(size: 13))
    }

    private func filmography(_ p: Person) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            (Text("Filmography ")
                + Text("(\(p.credits.count))").foregroundStyle(Theme.textMuted))
                .font(.headline)
                .foregroundStyle(Theme.textPrimary)

            if p.credits.isEmpty {
                Text("No credits found.")
                    .font(.footnote)
                    .foregroundStyle(Theme.textSecondary)
            } else {
                LazyVGrid(columns: columns, spacing: 14) {
                    ForEach(p.credits) { c in
                        NavigationLink(value: c) {
                            creditCard(c)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    private func creditCard(_ c: PersonCredit) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            ZStack(alignment: .topLeading) {
                RemoteImage(urlString: c.posterUrl)
                    .aspectRatio(2/3, contentMode: .fit)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.cardCornerRadius))
                Text(c.mediaType == .tv ? "TV" : "MOVIE")
                    .font(.system(size: 8, weight: .bold))
                    .tracking(0.5)
                    .padding(.horizontal, 4).padding(.vertical, 1)
                    .background(c.mediaType == .tv ? Color.green.opacity(0.85) : Color.blue.opacity(0.85))
                    .foregroundStyle(Theme.bg)
                    .clipShape(Capsule())
                    .padding(4)
            }
            Text(c.title)
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(Theme.textPrimary)
                .lineLimit(2)
            Text(c.releaseYear ?? "—")
                .font(.system(size: 10))
                .foregroundStyle(Theme.textMuted)
            if let ch = c.character, !ch.isEmpty {
                Text("as \(ch)")
                    .font(.system(size: 10))
                    .italic()
                    .foregroundStyle(Theme.textMuted)
                    .lineLimit(1)
            }
        }
    }

    /// Same age/lifespan math as the web person page.
    private func lifespanLine(_ p: Person) -> String? {
        guard let birthday = p.birthday else { return nil }
        let fmt = DateFormatter()
        fmt.dateFormat = "yyyy-MM-dd"
        guard let birth = fmt.date(from: birthday) else { return birthday }
        let end = p.deathday.flatMap { fmt.date(from: $0) } ?? Date()
        let years = Calendar.current.dateComponents([.year], from: birth, to: end).year ?? 0
        if let deathday = p.deathday {
            return "\(birthday) – \(deathday) (aged \(years))"
        }
        return "\(birthday) (age \(years))"
    }
}
