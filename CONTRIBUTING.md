# Contributing to X To-Do Corp

Thank you for considering contributing! This project welcomes issues, feature requests, and pull requests.

## How to Contribute

- Check existing issues and discussions to avoid duplicates.
- Open an issue describing the problem or proposal before large changes.
- Fork the repo and create a feature branch from `main`.
- Keep changes focused and well-scoped.
- Write clear commit messages (imperative tone): `feat: add accent picker to settings`.
- Ensure the app builds locally: `npm install && npm run build`.
- Open a PR with a concise description, screenshots if UI changes, and link to the issue.

## Local Development

```bash
npm install
npm run dev
```

Optional AI features:

Create `.env` or `.env.local` and set `GEMINI_API_KEY=your_api_key_here`.

## Code Style

- TypeScript with strict types where practical.
- Keep components small and readable; prefer composition over complexity.
- Use Tailwind utility classes and provided CSS variables for consistent theming.
- Avoid large dependencies for simple tasks.

## Testing & QA

- Manually verify critical flows: add/edit/delete todos, filters, notes, calendar, focus mode.
- For UI changes, include screenshots or short clips in the PR.

## Release & Versioning

- This project uses semantic versioning.
- Maintainers will tag releases after merging significant changes.

## Community

Please read the [Code of Conduct](CODE_OF_CONDUCT.md). Be respectful, constructive, and inclusive.