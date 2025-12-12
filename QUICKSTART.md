# Loxone Stream Deck Plugin - Quick Start

Your Loxone Stream Deck plugin has been created! Here's what you need to do next:

## ✅ Completed

- ✅ Plugin structure created
- ✅ TypeScript build configuration
- ✅ Loxone WebSocket client for Gen 1 Miniserver
- ✅ Four action types:
  - Switch (toggle lights, outputs)
  - Dimmer (with Stream Deck Plus dial support)
  - Blind (with Stream Deck Plus dial support)
  - Pulse (trigger scenes, virtual inputs)
- ✅ Property inspector UI for configuration
- ✅ Plugin compiles successfully

## 📝 Next Steps

### 1. Create Icon Images (Required!)

The plugin needs images to display properly. Create simple placeholder images:

**Quick solution**: Create small colored squares in Paint/Photoshop:
- Plugin icons: `imgs/plugin/icon.png` and `icon@2x.png`
- Category icon: `imgs/plugin/category-icon.png` and `category-icon@2x.png`
- For each action folder (`switch`, `dimmer`, `blind`, `pulse`):
  - `icon.png` and `icon@2x.png`
  - `key.png` and `key@2x.png`
  - For `dimmer` and `blind`: `dial.png` and `dial@2x.png`
  - For `switch`: `key_on.png` and `key_on@2x.png`

See [IMAGES.md](IMAGES.md) for detailed specifications.

### 2. Test the Build

```bash
npm run build
```

Should output: `created com.loxone.smartthome.sdPlugin/bin/plugin.js`

### 3. Install to Stream Deck

**Development mode** (recommended):
```bash
npm run link    # Link plugin for development
npm run restart # Restart after changes
```

**Manual install**:
- Copy `com.loxone.smartthome.sdPlugin` to Stream Deck plugins folder
- Restart Stream Deck software

### 4. Configure Your First Action

1. Open Stream Deck software
2. Find "Loxone" category in actions list
3. Drag "Switch" action to a button
4. Click the button to configure:
   - **Miniserver Address**: Your Miniserver IP (e.g., `192.168.1.100`)
   - **Username**: Your Loxone username
   - **Password**: Your Loxone password
   - **Control UUID**: UUID from Loxone Config (right-click control → Copy UUID)
   - **Display Name**: Name for the button (e.g., "Living Room Light")

### 5. Test It!

Press the button - it should send a command to your Miniserver.

## 🎛️ Stream Deck Plus Dial Support

If you have a Stream Deck Plus:

**Dimmer on Dial**:
- Rotate to adjust brightness
- Press to toggle on/off
- Shows current brightness percentage

**Blind on Dial**:
- Rotate to adjust position
- Press to stop
- Shows current position percentage

## 📁 Project Structure

```
f:\git\streamdeck\
├── src/
│   ├── actions/          # Action implementations
│   ├── loxone/          # Loxone communication
│   └── plugin.ts        # Main entry point
├── com.loxone.smartthome.sdPlugin/
│   ├── manifest.json    # Plugin metadata
│   ├── bin/            # Compiled code (generated)
│   ├── imgs/           # Icons (YOU NEED TO ADD THESE!)
│   └── ui/             # Configuration UI
├── package.json
├── tsconfig.json
├── rollup.config.mjs
└── README.md
```

## 🔧 Development Commands

```bash
npm install      # Install dependencies
npm run build    # Build plugin
npm run watch    # Build on file changes
npm run link     # Link for development
npm run restart  # Restart plugin
```

## 🐛 Troubleshooting

**Button shows "Configure"**:
- Make sure Miniserver settings are filled in
- Check that Control UUID is correct

**Red X when pressing**:
- Verify Miniserver IP is correct
- Check username/password
- Ensure Control UUID exists in Loxone Config
- Look at Stream Deck logs for errors

**Dial doesn't work**:
- Only works on Stream Deck Plus
- Must be assigned to a dial slot (not button)
- Check Control UUID

## 📚 Documentation

- [README.md](README.md) - Full documentation
- [SETUP.md](SETUP.md) - Detailed setup guide
- [IMAGES.md](IMAGES.md) - Icon creation guide

## 🎯 Supported Loxone Controls

- ✅ Switches and outputs
- ✅ Dimmers and lighting controllers
- ✅ Blinds and jalousies
- ✅ Virtual inputs
- ✅ Push buttons
- ✅ Any control responding to basic commands

## 💡 Tips

1. **Test with a simple switch first** before configuring complex controls
2. **Use folders** in Stream Deck to organize controls by room
3. **Set step size** for dimmers (5%) and blinds (10%) based on your preference
4. **Create good icons** - they make the experience much better!

## ⚙️ Loxone Gen 1 Compatibility

This plugin is specifically designed for:
- Loxone Gen 1 Miniserver
- WebSocket communication (RFC 6455)
- HTTP Basic authentication
- Binary status updates for real-time feedback

## 🚀 You're Ready!

Once you add the images, your plugin is ready to use. Start with a simple switch to test connectivity, then add your favorite controls!

Happy automating! 🏠✨
