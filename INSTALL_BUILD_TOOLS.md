# Install Visual Studio Build Tools

The build failed because Windows needs Visual Studio C++ Build Tools for Rust compilation.

## Quick Install (Recommended)

1. Download: https://aka.ms/vs/17/release/vs_BuildTools.exe

2. Run the installer

3. Select "Desktop development with C++"

4. Click Install (takes ~5-10 minutes)

5. Restart your terminal/IDE

6. Run: `npm run tauri:build`

## Alternative: Full Visual Studio

If you prefer the full IDE:
- Download Visual Studio Community: https://visualstudio.microsoft.com/downloads/
- During install, select "Desktop development with C++"

## Verify Installation

After installing, verify with:
```bash
rustc --version
```

Then rebuild:
```bash
npm run tauri:build
```

## Note

This is a one-time setup. After installing, all future builds will work fine.
