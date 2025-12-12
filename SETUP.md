# Quick Setup Guide

## Prerequisites

- Elgato Stream Deck (any model)
- Stream Deck Plus (for dial support - optional)
- Loxone Gen 1 Miniserver
- Network access to your Miniserver

## Installation Steps

### 1. Build the Plugin

```bash
npm install
npm run build
```

### 2. Create Plugin Images

Before using the plugin, you need to create icon images. See [IMAGES.md](IMAGES.md) for details.

**Minimum required images** (create simple colored squares as placeholders):

```
com.loxone.smartthome.sdPlugin/imgs/plugin/icon.png (72x72)
com.loxone.smartthome.sdPlugin/imgs/plugin/icon@2x.png (144x144)
com.loxone.smartthome.sdPlugin/imgs/plugin/category-icon.png (28x28)
com.loxone.smartthome.sdPlugin/imgs/plugin/category-icon@2x.png (56x56)

For each action (switch, dimmer, blind, pulse):
com.loxone.smartthome.sdPlugin/imgs/actions/{action}/icon.png (20x20)
com.loxone.smartthome.sdPlugin/imgs/actions/{action}/icon@2x.png (40x40)
com.loxone.smartthome.sdPlugin/imgs/actions/{action}/key.png (72x72)
com.loxone.smartthome.sdPlugin/imgs/actions/{action}/key@2x.png (144x144)

For dial actions (dimmer, blind):
com.loxone.smartthome.sdPlugin/imgs/actions/{action}/dial.png (200x200)
com.loxone.smartthome.sdPlugin/imgs/actions/{action}/dial@2x.png (400x400)

For switch action:
com.loxone.smartthome.sdPlugin/imgs/actions/switch/key_on.png (72x72)
com.loxone.smartthome.sdPlugin/imgs/actions/switch/key_on@2x.png (144x144)
```

### 3. Install the Plugin

**Option A: Double-click install** (after images are created)
1. Create the plugin package: Copy the `com.loxone.smartthome.sdPlugin` folder to a safe location
2. Double-click the folder (Stream Deck software should open and install it)

**Option B: Manual install**
1. Copy `com.loxone.smartthome.sdPlugin` to:
   - Windows: `%appdata%\Elgato\StreamDeck\Plugins\`
   - macOS: `~/Library/Application Support/com.elgato.StreamDeck/Plugins/`
2. Restart Stream Deck software

## Configuration

### For Each Action

1. Drag a Loxone action to your Stream Deck
2. Click on the action to open settings
3. Configure:

**Miniserver Connection** (same for all actions):
- **Miniserver Address**: Your Miniserver's IP (e.g., `192.168.1.100`)
- **Username**: Your Loxone username
- **Password**: Your Loxone password

**Control Configuration**:
- **Control UUID**: The UUID of the control from Loxone Config
- **Display Name**: Name to show on the button
- **Step Size** (dimmer/blind only): Percentage per dial tick

### Finding Control UUIDs

1. Open **Loxone Config**
2. Navigate to your control (switch, dimmer, blind, etc.)
3. Right-click the control
4. Select **"Copy UUID"** (or view in properties)
5. Paste into Stream Deck configuration

Example UUID: `0f1e2d3c-4b5a-6978-8796-a5b4c3d2e1f0`

## Testing

1. Add a Switch action to test basic connectivity
2. Configure it with a simple light or output
3. Press the button - you should see:
   - Green checkmark on success
   - Red X on failure

## Troubleshooting

### "Configure" appears on button
- Check that all Miniserver settings are filled in
- Verify your IP address is correct
- Test network connectivity to Miniserver

### Red X when pressing button
- Verify Control UUID is correct
- Check username and password
- Ensure control exists in Loxone Config
- Check Stream Deck logs for errors

### Dial not working
- Ensure you have a Stream Deck Plus
- Verify the action is on a dial slot (not a button)
- Check that Control UUID is correct

## Stream Deck Plus Dial Controls

### Dimmer Dial
- **Rotate**: Adjust brightness ±5% per tick (configurable)
- **Press**: Toggle on/off

### Blind Dial
- **Rotate**: Adjust position ±10% per tick (configurable)
- **Press**: Stop movement

## Development Mode

To work on the plugin:

```bash
# Watch mode - rebuilds on file changes
npm run watch

# Check Stream Deck logs for debugging
# Windows: %appdata%\Elgato\StreamDeck\logs\
# macOS: ~/Library/Logs/ElgatoStreamDeck/
```

## Next Steps

1. Create proper icons (see IMAGES.md)
2. Configure your most-used controls
3. Organize controls by room or function
4. Use folders in Stream Deck to group related controls

## Support

For issues or questions:
- Check the [README.md](README.md) for detailed information
- Review [IMAGES.md](IMAGES.md) for icon creation help
- Open an issue on GitHub
