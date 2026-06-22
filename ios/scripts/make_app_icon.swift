// Generates the App Store icon at 1024x1024.
// Run with: swift scripts/make_app_icon.swift
// Output:   Reelseek/Resources/Assets.xcassets/AppIcon.appiconset/icon-1024.png
//
// Concept: "find what to watch". A magnifying glass with an amber play
// triangle inside its lens — combines discovery (the lens) with the
// universal language for video (the triangle) in one mark. Reads at
// 29x29 (Settings) up to 1024x1024 (App Store).

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

// ---------- Background: 3-stop diagonal gradient (matches app theme) ----------
let bgGrad = CGGradient(
    colorsSpace: cs,
    colors: [
        color(0.04, 0.05, 0.10),  // navy
        color(0.16, 0.10, 0.30),  // indigo
        color(0.30, 0.10, 0.36)   // plum
    ] as CFArray,
    locations: [0.0, 0.55, 1.0]
)!
ctx.drawLinearGradient(
    bgGrad,
    start: CGPoint(x: 0, y: CGFloat(size)),
    end:   CGPoint(x: CGFloat(size), y: 0),
    options: []
)

// Soft warm glow behind the lens
let glow = CGGradient(
    colorsSpace: cs,
    colors: [
        color(0.98, 0.78, 0.13, 0.22),
        color(0.98, 0.78, 0.13, 0.0)
    ] as CFArray,
    locations: [0, 1]
)!
ctx.drawRadialGradient(
    glow,
    startCenter: CGPoint(x: 460, y: 580), startRadius: 0,
    endCenter:   CGPoint(x: 460, y: 580), endRadius: 420,
    options: []
)

// ---------- Magnifying-glass handle ----------
// Drawn FIRST so the lens covers its inner end cleanly.
let handleColor = CGColor(red: 0xe6/255, green: 0xe8/255, blue: 0xee/255, alpha: 1)
let handleShadow = CGColor(red: 0, green: 0, blue: 0, alpha: 0.45)

// Handle goes from bottom-right of the lens out to lower-right of the canvas.
let handleStart = CGPoint(x: 690, y: 350)
let handleEnd   = CGPoint(x: 880, y: 160)
let handleWidth: CGFloat = 86

ctx.saveGState()
ctx.setShadow(offset: CGSize(width: 0, height: -12), blur: 20, color: handleShadow)
ctx.setStrokeColor(handleColor)
ctx.setLineCap(.round)
ctx.setLineWidth(handleWidth)
ctx.move(to: handleStart)
ctx.addLine(to: handleEnd)
ctx.strokePath()
ctx.restoreGState()

// Handle highlight (subtle gloss)
ctx.saveGState()
ctx.setStrokeColor(CGColor(red: 1, green: 1, blue: 1, alpha: 0.30))
ctx.setLineCap(.round)
ctx.setLineWidth(handleWidth * 0.30)
let highlightInset: CGFloat = 18
let dx = handleEnd.x - handleStart.x
let dy = handleEnd.y - handleStart.y
let len = sqrt(dx*dx + dy*dy)
let nx = dx / len
let ny = dy / len
// Perpendicular offset for the highlight line
let px = -ny
let py = nx
let offset: CGFloat = 14
ctx.move(to: CGPoint(x: handleStart.x + nx * highlightInset + px * offset,
                     y: handleStart.y + ny * highlightInset + py * offset))
ctx.addLine(to: CGPoint(x: handleEnd.x - nx * highlightInset + px * offset,
                        y: handleEnd.y - ny * highlightInset + py * offset))
ctx.strokePath()
ctx.restoreGState()

// ---------- Magnifying-glass lens (thick ring) ----------
let lensCx: CGFloat = 460
let lensCy: CGFloat = 580
let lensOuterR: CGFloat = 290
let ringThickness: CGFloat = 70
let lensInnerR = lensOuterR - ringThickness

// Outer ring (white with subtle gradient)
ctx.saveGState()
ctx.setShadow(offset: CGSize(width: 0, height: -16), blur: 28, color: handleShadow)
ctx.setFillColor(handleColor)
let outerPath = CGMutablePath()
outerPath.addEllipse(in: CGRect(
    x: lensCx - lensOuterR, y: lensCy - lensOuterR,
    width: lensOuterR * 2, height: lensOuterR * 2
))
outerPath.addEllipse(in: CGRect(
    x: lensCx - lensInnerR, y: lensCy - lensInnerR,
    width: lensInnerR * 2, height: lensInnerR * 2
))
ctx.addPath(outerPath)
ctx.fillPath(using: .evenOdd)
ctx.restoreGState()

// Subtle inner shadow on the ring's inside edge (depth)
ctx.saveGState()
ctx.addEllipse(in: CGRect(
    x: lensCx - lensInnerR, y: lensCy - lensInnerR,
    width: lensInnerR * 2, height: lensInnerR * 2
))
ctx.clip()
ctx.setShadow(offset: CGSize(width: 0, height: 6), blur: 14, color: CGColor(red: 0, green: 0, blue: 0, alpha: 0.40))
ctx.setStrokeColor(handleColor)
ctx.setLineWidth(2)
ctx.addEllipse(in: CGRect(
    x: lensCx - lensInnerR - 4, y: lensCy - lensInnerR - 4,
    width: (lensInnerR + 4) * 2, height: (lensInnerR + 4) * 2
))
ctx.strokePath()
ctx.restoreGState()

// Glass interior — very dark, hints at content space
ctx.saveGState()
ctx.addEllipse(in: CGRect(
    x: lensCx - lensInnerR, y: lensCy - lensInnerR,
    width: lensInnerR * 2, height: lensInnerR * 2
))
ctx.clip()

let glassGrad = CGGradient(
    colorsSpace: cs,
    colors: [
        color(0.10, 0.08, 0.18),
        color(0.02, 0.02, 0.05)
    ] as CFArray,
    locations: [0, 1]
)!
ctx.drawLinearGradient(
    glassGrad,
    start: CGPoint(x: lensCx, y: lensCy + lensInnerR),
    end:   CGPoint(x: lensCx, y: lensCy - lensInnerR),
    options: []
)
ctx.restoreGState()

// ---------- Play triangle inside the lens (amber) ----------
let triR: CGFloat = 110
let triCx = lensCx + 14   // visually shifted right so it feels centered with the handle pull
let triCy = lensCy

// Equilateral triangle, pointing right, rounded corners
let pTip   = CGPoint(x: triCx + triR,           y: triCy)
let pTopLt = CGPoint(x: triCx - triR * 0.5,     y: triCy + triR * 0.866)
let pBotLt = CGPoint(x: triCx - triR * 0.5,     y: triCy - triR * 0.866)
let triCornerR: CGFloat = 22

let triPath = CGMutablePath()
func addRoundedCorner(_ path: CGMutablePath,
                      from a: CGPoint, corner b: CGPoint, to c: CGPoint,
                      radius: CGFloat) {
    if path.isEmpty {
        let inX = a.x - b.x, inY = a.y - b.y
        let inL = sqrt(inX*inX + inY*inY)
        path.move(to: CGPoint(x: b.x + inX/inL * radius, y: b.y + inY/inL * radius))
    }
    path.addArc(tangent1End: b, tangent2End: c, radius: radius)
}
addRoundedCorner(triPath, from: pBotLt, corner: pTip,   to: pTopLt, radius: triCornerR)
addRoundedCorner(triPath, from: pTip,   corner: pTopLt, to: pBotLt, radius: triCornerR)
addRoundedCorner(triPath, from: pTopLt, corner: pBotLt, to: pTip,   radius: triCornerR)
triPath.closeSubpath()

// Triangle drop shadow
ctx.saveGState()
ctx.addEllipse(in: CGRect(
    x: lensCx - lensInnerR, y: lensCy - lensInnerR,
    width: lensInnerR * 2, height: lensInnerR * 2
))
ctx.clip()

ctx.saveGState()
ctx.setShadow(offset: CGSize(width: 0, height: -8), blur: 18, color: CGColor(red: 0, green: 0, blue: 0, alpha: 0.55))
ctx.setFillColor(CGColor(red: 0.80, green: 0.60, blue: 0.10, alpha: 1))
ctx.addPath(triPath)
ctx.fillPath()
ctx.restoreGState()

// Triangle gradient fill
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
    start: CGPoint(x: triCx, y: triCy + triR),
    end:   CGPoint(x: triCx, y: triCy - triR),
    options: []
)
ctx.restoreGState()

// Triangle specular highlight
ctx.saveGState()
ctx.addPath(triPath)
ctx.clip()
let triHi = CGGradient(
    colorsSpace: cs,
    colors: [
        color(1, 1, 1, 0.35),
        color(1, 1, 1, 0.0)
    ] as CFArray,
    locations: [0, 1]
)!
ctx.drawLinearGradient(
    triHi,
    start: CGPoint(x: triCx, y: triCy + triR * 0.7),
    end:   CGPoint(x: triCx, y: triCy),
    options: []
)
ctx.restoreGState()

ctx.restoreGState()  // end lens clip

// ---------- Specular gleam on the lens glass ----------
ctx.saveGState()
ctx.addEllipse(in: CGRect(
    x: lensCx - lensInnerR, y: lensCy - lensInnerR,
    width: lensInnerR * 2, height: lensInnerR * 2
))
ctx.clip()

let gleam = CGGradient(
    colorsSpace: cs,
    colors: [
        color(1, 1, 1, 0.22),
        color(1, 1, 1, 0.0)
    ] as CFArray,
    locations: [0, 1]
)!
ctx.drawRadialGradient(
    gleam,
    startCenter: CGPoint(x: lensCx - 90, y: lensCy + 130), startRadius: 0,
    endCenter:   CGPoint(x: lensCx - 90, y: lensCy + 130), endRadius: 150,
    options: []
)
ctx.restoreGState()

// ---------- Write PNG ----------
guard let img = ctx.makeImage() else { fatalError("makeImage") }
let rep = NSBitmapImageRep(cgImage: img)
guard let png = rep.representation(using: .png, properties: [:]) else { fatalError("png") }

let fm = FileManager.default
try? fm.createDirectory(atPath: outDir, withIntermediateDirectories: true)
try png.write(to: URL(fileURLWithPath: outPath))
print("Wrote \(outPath) (\(png.count) bytes)")
