# Plugin Images Guide

This plugin requires images for the actions and plugin icons. You need to create the following images:

## Plugin Icons

### Category Icon
- Path: `com.loxone.smartthome.sdPlugin/imgs/plugin/category-icon.png`
- Size: 28x28 pixels
- Path: `com.loxone.smartthome.sdPlugin/imgs/plugin/category-icon@2x.png`
- Size: 56x56 pixels

### Plugin Icon
- Path: `com.loxone.smartthome.sdPlugin/imgs/plugin/icon.png`
- Size: 72x72 pixels
- Path: `com.loxone.smartthome.sdPlugin/imgs/plugin/icon@2x.png`
- Size: 144x144 pixels

## Action Icons

For each action (switch, dimmer, blind, pulse), you need:

### Icon (for property inspector)
- Path: `com.loxone.smartthome.sdPlugin/imgs/actions/{action}/icon.png`
- Size: 20x20 pixels
- Path: `com.loxone.smartthome.sdPlugin/imgs/actions/{action}/icon@2x.png`
- Size: 40x40 pixels

### Key Images (for Stream Deck buttons)
- Path: `com.loxone.smartthome.sdPlugin/imgs/actions/{action}/key.png`
- Size: 72x72 pixels
- Path: `com.loxone.smartthome.sdPlugin/imgs/actions/{action}/key@2x.png`
- Size: 144x144 pixels

### Switch Action Additional Images
- Path: `com.loxone.smartthome.sdPlugin/imgs/actions/switch/key_on.png`
- Size: 72x72 pixels
- Path: `com.loxone.smartthome.sdPlugin/imgs/actions/switch/key_on@2x.png`
- Size: 144x144 pixels

### Dial Images (for Stream Deck Plus - dimmer and blind)
- Path: `com.loxone.smartthome.sdPlugin/imgs/actions/{action}/dial.png`
- Size: 200x200 pixels
- Path: `com.loxone.smartthome.sdPlugin/imgs/actions/{action}/dial@2x.png`
- Size: 400x400 pixels

## Image Recommendations

- Use PNG format with transparency
- Keep designs simple and clear
- Use colors that contrast well with dark backgrounds
- Consider using the Loxone green (#66B933) for branding
- Make sure icons are recognizable at small sizes

## Quick Image Creation

You can use any image editing software to create these images, or use online tools like:
- Figma
- Canva
- GIMP
- Photoshop
- Inkscape (for SVG, then export to PNG)

## Placeholder Images

For testing, you can create simple colored squares:
- Switch: Blue square with a power icon
- Dimmer: Yellow square with a sun/brightness icon
- Blind: Gray square with a window blind icon
- Pulse: Green square with a pulse/play icon

The plugin will work without images, but they make the user experience much better!
