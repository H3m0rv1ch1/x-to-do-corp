# Deployment Guide

This guide covers deploying X To-Do Corp to various platforms.

## 🚀 Quick Deploy

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/x-to-do-corp)

1. Click the button above
2. Connect your GitHub account
3. Deploy!

**Configuration**: Zero config needed, Vercel auto-detects Vite.

---

### Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/x-to-do-corp)

1. Click the button above
2. Connect your GitHub account
3. Deploy!

**Build settings**:
```
Build command: npm run build
Publish directory: dist
```

---

### GitHub Pages

1. **Install gh-pages**:
```bash
npm install --save-dev gh-pages
```

2. **Update vite.config.ts**:
```typescript
export default defineConfig({
  base: '/x-to-do-corp/', // Your repo name
  // ... rest of config
})
```

3. **Add deploy script** to package.json:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

4. **Deploy**:
```bash
npm run deploy
```

5. **Enable GitHub Pages** in repository settings:
   - Settings → Pages
   - Source: gh-pages branch

---

## 🐳 Docker Deployment

### Dockerfile

Create `Dockerfile`:
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

Create `nginx.conf`:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Build and Run

```bash
# Build image
docker build -t x-todo-corp .

# Run container
docker run -d -p 80:80 x-todo-corp

# Or use docker-compose
docker-compose up -d
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
```

---

## ☁️ Cloud Platforms

### AWS S3 + CloudFront

1. **Build the app**:
```bash
npm run build
```

2. **Create S3 bucket**:
```bash
aws s3 mb s3://x-todo-corp
aws s3 website s3://x-todo-corp --index-document index.html
```

3. **Upload files**:
```bash
aws s3 sync dist/ s3://x-todo-corp --delete
```

4. **Create CloudFront distribution** (optional for CDN)

---

### Google Cloud Storage

1. **Build the app**:
```bash
npm run build
```

2. **Create bucket**:
```bash
gsutil mb gs://x-todo-corp
gsutil web set -m index.html gs://x-todo-corp
```

3. **Upload files**:
```bash
gsutil -m rsync -r -d dist gs://x-todo-corp
```

4. **Make public**:
```bash
gsutil iam ch allUsers:objectViewer gs://x-todo-corp
```

---

### Azure Static Web Apps

1. **Install Azure CLI**
2. **Create resource**:
```bash
az staticwebapp create \
  --name x-todo-corp \
  --resource-group myResourceGroup \
  --source https://github.com/yourusername/x-todo-corp \
  --location "East US 2" \
  --branch main \
  --app-location "/" \
  --output-location "dist"
```

---

## 🔧 Environment Variables

### For Gemini API (if used)

Create `.env.local`:
```env
VITE_GEMINI_API_KEY=your_api_key_here
```

**Important**: Never commit `.env.local` to git!

### Platform-specific

**Vercel**: Add in dashboard → Settings → Environment Variables

**Netlify**: Add in dashboard → Site settings → Environment variables

**GitHub Actions**: Add as repository secrets

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Build
        run: npm run build
        env:
          VITE_GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 📊 Performance Optimization

### Before Deployment

1. **Analyze bundle**:
```bash
npm run build
npx vite-bundle-visualizer
```

2. **Optimize images** in `src/assets/`

3. **Enable compression** (gzip/brotli) on server

4. **Set cache headers** for static assets

### Vite Config Optimizations

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'icons': ['react-icons'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  }
})
```

---

## 🔍 Post-Deployment Checklist

- [ ] App loads correctly
- [ ] All routes work (no 404s)
- [ ] Theme switching works
- [ ] Data persists after refresh
- [ ] Mobile responsive
- [ ] Performance is acceptable (Lighthouse score)
- [ ] No console errors
- [ ] Analytics configured (if using)
- [ ] Error tracking configured (if using)

---

## 🆘 Troubleshooting

### Blank Page After Deploy

**Issue**: App shows blank page in production

**Solutions**:
1. Check browser console for errors
2. Verify `base` path in `vite.config.ts`
3. Check build output in `dist/`
4. Ensure all assets are uploaded

### 404 on Refresh

**Issue**: Page refreshes result in 404

**Solution**: Configure server for SPA routing
- **Netlify**: Add `_redirects` file
- **Vercel**: Add `vercel.json`
- **Nginx**: Use `try_files` directive

### Environment Variables Not Working

**Issue**: API keys not loading

**Solutions**:
1. Prefix with `VITE_`
2. Restart dev server after adding
3. Check platform-specific env var settings

---

## 📞 Support

For deployment issues:
 - Check [GitHub Issues](https://github.com/H3m0rv1ch1/x-to-do-corp/issues)
- Read platform documentation
- Open a discussion

---

Happy deploying! 🚀
