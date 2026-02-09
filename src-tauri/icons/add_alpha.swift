import Cocoa

func addAlpha(to path: String) {
    let url = URL(fileURLWithPath: path)
    guard let image = NSImage(contentsOf: url) else {
        print("Could not load image at \(path)")
        return
    }
    
    let width = Int(image.size.width)
    let height = Int(image.size.height)
    
    // Create a bitmap representation with alpha (RGBA)
    guard let rep = NSBitmapImageRep(
        bitmapDataPlanes: nil,
        pixelsWide: width,
        pixelsHigh: height,
        bitsPerSample: 8,
        samplesPerPixel: 4,
        hasAlpha: true,
        isPlanar: false,
        colorSpaceName: .deviceRGB,
        bytesPerRow: 0,
        bitsPerPixel: 0
    ) else {
        print("Could not create bitmap rep for \(path)")
        return
    }
    
    // Draw the original image into the new rep
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
    // Clear with transparency first (though implicit in new rep)
    NSColor.clear.set()
    let rect = NSRect(x: 0, y: 0, width: width, height: height)
    rect.fill()
    // Draw image
    image.draw(in: rect, from: .zero, operation: .sourceOver, fraction: 1.0)
    NSGraphicsContext.restoreGraphicsState()
    
    // Save back to PNG
    if let data = rep.representation(using: .png, properties: [:]) {
        do {
            try data.write(to: url)
            print("Converted \(path) to RGBA")
        } catch {
            print("Failed to write \(path): \(error)")
        }
    } else {
        print("Could not generate PNG data")
    }
}

let files = [
    "32x32.png",
    "128x128.png",
    "128x128@2x.png",
    "icon.png"
]

let cwd = FileManager.default.currentDirectoryPath
for file in files {
    let path = cwd + "/" + file
    addAlpha(to: path)
}
