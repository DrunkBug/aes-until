#!/bin/bash
SOURCE="source.png"
ICONSET="MyIcon.iconset"

mkdir -p $ICONSET

# Resize for iconset with explicit PNG format
sips -s format png -z 16 16     $SOURCE --out "${ICONSET}/icon_16x16.png"
sips -s format png -z 32 32     $SOURCE --out "${ICONSET}/icon_16x16@2x.png"
sips -s format png -z 32 32     $SOURCE --out "${ICONSET}/icon_32x32.png"
sips -s format png -z 64 64     $SOURCE --out "${ICONSET}/icon_32x32@2x.png"
sips -s format png -z 128 128   $SOURCE --out "${ICONSET}/icon_128x128.png"
sips -s format png -z 256 256   $SOURCE --out "${ICONSET}/icon_128x128@2x.png"
sips -s format png -z 256 256   $SOURCE --out "${ICONSET}/icon_256x256.png"
sips -s format png -z 512 512   $SOURCE --out "${ICONSET}/icon_256x256@2x.png"
sips -s format png -z 512 512   $SOURCE --out "${ICONSET}/icon_512x512.png"
sips -s format png -z 1024 1024 $SOURCE --out "${ICONSET}/icon_512x512@2x.png"

# Create .icns
iconutil -c icns $ICONSET -o icon.icns

# Update individual files used by Tauri config
cp "${ICONSET}/icon_32x32.png" 32x32.png
cp "${ICONSET}/icon_128x128.png" 128x128.png
cp "${ICONSET}/icon_256x256.png" 128x128@2x.png
cp $SOURCE icon.png

# Clean up
rm -rf $ICONSET
rm source.png
