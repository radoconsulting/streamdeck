# Loxone Smart Home Stream Deck Plugin

Control your Loxone Gen 1 Miniserver from your Elgato Stream Deck, including support for Stream Deck Plus dials!

## Features

- **Switch Control**: Toggle lights, outputs, and other on/off controls
- **Dimmer Control**: Adjust brightness with buttons or dials (Stream Deck Plus)
  - Rotate dial to adjust brightness
  - Press to toggle on/off
  - Long touch to set to 100%
- **Blind/Jalousie Control**: Control window coverings with buttons or dials
  - Rotate dial to adjust position
  - Press to stop
  - Long touch to fully open
- **Pulse/Virtual Input**: Trigger scenes, automations, or virtual inputs

## Installation

1. Build the plugin:
   ```bash
   npm install
   npm run build
   ```

2. Install the plugin:
   - Double-click the `com.loxone.smartthome.streamDeckPlugin` file, or
   - Copy `com.loxone.smartthome.sdPlugin` to your Stream Deck plugins folder:
     - Windows: `%appdata%\Elgato\StreamDeck\Plugins\`
     - macOS: `~/Library/Application Support/com.elgato.StreamDeck/Plugins/`

## Configuration

For each action, you need to configure:

### Miniserver Connection
- **Miniserver Address**: IP address or hostname (e.g., `192.168.1.100`)
- **Username**: Your Loxone Miniserver username
- **Password**: Your Loxone Miniserver password

### Control Configuration
- **Control UUID**: The UUID of the Loxone control
  - Find this in Loxone Config by right-clicking a control and selecting "Copy UUID"
- **Display Name**: Name to show on the Stream Deck button
- **Step Size** (Dimmer/Blind): Percentage to adjust per dial rotation tick

## Finding Control UUIDs

1. Open **Loxone Config**
2. Right-click on any control (switch, dimmer, blind, etc.)
3. Select **"Copy UUID"** or view properties to find the UUID
4. Paste the UUID into the Stream Deck property inspector

The UUID looks like: `0f1e2d3c-4b5a-6978-8796-a5b4c3d2e1f0`

## Stream Deck Plus Dial Support

The Dimmer and Blind actions support Stream Deck Plus dials:

### Dimmer Dial Actions
- **Rotate**: Adjust brightness (default: 5% per tick)
- **Press**: Toggle on/off
- **Touch**: Toggle on/off
- **Long Touch**: Set to 100%

### Blind Dial Actions
- **Rotate**: Adjust position (default: 10% per tick)
- **Press**: Stop movement
- **Touch**: Stop movement
- **Long Touch**: Fully open (0%)

## Supported Loxone Controls

- Lighting Controller
- Switch/Output
- Dimmer
- Blind/Jalousie
- Virtual Inputs
- Push Buttons
- Any control that responds to basic commands (On, Off, Pulse, etc.)

## Development

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Watch mode (rebuild on changes)
npm run watch
```

## Loxone Gen 1 Compatibility

This plugin is specifically designed for Loxone Gen 1 Miniserver and uses:
- WebSocket communication (RFC 6455)
- HTTP Basic authentication
- Binary status updates for real-time feedback
- Standard Loxone commands (Pulse, On, FullUp, FullDown, etc.)

## Troubleshooting

### Plugin not connecting
- Verify your Miniserver IP address is correct
- Check that your username and password are correct
- Ensure your Miniserver is accessible on your network
- Check the Stream Deck logs for connection errors

### Control not responding
- Verify the Control UUID is correct
- Check that the control exists in your Loxone configuration
- Try using a different command (some controls respond to different commands)

### Dial not working
- Ensure you're using a Stream Deck Plus (dials are only available on Plus models)
- Check that the action is assigned to a dial slot (not a button)

## License

ISC

## Author

Rado Consulting
