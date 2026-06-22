import SwiftUI

struct PosterCard: View {
    let result: DiscoverResult

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            ZStack(alignment: .topLeading) {
                RemoteImage(urlString: result.posterUrl)
                    .aspectRatio(2/3, contentMode: .fit)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.cardCornerRadius))

                HStack(spacing: 4) {
                    Text(result.mediaType == .tv ? "TV" : "MOVIE")
                        .font(.system(size: 9, weight: .bold))
                        .tracking(0.5)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(result.mediaType == .tv ? Color.green.opacity(0.85) : Color.blue.opacity(0.85))
                        .foregroundStyle(Theme.bg)
                        .clipShape(Capsule())
                    Spacer()
                }
                .padding(6)

                if let v = result.voteAverage {
                    HStack {
                        Spacer()
                        HStack(spacing: 2) {
                            Image(systemName: "star.fill").font(.system(size: 8))
                            Text(String(format: "%.1f", v))
                                .font(.system(size: 10, weight: .bold))
                        }
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Theme.bg.opacity(0.8))
                        .foregroundStyle(Theme.accent)
                        .clipShape(Capsule())
                        .overlay(Capsule().stroke(Theme.border, lineWidth: 0.5))
                    }
                    .padding(6)
                }
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(result.title)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(Theme.textPrimary)
                    .lineLimit(2)
                Text(result.releaseYear ?? "—")
                    .font(.system(size: 10))
                    .foregroundStyle(Theme.textMuted)
            }
        }
    }
}
