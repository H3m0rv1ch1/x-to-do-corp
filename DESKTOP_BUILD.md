# Desktop Build Guide (Electron)

## Prerequisites

- Node.js 18+ installed
- npm or yarn

## Environment Setup

1. Create your `.env` file in the project root with your API keys:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_key
GEMINI_API_KEY=your_gemini_key
```

## Install Dependencies

```bash
npm install
```

## Development

Run the desktop app in development mode:
```bash
npm run electron:dev
```

This will:
- Start the Vite dev server on port 3000
- Launch the Electron window once the server is ready
- Enable hot-reload for the frontend
- Open DevTools automatically

## Building

### Build for your current platform:
```bash
npm run electron:build
```

### Output locations:
- **Windows (NSIS installer)**: `release/X To-Do Corp Setup x.x.x.exe`
- **Windows (Portable)**: `release/X To-Do Corp x.x.x.exe`
- **macOS (DMG)**: `release/X To-Do Corp-x.x.x.dmg`
- **macOS (ZIP)**: `release/X To-Do Corp-x.x.x-mac.zip`
- **Linux (AppImage)**: `release/X To-Do Corp-x.x.x.AppImage`
- **Linux (DEB)**: `release/x-todo-corp_x.x.x_amd64.deb`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server only |
| `npm run electron:dev` | Start dev server + Electron |
| `npm run electron:start` | Start Electron with existing build |
| `npm run electron:build` | Build app + create installers |
| `npm run build` | Build web version only |

## Troubleshooting

### "Cannot find module 'electron'"
Run `npm install` to install dependencies.

### White screen on launch
Make sure the Vite dev server is running on port 3000, or build the app first.

### Build fails
- Ensure you have enough disk space
- Try deleting `node_modules` and `release` folders, then run `npm install` again

## Configuration

Edit `package.json` under the `"build"` section to customize:
- App ID and name
- Icons for each platform
- Installer options
- Target platforms

Edit `electron/main.js` to customize:
- Window size and behavior
- Menu options
- DevTools settings
