import SwiftUI
import WebKit

// Inline trailer player. The TMDb-provided YouTube trailer is embedded through
// the privacy-enhanced no-cookie player.
//
// It must be loaded as an <iframe> inside an HTML document with a real https
// baseURL (and a matching `origin` param), NOT by navigating the web view
// straight to the /embed URL — YouTube rejects an origin-less top-level embed
// with "Video player configuration error (153)". loadHTMLString(baseURL:)
// gives the document the reelseek.co origin so playback is authorised.
struct TrailerPlayerView: UIViewRepresentable {
    let youtubeKey: String

    private static let origin = "https://reelseek.co"

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.scrollView.isScrollEnabled = false
        webView.isOpaque = false
        webView.backgroundColor = .black

        let src =
            "https://www.youtube-nocookie.com/embed/\(youtubeKey)" +
            "?playsinline=1&autoplay=1&rel=0&modestbranding=1&origin=\(Self.origin)"
        let html = """
        <!DOCTYPE html><html><head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
        <style>*{margin:0;padding:0}html,body{background:#000;height:100%;overflow:hidden}iframe{border:0;width:100%;height:100%}</style>
        </head><body>
        <iframe src="\(src)" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
        </body></html>
        """
        webView.loadHTMLString(html, baseURL: URL(string: Self.origin))
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}
}
