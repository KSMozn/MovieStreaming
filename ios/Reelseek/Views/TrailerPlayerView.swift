import SwiftUI
import WebKit

// Inline trailer player. Loads the TMDb-provided YouTube trailer through the
// privacy-enhanced no-cookie embed (never an arbitrary third-party video URL).
// Autoplay/playsinline are appended here so playback starts when the sheet
// opens rather than on initial page render.
struct TrailerPlayerView: UIViewRepresentable {
    let embedUrl: String

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.scrollView.isScrollEnabled = false
        webView.isOpaque = false
        webView.backgroundColor = .black

        if var comps = URLComponents(string: embedUrl) {
            var items = comps.queryItems ?? []
            items.append(URLQueryItem(name: "autoplay", value: "1"))
            items.append(URLQueryItem(name: "playsinline", value: "1"))
            comps.queryItems = items
            if let url = comps.url {
                webView.load(URLRequest(url: url))
            }
        }
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}
}
