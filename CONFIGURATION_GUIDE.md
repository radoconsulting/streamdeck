# Complete Configuration Guide

## 🌟 New! Web-Based Configuration

The easiest way to configure your Loxone Stream Deck plugin is using the **web configuration interface**.

### Quick Setup (3 Steps)

#### Step 1: Start the Configuration Server

```bash
npm run config
```

The server will start at http://localhost:3456

#### Step 2: Open the Web Interface

**Option A**: Click the button in Stream Deck
1. Add a Loxone action to your Stream Deck
2. Click on it to open settings
3. Click **"Open Control Browser"** button at the top

**Option B**: Open directly in browser
- Navigate to http://localhost:3456

#### Step 3: Browse and Configure

1. **Connect to your Miniserver**:
   - Enter IP address (e.g., `192.168.1.100`)
   - Enter username and password
   - Click "Connect & Load Controls"

2. **Find your control**:
   - Use the search box to find by name
   - Filter by room or type
   - Browse the organized list

3. **Select and copy**:
   - Click on the control you want
   - See the recommended action type
   - Click "Copy UUID"

4. **Complete in Stream Deck**:
   - Return to Stream Deck settings
   - Paste the UUID
   - Fill in the Miniserver connection details
   - Add a display name
   - Done!

---

## 📋 Manual Configuration (Alternative)

If you prefer manual configuration or want to understand the details:

### Required Information

For each Stream Deck action, you need:

1. **Miniserver Connection**:
   - Host/IP address
   - Username
   - Password

2. **Control Details**:
   - Control UUID
   - Display name (what shows on the button)

3. **Optional**:
   - Step size (for dimmers and blinds on dials)

### Finding Control UUIDs Manually

**Method 1: Loxone Config**
1. Open Loxone Config
2. Navigate to the control (switch, dimmer, etc.)
3. Right-click the control
4. Select "Copy UUID" or view in Properties
5. Paste into Stream Deck configuration

**Method 2: Structure File**
1. Access `http://[miniserver-ip]/data/LoxAPP3.json`
2. Search for your control name
3. Copy the UUID field

### Action Types and Their Controls

#### Switch Action
**Use for:**
- Lights (on/off)
- Outputs
- General switches
- Any binary control

**Configuration:**
- Control UUID of the switch
- Sends "Pulse" command to toggle

#### Dimmer Action
**Use for:**
- Dimmers
- Light controllers
- Adjustable lighting

**Configuration:**
- Control UUID of the dimmer
- Step size (default 5%)

**Button behavior:** Toggle on/off
**Dial behavior (Plus):** Rotate to adjust brightness, press to toggle

#### Blind Action
**Use for:**
- Jalousies
- Window blinds
- Shutters
- Any positional control

**Configuration:**
- Control UUID of the blind/jalousie
- Step size (default 10%)

**Button behavior:** Fully down
**Dial behavior (Plus):** Rotate to adjust position, press to stop

#### Pulse Action
**Use for:**
- Virtual inputs
- Push buttons
- Scene triggers
- One-shot commands

**Configuration:**
- Control UUID of the input/trigger

**Button behavior:** Send pulse

---

## 🎛️ Stream Deck Plus Dial Configuration

### Dimmer on Dial

1. Drag **Dimmer** action to a **dial slot**
2. Configure as normal
3. Behavior:
   - **Rotate**: Adjust brightness (default ±5% per tick)
   - **Press**: Toggle on/off
   - **Touch**: Toggle on/off
   - **Long Touch**: Set to 100%
4. The dial shows current brightness percentage

### Blind on Dial

1. Drag **Blind** action to a **dial slot**
2. Configure as normal
3. Behavior:
   - **Rotate**: Adjust position (default ±10% per tick)
   - **Press**: Stop movement
   - **Touch**: Stop movement
   - **Long Touch**: Fully open (0%)
4. The dial shows current position percentage

### Customizing Step Size

In the action settings:
- **Dimmer**: Set step size (1-25%, default 5%)
- **Blind**: Set step size (1-50%, default 10%)

Larger steps = faster changes but less precision
Smaller steps = more precise but slower changes

---

## 🔍 Control Type Reference

### Recommended Mappings

| Loxone Control | Stream Deck Action | Notes |
|----------------|-------------------|-------|
| Switch | Switch | Simple on/off |
| Dimmer | Dimmer | Use dial for best experience |
| LightController | Dimmer | Full brightness control |
| Jalousie | Blind | Use dial for best experience |
| Pushbutton | Pulse | One-shot trigger |
| Virtual Input | Pulse | For scenes/automations |
| TimedSwitch | Switch | Toggle timed operation |
| Gate | Pulse | Trigger gate control |
| UpDownDigital | Blind | Positional control |

---

## 🎨 Customization Tips

### Display Names

Choose clear, concise names that fit on the button:
- ✅ "Living\nRoom" (use \n for line breaks)
- ✅ "Kitchen"
- ✅ "Bedroom\nLight"
- ❌ "Living Room Main Ceiling Light" (too long)

### Organization

**Use Stream Deck folders** to organize:
- By room: "Living Room", "Bedroom", "Kitchen"
- By function: "Lights", "Blinds", "Scenes"
- By floor: "Ground Floor", "First Floor"

**Use profiles** for different scenarios:
- Work mode
- Movie mode
- Night mode

### Icons

Replace the placeholder icons with custom ones:
1. Create or find appropriate icons (72x72px)
2. Place in `com.loxone.smartthome.sdPlugin/imgs/actions/[action]/`
3. Rebuild: `npm run build`
4. Restart: `npm run restart`

---

## ⚙️ Advanced Configuration

### Multiple Miniservers

You can control multiple Miniservers from the same Stream Deck:
- Each action can have different Miniserver settings
- The plugin manages separate connections automatically

### Connection Pooling

The plugin uses connection pooling:
- One WebSocket connection per Miniserver
- Shared across all actions
- Automatic reconnection on disconnect

### Real-Time Updates

When configured, actions receive real-time updates:
- Switch states update automatically
- Dimmer values reflect current brightness
- Blind positions show current state

---

## 🐛 Troubleshooting

### "Configure" Shows on Button

**Problem**: Button shows "Configure" or "Configure Miniserver"

**Solutions**:
1. Check that all required fields are filled in
2. Verify Miniserver address is correct
3. Ensure Control UUID is valid
4. Try using the web configuration tool

### Red X When Pressing Button

**Problem**: Button shows red X (alert) when pressed

**Possible causes**:
1. **Wrong UUID**: Control doesn't exist
2. **Connection failed**: Can't reach Miniserver
3. **Wrong credentials**: Username/password incorrect
4. **Wrong command**: Control doesn't support the command

**Solutions**:
1. Verify UUID is correct (use web config tool)
2. Test Miniserver connectivity (ping IP address)
3. Check username and password
4. Try a different action type

### Dial Not Working

**Problem**: Dial doesn't respond

**Solutions**:
1. Ensure you have Stream Deck Plus
2. Check action is assigned to dial slot (not button)
3. Verify Control UUID is correct
4. Only Dimmer and Blind actions support dials

### Connection Issues

**Problem**: Can't connect to Miniserver

**Solutions**:
1. Verify IP address (no http://, just IP)
2. Check network connectivity
3. Ensure Miniserver is Gen 1 (not Gen 2)
4. Try connecting via web browser first
5. Check firewall settings

---

## 📚 Additional Resources

- [README.md](README.md) - Full plugin documentation
- [CONFIG_SERVER.md](CONFIG_SERVER.md) - Web configuration details
- [SETUP.md](SETUP.md) - Installation guide
- [QUICKSTART.md](QUICKSTART.md) - Quick reference

---

## 💡 Best Practices

1. **Start with the web config tool** - It's faster and easier
2. **Test with one action first** - Verify connectivity before adding many
3. **Use meaningful names** - Makes finding controls easier
4. **Organize with folders** - Keep your Stream Deck tidy
5. **Use dials for analog controls** - Dimmers and blinds work great on dials
6. **Keep the config server running** - Useful when setting up multiple actions

---

## ✨ Example Setups

### Home Office Setup

**Row 1: Lights**
- Desk Light (Dimmer on dial)
- Ceiling Light (Switch)
- Ambient Light (Dimmer on dial)

**Row 2: Blinds**
- Window 1 (Blind on dial)
- Window 2 (Blind on dial)

**Row 3: Scenes**
- Work Mode (Pulse)
- Meeting Mode (Pulse)
- Break Time (Pulse)

### Living Room Setup

**Column 1: Main Lights**
- Main Ceiling (Dimmer on dial)
- Reading Lamp (Switch)
- Floor Lamp (Dimmer)

**Column 2: Ambiance**
- RGB Strip (Dimmer on dial)
- Window Blind (Blind on dial)

**Column 3: Scenes**
- Movie Mode (Pulse)
- Dinner Mode (Pulse)
- Party Mode (Pulse)

---

Happy controlling! 🏠✨
