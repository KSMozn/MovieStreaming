// Generates a placeholder 1024x1024 App Store icon.
// Run with: swift scripts/make_app_icon.swift
// Output:   MovieStreaming/Resources/Assets.xcassets/AppIcon.appiconset/icon-1024.png

import AppKit
import CoreGraphics

let size = 1024
let outDir = "MovieStreaming/Resources/Assets.xcassets/AppIcon.appiconset"
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

// Background gradient — dark navy → deep purple (matches app dark theme)
let topColor    = CGColor(red: 0.06, green: 0.07, blue: 0.10, alpha: 1)
let bottomColor = CGColor(red: 0.18, green: 0.10, blue: 0.28, alpha: 1)
guard let gradient = CGGradient(
    colorsSpace: cs,
    colors: [topColor, bottomColor] as CFArray,
    locations: [0, 1]
) else { fatalError("gradient") }
ctx.drawLinearGradient(
    gradient,
    start: CGPoint(x: 0, y: CGFloat(size)),
    end:   CGPoint(x: CGFloat(size), y: 0),
    options: []
)

// Soft amber glow behind the play triangle
let glowColor = CGColor(red: 0.98, green: 0.78, blue: 0.13, alpha: 0.18)
ctx.setFillColor(glowColor)
let glowRect = CGRect(x: 220, y: 220, width: 584, height: 584)
ctx.fillEllipse(in: glowRect)

// Filmstrip sprocket holes — two columns down each side
let holeColor = CGColor(red: 1, green: 1, blue: 1, alpha: 0.06)
ctx.setFillColor(holeColor)
let holeW: CGFloat = 70
let holeH: CGFloat = 50
let holeGap: CGFloat = 110
let leftX: CGFloat  = 60
let rightX: CGFloat = CGFloat(size) - 60 - holeW
for i in 0..<8 {
    let y = 80 + CGFloat(i) * holeGap
    ctx.fill(CGRect(x: leftX,  y: y, width: holeW, height: holeH))
    ctx.fill(CGRect(x: rightX, y: y, width: holeW, height: holeH))
}

// Play triangle — bold, amber, centered
let amber = CGColor(red: 0.98, green: 0.78, blue: 0.13, alpha: 1)
ctx.setFillColor(amber)
let triPath = CGMutablePath()
let cx: CGFloat = 512
let cy: CGFloat = 512
let radius: CGFloat = 230
triPath.move(to:    CGPoint(x: cx + radius,        y: cy))
triPath.addLine(to: CGPoint(x: cx - radius * 0.5,  y: cy + radius * 0.866))
triPath.addLine(to: CGPoint(x: cx - radius * 0.5,  y: cy - radius * 0.866))
triPath.closeSubpath()
ctx.addPath(triPath)
ctx.fillPath()

guard let img = ctx.makeImage() else { fatalError("makeImage") }
let rep = NSBitmapImageRep(cgImage: img)
guard let png = rep.representation(using: .png, properties: [:]) else { fatalError("png") }

let fm = FileManager.default
try? fm.createDirectory(atPath: outDir, withIntermediateDirectories: true)
try png.write(to: URL(fileURLWithPath: outPath))
print("Wrote \(outPath) (\(png.count) bytes)")
