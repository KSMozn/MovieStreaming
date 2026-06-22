// Generates the App Store icon at 1024x1024.
// Run with: swift scripts/make_app_icon.swift
// Output:   Reelseek/Resources/Assets.xcassets/AppIcon.appiconset/icon-1024.png
//
// Design: dark aurora gradient (navy → indigo → magenta hint) with a bold
// rounded-corner play triangle in amber, lifted off the background by a soft
// amber radial backlight. A small sparkle nods at the "find / discover" theme.

import AppKit
import CoreGraphics

let size = 1024
let outDir = "Reelseek/Resources/Assets.xcassets/AppIcon.appiconset"
let outPath = "\(outDir)/icon-1024.png"

let cs = CGColorSpaceCreateDeviceRGB()
guard let ctx = CGContext(
    data: nil,
    width: size, height: size,
    bitsPerComponent: 8,
    bytesPerRow: 0,
    space: cs,
    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
) else { fatalError("ctx") }

func color(_ r: CGFloat, _ g: CGFloat, _ b: CGFloat, _ a: CGFloat = 1) -> CGColor {
    CGColor(red: r, green: g, blue: b, alpha: a)
}

// ---------- Background: 3-stop diagonal gradient ----------
let bgGrad = CGGradient(
    colorsSpace: cs,
    colors: [
        color(0.04, 0.05, 0.10),         // top-left, near-black navy
        color(0.18, 0.10, 0.32),         // mid, deep indigo
        color(0.31, 0.10, 0.36)          // bottom-right, plum
    ] as CFArray,
    locations: [0.0, 0.55, 1.0]
)!
ctx.drawLinearGradient(
    bgGrad,
    start: CGPoint(x: 0, y: CGFloat(size)),
    end:   CGPoint(x: CGFloat(size), y: 0),
    options: []
)

// ---------- Aurora highlight: soft pink-magenta blob in top-right ----------
let aurora = CGGradient(
    colorsSpace: cs,
    colors: [
        color(1.0, 0.45, 0.65, 0.22),
        color(1.0, 0.45, 0.65, 0.0)
    ] as CFArray,
    locations: [0, 1]
)!
ctx.drawRadialGradient(
    aurora,
    startCenter: CGPoint(x: 820, y: 880), startRadius: 0,
    endCenter:   CGPoint(x: 820, y: 880), endRadius: 520,
    options: []
)

// ---------- Soft amber backlight behind the play triangle ----------
let backlight = CGGradient(
    colorsSpace: cs,
    colors: [
        color(0.98, 0.78, 0.13, 0.30),
        color(0.98, 0.78, 0.13, 0.0)
    ] as CFArray,
    locations: [0, 1]
)!
ctx.drawRadialGradient(
    backlight,
    startCenter: CGPoint(x: 512, y: 512), startRadius: 0,
    endCenter:   CGPoint(x: 512, y: 512), endRadius: 360,
    options: []
)

// ---------- Play triangle (rounded corners, amber) ----------
let amber       = color(0.99, 0.80, 0.16)
let amberDark   = color(0.86, 0.65, 0.10)

let cx: CGFloat = 512
let cy: CGFloat = 512
let r:  CGFloat = 260

// Equilateral-triangle vertices, pointing right
let pTip   = CGPoint(x: cx + r,            y: cy)
let pTopLt = CGPoint(x: cx - r * 0.5,      y: cy + r * 0.866)
let pBotLt = CGPoint(x: cx - r * 0.5,      y: cy - r * 0.866)

// Hand-roll rounded triangle with arcs at each corner
let cornerR: CGFloat = 46
let triPath = CGMutablePath()

func addRoundedCorner(_ path: CGMutablePath,
                      from a: CGPoint, corner b: CGPoint, to c: CGPoint,
                      radius: CGFloat) {
    if path.isEmpty {
        let dirIn = CGVector(dx: a.x - b.x, dy: a.y - b.y)
        let len = sqrt(dirIn.dx*dirIn.dx + dirIn.dy*dirIn.dy)
        let nx = dirIn.dx / len
        let ny = dirIn.dy / len
        path.move(to: CGPoint(x: b.x + nx * radius, y: b.y + ny * radius))
    }
    path.addArc(tangent1End: b, tangent2End: c, radius: radius)
}

addRoundedCorner(triPath, from: pBotLt, corner: pTip,   to: pTopLt, radius: cornerR)
addRoundedCorner(triPath, from: pTip,   corner: pTopLt, to: pBotLt, radius: cornerR)
addRoundedCorner(triPath, from: pTopLt, corner: pBotLt, to: pTip,   radius: cornerR)
triPath.closeSubpath()

// Subtle drop shadow under the triangle
ctx.saveGState()
ctx.setShadow(offset: CGSize(width: 0, height: -14),
              blur: 28,
              color: color(0, 0, 0, 0.45))
ctx.setFillColor(amberDark)
ctx.addPath(triPath)
ctx.fillPath()
ctx.restoreGState()

// Triangle gradient fill (amber, slightly lighter on top)
let triGrad = CGGradient(
    colorsSpace: cs,
    colors: [
        color(1.00, 0.86, 0.30),
        color(0.97, 0.74, 0.08)
    ] as CFArray,
    locations: [0, 1]
)!
ctx.saveGState()
ctx.addPath(triPath)
ctx.clip()
ctx.drawLinearGradient(
    triGrad,
    start: CGPoint(x: cx, y: cy + r),
    end:   CGPoint(x: cx, y: cy - r),
    options: []
)
ctx.restoreGState()

// Specular highlight along the top edge of the triangle
ctx.saveGState()
ctx.addPath(triPath)
ctx.clip()
let highlight = CGGradient(
    colorsSpace: cs,
    colors: [
        color(1, 1, 1, 0.35),
        color(1, 1, 1, 0.0)
    ] as CFArray,
    locations: [0, 1]
)!
ctx.drawLinearGradient(
    highlight,
    start: CGPoint(x: cx - 80, y: cy + r * 0.6),
    end:   CGPoint(x: cx - 80, y: cy),
    options: []
)
ctx.restoreGState()

// ---------- Sparkle in the upper area (nod at "find / discover") ----------
let sparkleColor = color(1, 1, 1, 0.92)
ctx.setFillColor(sparkleColor)
func drawSparkle(at p: CGPoint, sizeAcross: CGFloat) {
    let s = sizeAcross / 2
    let path = CGMutablePath()
    path.move(to: CGPoint(x: p.x, y: p.y + s))
    path.addQuadCurve(to: CGPoint(x: p.x + s, y: p.y), control: CGPoint(x: p.x + s*0.18, y: p.y + s*0.18))
    path.addQuadCurve(to: CGPoint(x: p.x, y: p.y - s), control: CGPoint(x: p.x + s*0.18, y: p.y - s*0.18))
    path.addQuadCurve(to: CGPoint(x: p.x - s, y: p.y), control: CGPoint(x: p.x - s*0.18, y: p.y - s*0.18))
    path.addQuadCurve(to: CGPoint(x: p.x, y: p.y + s), control: CGPoint(x: p.x - s*0.18, y: p.y + s*0.18))
    path.closeSubpath()
    ctx.addPath(path)
    ctx.fillPath()
}

drawSparkle(at: CGPoint(x: 240, y: 780), sizeAcross: 70)   // big sparkle, upper-left
drawSparkle(at: CGPoint(x: 360, y: 870), sizeAcross: 36)   // small companion
drawSparkle(at: CGPoint(x: 820, y: 200), sizeAcross: 44)   // bottom-right small sparkle

// ---------- Write PNG ----------
guard let img = ctx.makeImage() else { fatalError("makeImage") }
let rep = NSBitmapImageRep(cgImage: img)
guard let png = rep.representation(using: .png, properties: [:]) else { fatalError("png") }

let fm = FileManager.default
try? fm.createDirectory(atPath: outDir, withIntermediateDirectories: true)
try png.write(to: URL(fileURLWithPath: outPath))
print("Wrote \(outPath) (\(png.count) bytes)")
