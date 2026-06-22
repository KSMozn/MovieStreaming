import SwiftUI

enum Theme {
    static let bg = Color(red: 0.04, green: 0.05, blue: 0.07)
    static let surface = Color(red: 0.08, green: 0.10, blue: 0.13)
    static let surface2 = Color(red: 0.12, green: 0.14, blue: 0.18)
    static let border = Color.white.opacity(0.08)
    static let accent = Color(red: 0.98, green: 0.78, blue: 0.13)
    static let textPrimary = Color.white
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
