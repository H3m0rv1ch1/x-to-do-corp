# X To-Do Corp

A sleek, X-inspired to-do list app with modern UI, keyboard shortcuts, and optional AI assistance (Gemini) to help you plan faster.

<p align="center">
  <img src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" alt="Project banner" width="100%" />
</p>

## Features

- Clean, responsive UI with dark/light themes and accent color picker
- Fast list management: important flags, priorities, subtasks, tags, due dates
- Notes with basic formatting and pinning
- Calendar with per-day tasks and notes overview
- Focus mode with sessions, ambient sounds, and notifications
- Keyboard shortcuts for navigation and quick actions
- Optional AI suggestions via Google Gemini

## Tech Stack

- `React` + `TypeScript`
- `Vite` for dev/build
- `lucide-react` for icons
- Tailwind classes via CDN and custom CSS variables

## Getting Started

### Prerequisites

- `Node.js >= 18`

### Installation

```bash
npm install
```

### Environment Setup (Optional AI)

If you want AI suggestions, create a `.env` or `.env.local` file in the project root and set:

```bash
GEMINI_API_KEY=your_api_key_here
```

This is read by `vite.config.ts` and injected as `process.env.API_KEY`.

### Run Locally

```bash
npm run dev
```

The dev server runs on `http://localhost:3000` by default (configured in `vite.config.ts`).

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Keyboard Shortcuts

- Global: `N` new task, `/` focus search, `?` shortcuts
- Navigation: `H` home, `P` profile, `C` calendar, `O` notes, `S` settings

## Project Structure

- `components/` reusable UI and pages
- `contexts/AppContext.tsx` app state and actions
- `utils/` helpers
- `types.ts` shared types
- `vite.config.ts` dev server and env injection

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

- Icons by [lucide.dev](https://lucide.dev)
- Tailwind CDN
- Google Gemini API for optional AI suggestions
