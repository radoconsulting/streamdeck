# Web-Based Configuration Server

The Loxone Stream Deck plugin includes a web-based configuration tool that makes it easy to browse and select your Loxone controls without manually finding UUIDs.

## 🚀 Quick Start

1. **Start the configuration server:**
   ```bash
   npm run config
   ```

2. **Open in your browser:**
   ```
   http://localhost:3456
   ```

3. **Browse and select your controls!**

## 📖 How to Use

### Step 1: Connect to Your Miniserver

1. Enter your Miniserver details:
   - **Miniserver Address**: IP address (e.g., `192.168.1.100`)
   - **Username**: Your Loxone username
   - **Password**: Your Loxone password

2. Click "Connect & Load Controls"

The server will:
- Connect to your Miniserver via WebSocket
- Fetch the structure file (LoxAPP3.json)
- Parse all available controls
- Display them organized by room, type, and category

### Step 2: Browse Controls

Use the filters to find your control:
- **Search box**: Search by name, type, or room
- **Room filter**: Filter by specific room
- **Type filter**: Filter by control type (Switch, Dimmer, Jalousie, etc.)

All your controls will be displayed with:
- Control name
- Type badge
- Room and category information

### Step 3: Select a Control

Click on any control to select it. You'll see:
- Control details
- **Control UUID** (ready to copy)
- Recommended Stream Deck action type
- Your Miniserver connection details

Click **"Copy UUID"** to copy the UUID to your clipboard.

### Step 4: Configure Stream Deck

1. Go to Stream Deck software
2. Drag the recommended action to your Stream Deck
3. Click to configure:
   - Paste the UUID
   - Fill in Miniserver connection details
   - Add a display name
4. Done!

## 🎯 Features

### Smart Control Detection

The configuration server automatically:
- Filters out irrelevant controls
- Shows only actionable controls (switches, dimmers, blinds, etc.)
- Recommends the best Stream Deck action for each control type:
  - **Switch** → Lights, outputs, general on/off controls
  - **Dimmer** → Dimmers, light controllers
  - **Blind** → Jalousies, window coverings
  - **Pulse** → Push buttons, virtual inputs

### Visual Organization

Controls are organized by:
- **Room**: See all controls in each room
- **Category**: Group by Loxone categories
- **Type**: View by control type

### One-Click Access

The property inspector for each action includes a button to open the configuration server directly.

## 🔧 Technical Details

### Server Configuration

- **Port**: 3456 (default)
- **API Endpoints**:
  - `POST /api/test-connection` - Test Miniserver connection
  - `POST /api/get-controls` - Fetch all controls
  - `POST /api/get-control-details` - Get specific control details

### Caching

The server caches structure files for 1 minute to improve performance when browsing multiple controls.

### Security

- Credentials are only used for the connection and not stored
- Server runs locally on your machine
- No data leaves your network

## 📝 Example Workflow

1. **Start server**: `npm run config`
2. **Open browser**: http://localhost:3456
3. **Connect**: Enter Miniserver details
4. **Search**: Type "living room light"
5. **Select**: Click on the control
6. **Copy**: Click "Copy UUID"
7. **Configure**: Open Stream Deck, add Switch action
8. **Paste**: Paste UUID and connection details
9. **Test**: Press the button!

## 🎨 Supported Control Types

The configuration server filters and displays:

- ✅ Switch
- ✅ Dimmer
- ✅ Jalousie (Blinds)
- ✅ LightController
- ✅ Pushbutton
- ✅ InfoOnlyDigital
- ✅ InfoOnlyAnalog
- ✅ TimedSwitch
- ✅ Gate
- ✅ UpDownDigital

Other control types are filtered out to keep the interface clean.

## 💡 Tips

1. **Keep the server running** while configuring multiple actions
2. **Use search** to quickly find controls by name
3. **Filter by room** when setting up room-specific profiles
4. **Check the recommended action** for each control type
5. **Copy connection details** for reuse across multiple actions

## 🐛 Troubleshooting

### Server won't start
- Check if port 3456 is already in use
- Make sure dependencies are installed: `npm install`

### Can't connect to Miniserver
- Verify Miniserver IP address
- Check network connectivity
- Ensure credentials are correct
- Make sure Miniserver is on Gen 1 (not Gen 2)

### No controls showing
- Verify the structure file loaded successfully
- Check that your Loxone config has compatible control types
- Try refreshing the connection

### Browser can't reach server
- Ensure server is running: `npm run config`
- Check firewall settings
- Try http://localhost:3456 or http://127.0.0.1:3456

## 🔄 Integration with Stream Deck

Each property inspector includes a button that opens the configuration server:

**"Open Control Browser"** → Opens http://localhost:3456 in a new tab

This makes the workflow seamless:
1. Add action to Stream Deck
2. Click "Open Control Browser"
3. Find and copy UUID
4. Return to Stream Deck and paste

## 🌟 Benefits

Compared to manual UUID lookup:
- ⚡ **Faster**: No need to open Loxone Config
- 🎯 **Easier**: Visual browsing instead of UUID hunting
- 📱 **Smarter**: Automatic action recommendations
- 🔍 **Better**: Search and filter capabilities
- 📋 **Convenient**: One-click UUID copying

Enjoy configuring your Stream Deck with Loxone! 🏠✨
