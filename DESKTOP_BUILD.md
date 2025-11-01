# Desktop Build Guide

## Prerequisites

### Windows
1. Install [Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
2. Install [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (usually pre-installed on Windows 10/11)
3. Install [Rust](https://www.rust-lang.org/tools/install)

### macOS
```bash
xcode-select --install
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

## Environment Setup

1. Copy your environment variables:
```bash
cp .env.local src-tauri/.env.local
```

2. Edit `src-tauri/.env.local` and add your Gemini API key:
```
GEMINI_API_KEY=your_actual_api_key_here
```

## Development

Run the desktop app in development mode:
```bash
npm run tauri:dev
```

This will:
- Start the Vite dev server
- Launch the Tauri window
- Enable hot-reload for both frontend and backend

## Building

### Build for your current platform:
```bash
npm run tauri:build
```

### Output locations:
- **Windows**: `src-tauri/target/release/bundle/msi/X To-Do Corp_1.0.0_x64_en-US.msi`
- **Windows (NSIS)**: `src-tauri/target/release/bundle/nsis/X To-Do Corp_1.0.0_x64-setup.exe`
- **macOS**: `src-tauri/target/release/bundle/dmg/X To-Do Corp_1.0.0_x64.dmg`
- **Linux**: `src-tauri/target/release/bundle/deb/x-todo-corp_1.0.0_amd64.deb`
- **Linux (AppImage)**: `src-tauri/target/release/bundle/appimage/x-todo-corp_1.0.0_amd64.AppImage`

## Build Options

### Debug build (faster, larger):
```bash
npm run tauri build -- --debug
```

### Specific bundle format:
```bash
# Windows MSI only
npm run tauri build -- --bundles msi

# macOS DMG only
npm run tauri build -- --bundles dmg

# Linux DEB only
npm run tauri build -- --bundles deb
```

## Troubleshooting

### "Rust not found"
Install Rust: https://www.rust-lang.org/tools/install

### "WebView2 not found" (Windows)
Download and install: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

### Build fails on first try
Run again - Rust dependencies take time to compile on first build

### App won't start
Check that your `.env.local` file exists in `src-tauri/` directory

## App Size

- **Tauri**: ~3-5 MB (uses system webview)
- **Electron equivalent**: ~50-100 MB (bundles Chromium)

## Features

The desktop app includes:
- Native window controls
- System tray integration (optional)
- Native notifications
- File system access
- Better performance than web version
- Smaller memory footprint
- Auto-updates (can be configured)

## Configuration

Edit `src-tauri/tauri.conf.json` to customize:
- Window size and behavior
- App icons
- Bundle settings
- Security policies
- System tray options
