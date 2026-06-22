import SwiftUI

struct RemoteImage: View {
    let urlString: String?
    var contentMode: ContentMode = .fill

    var body: some View {
        if let s = urlString, let url = URL(string: s) {
            AsyncImage(url: url) { phase in
                switch phase {
                case .empty:
                    ZStack {
                        Theme.surface2
                        ProgressView().tint(Theme.textMuted)
                    }
                case .success(let img):
                    img.resizable().aspectRatio(contentMode: contentMode)
                case .failure:
                    placeholder
                @unknown default:
                    placeholder
                }
            }
        } else {
            placeholder
        }
    }

    private var placeholder: some View {
        ZStack {
            Theme.surface2
            Image(systemName: "film")
                .font(.title2)
                .foregroundStyle(Theme.textMuted)
        }
    }
}
