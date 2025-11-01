# NPM Scripts Documentation

This document describes all available npm scripts in the project.

## 📦 Available Scripts

### Development

#### `npm run dev`
Starts the development server with hot module replacement (HMR).

```bash
npm run dev
```

- **Port**: 3000 (configurable in `vite.config.ts`)
- **Host**: 0.0.0.0 (accessible from network)
- **Features**: 
  - Hot Module Replacement
  - Fast refresh
  - Source maps
  - TypeScript checking

**Use when**: Developing and testing features locally

---

### Building

#### `npm run build`
Creates an optimized production build.

```bash
npm run build
```

- **Output**: `dist/` folder
- **Optimizations**:
  - Minification
  - Tree-shaking
  - Code splitting
  - Asset optimization
- **TypeScript**: Compiles and type-checks

**Use when**: Preparing for deployment

---

#### `npm run preview`
Previews the production build locally.

```bash
npm run preview
```

- **Port**: 4173 (default)
- **Purpose**: Test production build before deployment
- **Note**: Run `npm run build` first

**Use when**: Testing production build locally

---

### Type Checking

#### `npm run type-check`
Runs TypeScript compiler in check mode (no emit).

```bash
npm run type-check
```

- **Checks**: Type errors across entire codebase
- **No output**: Only validates types
- **Fast**: Doesn't generate files

**Use when**: 
- Before committing code
- In CI/CD pipeline
- Debugging type issues

---

### Linting (if configured)

#### `npm run lint`
Runs ESLint to check code quality.

```bash
npm run lint
```

**Use when**: Ensuring code quality standards

---

## 🔧 Custom Scripts

You can add custom scripts to `package.json`:

```json
{
  "scripts": {
    "clean": "rm -rf dist node_modules",
    "reinstall": "npm run clean && npm install",
    "analyze": "vite-bundle-visualizer"
  }
}
```

## 🚀 Deployment Scripts

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

### GitHub Pages
```bash
# Build
npm run build

# Deploy (using gh-pages package)
npm run deploy
```

## 🐳 Docker Scripts

If using Docker:

```bash
# Build image
docker build -t x-todo-corp .

# Run container
docker run -p 3000:3000 x-todo-corp
```

## 📊 Performance Scripts

### Bundle Analysis
```bash
# Install analyzer
npm install --save-dev rollup-plugin-visualizer

# Add to vite.config.ts and build
npm run build
```

## 🧪 Testing Scripts (Future)

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

## 🔄 CI/CD Pipeline

Example GitHub Actions workflow:

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run type-check
      - run: npm run build
```

## 💡 Tips

1. **Use `npm ci`** in CI/CD instead of `npm install` for reproducible builds
2. **Run type-check** before committing to catch errors early
3. **Test preview build** before deploying to production
4. **Keep dependencies updated** with `npm outdated` and `npm update`

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- --port 3001
```

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Type Errors
```bash
# Check specific file
npx tsc --noEmit src/components/MyComponent.tsx

# Generate declaration files
npx tsc --declaration --emitDeclarationOnly
```

---

For more information, see the [Vite documentation](https://vitejs.dev/).
