# Troubleshooting Guide

## Quick Checklist

When a button doesn't work, check these in order:

### 1. Is the action configured?
- Open Stream Deck software
- Click on the Loxone button
- Verify all fields are filled:
  - ✅ Miniserver Address (e.g., `192.168.0.99`)
  - ✅ Username
  - ✅ Password
  - ✅ Control UUID (from web config tool)
  - ✅ Display Name

### 2. Test the configuration server first
1. Open http://localhost:3456
2. Enter your Miniserver credentials
3. Can you see your controls? If not, check:
   - Is the Miniserver IP correct?
   - Are the credentials correct?
   - Is the Miniserver reachable on your network?

### 3. Check Stream Deck logs
Location: `%appdata%\Elgato\StreamDeck\logs\StreamDeck.log`

Look for:
- `Plugin 'com.loxone.smartthome' connected` - Plugin is running ✅
- Any error messages with 'loxone' in them

### 4. Test with a simple control first
- Start with a **Switch** action (simplest)
- Use a basic light or output
- Avoid dimmers/blinds for first test

## Common Issues

### Button shows "Configure"
**Problem**: Action is not configured

**Solution**:
1. Click the button in Stream Deck
2. Fill in all required fields
3. Use the web config tool to get the UUID easily

### Button shows red X when pressed
**Problem**: Command failed to send

**Possible causes**:
1. **Wrong UUID**: The control doesn't exist
   - Solution: Use web config tool to verify UUID

2. **Connection failed**: Can't reach Miniserver
   - Solution: Check Miniserver IP and network

3. **Authentication failed**: Wrong credentials
   - Solution: Verify username/password

4. **Wrong command for control type**:
   - Solution: Use recommended action from web config

### No response when button pressed
**Problem**: Command sent but nothing happens

**Debug steps**:
1. Check if the control works in Loxone app
2. Try the same UUID with different commands:
   - Switch: Try "On", "Off", or "Pulse"
   - Dimmer: Try "On" or a number like "50"
   - Blind: Try "FullUp", "FullDown", or "Stop"

### Web config shows no controls
**Problem**: Structure file has no controls or wrong format

**Solutions**:
1. Verify you're connecting to the right Miniserver
2. Check that your Loxone config has controls
3. Look at server console for debug info
4. The server logs show which control types were found

## Debug Mode

### Enable verbose logging

1. Check the terminal where config server is running (`npm run config`)
2. When you connect, you'll see:
   ```
   Found X total controls
   Sample control: [name] (type: [type])
   All control types found: [list]
   ```

3. This tells you:
   - How many controls were found
   - What types they are
   - If they're being filtered out

### Test direct HTTP access

Open in browser:
```
http://[your-miniserver-ip]/data/LoxAPP3.json
```

You should see the structure file. If you get:
- **Login prompt**: Credentials are required (expected for Gen 1)
- **404**: Wrong URL or Miniserver offline
- **Timeout**: Network issue

## Loxone Command Reference

### Common Commands

**Switch/Output**:
- `On` - Turn on
- `Off` - Turn off
- `Pulse` - Toggle (recommended)

**Dimmer**:
- `On` - Toggle on/off
- `Off` - Turn off
- `0-100` - Set brightness (e.g., "50" for 50%)

**Jalousie/Blind**:
- `FullUp` - Fully open (0%)
- `FullDown` - Fully close (100%)
- `Stop` - Stop movement
- `UpOff` - Stop up movement
- `DownOff` - Stop down movement
- `ManualPosition/X` - Set position (e.g., "ManualPosition/50")

**Virtual Input**:
- `Pulse` - Send pulse

### Control Types

From your Miniserver, we found these types:
- `Jalousie` → Use **Blind** action
- `LightControllerV2` → Use **Dimmer** action
- `LightController` → Use **Dimmer** action
- `Switch` → Use **Switch** action
- `Pushbutton` → Use **Pulse** action
- `CentralJalousie` → Use **Blind** action
- `CentralLightController` → Use **Dimmer** action

## Step-by-Step Test

### Test 1: Web Config
1. Start config server: `npm run config`
2. Open: http://localhost:3456
3. Enter: `192.168.0.99`, your username, password
4. Click: "Connect & Load Controls"
5. **Expected**: See list of 58 controls
6. **If not**: Check server console for errors

### Test 2: Copy UUID
1. In web config, search for a simple light
2. Click on it
3. Click "Copy UUID"
4. **Expected**: UUID copied to clipboard
5. **If not**: Try a different control

### Test 3: Configure Action
1. In Stream Deck, drag a **Switch** action to a button
2. Click the button to open settings
3. Paste the UUID
4. Fill in Miniserver details
5. Add a display name
6. **Expected**: Button shows your name
7. **If not**: Check all fields are filled

### Test 4: Press Button
1. Press the button on Stream Deck
2. **Expected**: Green checkmark, light toggles
3. **If red X**: Check Stream Deck logs
4. **If nothing**: Check if control works in Loxone app

## Still Not Working?

### Collect Debug Info

1. **Config server output**:
   - What does it show when you connect?
   - How many controls found?
   - What types?

2. **Stream Deck logs**:
   - Is plugin connected?
   - Any error messages?

3. **Test control manually**:
   - Does it work in Loxone app?
   - What's the control type?
   - What's the exact UUID?

4. **Network test**:
   ```
   ping 192.168.0.99
   ```
   Should respond if Miniserver is reachable

### Create an Issue

If still not working, create a GitHub issue with:
- Miniserver model (Gen 1)
- Control type you're trying to use
- Action type you're using
- Config server output
- Stream Deck logs (relevant parts)
- What happens when you press the button

## Quick Fixes

### Restart everything
```bash
npm run build
npm run restart
```

### Clear cache
Close Stream Deck software, delete:
```
%appdata%\Elgato\StreamDeck\ProfilesV2\
```
(Backup first!)

### Reinstall plugin
```bash
# Unlink
streamdeck unlink com.loxone.smartthome.sdPlugin

# Rebuild and link
npm run build
npm run link
npm run restart
```

## Success Indicators

You know it's working when:
- ✅ Web config shows your controls
- ✅ UUID copied successfully
- ✅ Button shows your custom name
- ✅ Green checkmark when pressed
- ✅ Loxone device responds
- ✅ No errors in logs

Happy automating! 🏠✨
