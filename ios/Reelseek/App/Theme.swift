import SwiftUI

// Official ReelSeek palette — mirrors the web brand tokens in src/app/globals.css.
enum Theme {
    // #0d1b2a Deep Navy
    static let bg = Color(red: 0x0d/255, green: 0x1b/255, blue: 0x2a/255)
    // #222831 Charcoal
    static let surface = Color(red: 0x22/255, green: 0x28/255, blue: 0x31/255)
    // #2b3440 derived elevated
    static let surface2 = Color(red: 0x2b/255, green: 0x34/255, blue: 0x40/255)
    // #364252 derived border
    static let border = Color(red: 0x36/255, green: 0x42/255, blue: 0x52/255)
    // #f5a623 Warm Amber
    static let accent = Color(red: 0xf5/255, green: 0xa6/255, blue: 0x23/255)
    // #f7f8fa Light Neutral
    static let textPrimary = Color(red: 0xf7/255, green: 0xf8/255, blue: 0xfa/255)
    static let textSecondary = Color.white.opacity(0.65)
    static let textMuted = Color.white.opacity(0.42)

    static let cornerRadius: CGFloat = 12
    static let cardCornerRadius: CGFloat = 10
}

extension View {
    func cardStyle() -> some View {
        background(Theme.surface)
            .overlay(
                RoundedRectangle(cornerRadius: Theme.cardCornerRadius)
                    .stroke(Theme.border, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: Theme.cardCornerRadius))
    }
}
