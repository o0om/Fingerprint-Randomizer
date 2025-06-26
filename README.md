# Free Your Self - Advanced Browser Fingerprint Randomizer

A powerful browser extension for advanced anti-forensic protection and browser fingerprint randomization. Built with WebAssembly for real-time spoofing and comprehensive OPSEC features.

##  Features

### Core Protection
- **Advanced Fingerprint Randomization**: 1000+ line comprehensive fingerprint randomizer
- **WebAssembly Integration**: High-performance C++ module for real-time spoofing
- **WebRTC Obfuscation**: Custom STUN/TURN server routing with DPI evasion
- **Canvas Protection**: Real-time canvas fingerprint randomization
- **WebGL Spoofing**: GPU vendor and renderer randomization
- **Audio Fingerprint Protection**: Audio context and sample rate randomization

### Anti-Detection
- **Mutation Observers**: Dynamic element monitoring and protection
- **Anti-Detection Measures**: Function name hiding and console log suppression
- **Storage Protection**: Blocked fingerprinting attempts in localStorage/sessionStorage
- **Timing Protection**: Performance.now() and Date.now() jitter injection

### Network Security
- **Request Header Modification**: User-Agent rotation and privacy headers
- **Fingerprint Library Blocking**: Automatic blocking of known fingerprinting services
- **CSP Modification**: Content Security Policy adjustments for extension compatibility
- **Privacy Settings**: Comprehensive browser privacy controls

### User Interface
- **Modern OPSEC GUI**: Professional dark theme with gradient accents
- **Real-time Status**: Live fingerprint rotation status and timing
- **Advanced Settings**: Comprehensive configuration options
- **Import/Export**: Settings backup and restore functionality

##  Installation

### Chrome/Chromium
1. Download the extension files
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The extension icon should appear in your toolbar

### Firefox
1. Download the extension files
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" tab
4. Click "Load Temporary Add-on" and select the `manifest.json` file

## 📋 Usage

### Basic Operation
1. Click the extension icon to open the popup
2. Toggle protection features on/off as needed
3. Use the "Rotate Fingerprint" button for manual rotation
4. Access advanced settings via the settings link

### Advanced Configuration
1. Open the options page for detailed settings
2. Configure custom STUN/TURN servers for WebRTC
3. Adjust noise levels for canvas and audio protection
4. Set rotation intervals and timing protection levels
5. Export/import settings for backup

### WebRTC Configuration
- Set custom STUN server: `stun:your-server.com:3478`
- Set custom TURN server: `turn:your-server.com:3478`
- Configure username/password for authenticated TURN servers

##  Technical Details

### Architecture
- **Manifest V3**: Modern extension architecture
- **Service Worker**: Background processing and network interception
- **Content Scripts**: Page-level fingerprint protection
- **WebAssembly**: High-performance C++ fingerprint generation
- **Declarative Net Request**: Network-level protection

### Fingerprint Protection
- Navigator properties (userAgent, platform, language, etc.)
- Screen properties (resolution, color depth, orientation)
- WebGL context (vendor, renderer, extensions)
- Canvas fingerprinting (toDataURL, getImageData)
- Audio fingerprinting (sample rate, channel data)
- Battery API (level, charging status, timing)
- Network information (connection type, speed)
- Geolocation and device orientation
- Timing attacks (performance.now, Date.now)

### Anti-Detection Features
- Function name obfuscation
- Console log suppression
- Storage fingerprinting prevention
- Mutation observer integration
- Dynamic element protection

##  Development

### Building WebAssembly Module
```bash
# Install Emscripten
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh

# Compile C++ to WebAssembly
emcc wasm/fingerprint_spoofer.cpp -o wasm/fingerprint_spoofer.js \
  -s WASM=1 \
  -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]' \
  -s EXPORTED_FUNCTIONS='["_main"]' \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s MODULARIZE=1 \
  -s EXPORT_NAME='FingerprintSpoofer' \
  --bind
```

### File Structure
```
free-your-self/
├── manifest.json              # Extension manifest
├── background.js              # Service worker
├── popup.html                 # Popup interface
├── popup.css                  # Popup styling
├── popup.js                   # Popup logic
├── options.html               # Options page
├── options.css                # Options styling
├── options.js                 # Options logic
├── content_scripts/
│   └── fingerprint_randomizer.js  # Main protection script
├── wasm/
│   ├── fingerprint_spoofer.cpp    # C++ source
│   ├── fingerprint_spoofer.js     # WASM wrapper
│   └── fingerprint_spoofer.wasm   # Compiled WASM
└── icons/                     # Extension icons
```

##  Security Features

### Privacy Protection
- Automatic blocking of fingerprinting libraries
- Request header modification for privacy
- Comprehensive browser privacy settings
- Storage fingerprinting prevention

### Network Security
- WebRTC IP leak prevention
- Custom STUN/TURN server support
- DPI evasion through obfuscation
- Network request interception

### Anti-Forensics
- Real-time fingerprint rotation
- Seeded randomization for consistency
- Mutation observer integration
- Dynamic protection updates

##  Performance

- **WebAssembly**: High-performance C++ fingerprint generation
- **Efficient Rotation**: 30-minute default rotation interval
- **Minimal Overhead**: Optimized for minimal performance impact
- **Memory Efficient**: Compact implementation with minimal memory usage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

##  License

This project is licensed under the MIT License - see the LICENSE file for details.

##  Disclaimer

This extension is designed for privacy protection and legitimate security research. Users are responsible for complying with applicable laws and terms of service. The developers are not responsible for any misuse of this software.

##  Support

For issues, feature requests, or questions:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting guide

---

**Free Your Self** - Advanced browser fingerprint randomization and anti-forensic protection. 
