import SwiftUI

// Exact match to the web Tailwind tokens in /tailwind.config.ts.
enum Theme {
    // #0b0d12
    static let bg = Color(red: 0x0b/255, green: 0x0d/255, blue: 0x12/255)
    // #141821
    static let surface = Color(red: 0x14/255, green: 0x18/255, blue: 0x21/255)
    // #1c2230
    static let surface2 = Color(red: 0x1c/255, green: 0x22/255, blue: 0x30/255)
    // #262d3d
    static let border = Color(red: 0x26/255, green: 0x2d/255, blue: 0x3d/255)
    // #f5c518 — IMDb yellow
    static let accent = Color(red: 0xf5/255, green: 0xc5/255, blue: 0x18/255)
    // #e6e8ee
    static let textPrimary = Color(red: 0xe6/255, green: 0xe8/255, blue: 0xee/255)
    static let textSecondary = Color.white.opacity(0.62)
    static let textMuted = Color.white.opacity(0.40)

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
