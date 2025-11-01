# Release Guide

## Creating a New Release

### 1. Update Version Numbers

Update version in these files:
- `package.json` - "version" field
- `src-tauri/Cargo.toml` - "version" field
- `src-tauri/tauri.conf.json` - "version" field

### 2. Build and Test Locally

```bash
# Test web build
npm run build
npm run preview

# Test desktop build
npm run tauri:build
```

### 3. Commit Changes

```bash
git add .
git commit -m "Release v1.0.0"
git push origin main
```

### 4. Create Release Tag

```bash
git tag v1.0.0
git push origin v1.0.0
```

### 5. GitHub Actions

GitHub Actions will automatically:
- Build desktop installers for Windows, macOS, and Linux
- Upload artifacts to the workflow run

### 6. Create GitHub Release

1. Go to GitHub → Releases → Draft a new release
2. Choose the tag you just created
3. Add release notes
4. Download artifacts from GitHub Actions
5. Attach installers to the release
6. Publish release

## Release Checklist

- [ ] Version numbers updated
- [ ] Changelog updated
- [ ] Local builds tested
- [ ] Changes committed and pushed
- [ ] Tag created and pushed
- [ ] GitHub Actions completed successfully
- [ ] GitHub Release created with installers
- [ ] Release notes written

## Version Numbering

Follow Semantic Versioning (semver):
- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features, backwards compatible
- **Patch** (0.0.1): Bug fixes, backwards compatible
