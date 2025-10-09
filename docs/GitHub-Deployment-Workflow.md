# Project INGOT - GitHub Deployment Workflow

## Overview

This document explains how to use GitHub with Project INGOT for version control, collaboration, and automated deployment to Azure Static Web Apps.

---

## 🔗 Connecting to GitHub from Lovable

### Option 1: Create New Repository from Lovable

1. **In Lovable Editor**:
   - Click the **GitHub** button in the top-right corner
   - Select **Connect to GitHub**
   - Authorize the Lovable GitHub App
   - Select your GitHub account/organization
   - Click **Create Repository**

2. **Repository Created**:
   - Lovable automatically creates a new repository
   - Initial commit includes all current code
   - Repository is connected for bidirectional sync

### Option 2: Connect Existing Repository

> **Note**: Direct import is not currently supported. Use this workaround:

1. Create a new Lovable project
2. Connect to GitHub (creates new repo)
3. Manually copy your existing code to the new repo
4. Push to GitHub

---

## 🔄 Bidirectional Sync

### How It Works

Lovable features **real-time two-way sync** with GitHub:

- **Lovable → GitHub**: Changes made in Lovable automatically push to GitHub
- **GitHub → Lovable**: Changes pushed to GitHub automatically sync to Lovable
- No manual pull/push required

### What Gets Synced

✅ **Synced Automatically**:
- All source code files (`src/`)
- Configuration files
- Documentation files (`docs/`)
- Package dependencies
- Public assets

❌ **Not Synced**:
- `node_modules/` (regenerated on install)
- Build artifacts (`dist/`)
- Environment variables (`.env.local`)
- IDE-specific files

---

## 🌿 Branch Management

### Working with Branches

Lovable has **experimental support** for Git branches:

1. **Enable Branch Switching**:
   - Go to **Account Settings** > **Labs**
   - Enable **GitHub Branch Switching**

2. **Create Feature Branches**:
   ```bash
   # In your local clone or GitHub UI
   git checkout -b feature/new-inspection-type
   git push origin feature/new-inspection-type
   ```

3. **Switch Branches in Lovable**:
   - Use the branch selector in Lovable UI
   - Changes automatically sync to selected branch

### Recommended Branch Strategy

```
main (production)
├── develop (integration)
    ├── feature/add-new-checklist
    ├── feature/improve-search
    └── bugfix/authentication-issue
```

**Workflow**:
1. Create feature branches from `develop`
2. Make changes in Lovable or local IDE
3. Create Pull Request to `develop`
4. Review and test
5. Merge to `develop`
6. Periodically merge `develop` → `main` for releases

---

## 👥 Parallel Development

### Working with Multiple Developers

You can develop using **Lovable AND local IDE** simultaneously:

1. **Developer A** (using Lovable):
   - Makes changes in Lovable UI
   - Changes auto-push to GitHub

2. **Developer B** (using local IDE):
   - Clones repository
   - Makes changes locally
   - Pushes to GitHub
   - Changes auto-sync to Lovable

### Best Practices

✅ **Do**:
- Communicate with team about what you're working on
- Use separate branches for different features
- Pull latest changes before starting work
- Commit frequently with clear messages

❌ **Don't**:
- Edit the same files simultaneously without coordination
- Push directly to `main` without review
- Ignore merge conflicts

---

## 🚀 Automated Deployment to Azure

### Setup GitHub Actions for Azure Static Web Apps

1. **Create GitHub Actions Workflow**

Create `.github/workflows/azure-static-web-apps.yml`:

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_AZURE_TENANT_ID: ${{ secrets.VITE_AZURE_TENANT_ID }}
          VITE_AZURE_CLIENT_ID: ${{ secrets.VITE_AZURE_CLIENT_ID }}
          VITE_SHAREPOINT_SITE_URL: ${{ secrets.VITE_SHAREPOINT_SITE_URL }}
          VITE_FLOW_CREATE_FOLDER: ${{ secrets.VITE_FLOW_CREATE_FOLDER }}
          VITE_FLOW_GENERATE_DOC: ${{ secrets.VITE_FLOW_GENERATE_DOC }}
          VITE_FLOW_UPLOAD_DOC: ${{ secrets.VITE_FLOW_UPLOAD_DOC }}

      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: ""
          output_location: "dist"

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

2. **Configure GitHub Secrets**

In your GitHub repository:
- Go to **Settings** > **Secrets and variables** > **Actions**
- Add the following secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Azure deployment token | `[from Azure Portal]` |
| `VITE_AZURE_TENANT_ID` | Azure AD tenant ID | `12345678-1234-...` |
| `VITE_AZURE_CLIENT_ID` | Azure AD client ID | `87654321-4321-...` |
| `VITE_SHAREPOINT_SITE_URL` | SharePoint site URL | `https://company.sharepoint.com/sites/ProjectINGOT` |
| `VITE_FLOW_CREATE_FOLDER` | Power Automate flow URL | `https://prod-xx...` |
| `VITE_FLOW_GENERATE_DOC` | Power Automate flow URL | `https://prod-xx...` |
| `VITE_FLOW_UPLOAD_DOC` | Power Automate flow URL | `https://prod-xx...` |

3. **Get Azure Deployment Token**

```bash
# Using Azure CLI
az staticwebapp secrets list --name project-ingot --query "properties.apiKey"
```

Or get it from Azure Portal:
- Go to your Static Web App
- Click **Manage deployment token**
- Copy the token

### Deployment Triggers

**Automatic Deployment**:
- ✅ Push to `main` branch → Deploys to production
- ✅ Pull Request opened → Creates preview deployment
- ✅ Pull Request updated → Updates preview deployment
- ✅ Pull Request closed → Removes preview deployment

**Manual Deployment**:
```bash
# Trigger workflow manually from GitHub UI
# Go to Actions > Select workflow > Run workflow
```

---

## 🔍 Monitoring Deployments

### View Deployment Status

1. **In GitHub**:
   - Go to **Actions** tab
   - View workflow runs
   - Check build logs
   - See deployment status

2. **In Azure Portal**:
   - Navigate to your Static Web App
   - Click **Deployment History**
   - View deployment details
   - Check for errors

### Deployment Notifications

Configure notifications in GitHub:
- Go to **Settings** > **Notifications**
- Enable notifications for:
  - Failed workflows
  - Successful deployments (optional)

---

## 🛠️ Local Development with GitHub

### Clone and Setup

```bash
# Clone the repository
git clone https://github.com/your-org/project-ingot.git
cd project-ingot

# Install dependencies
npm install

# Create local environment file
cp .env.example .env.local
# Edit .env.local with your values

# Start development server
npm run dev
```

### Development Workflow

```bash
# Create feature branch
git checkout -b feature/my-new-feature

# Make changes...
# Changes in Lovable will auto-sync here

# Commit changes (if made locally)
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin feature/my-new-feature

# Create Pull Request on GitHub
```

### Keeping in Sync

```bash
# Pull latest changes
git checkout main
git pull origin main

# Merge into your feature branch
git checkout feature/my-new-feature
git merge main

# Resolve any conflicts
# Push updated branch
git push origin feature/my-new-feature
```

---

## 📦 Release Management

### Creating a Release

1. **Merge to Main**:
   ```bash
   # After PR approval
   git checkout main
   git pull origin main
   ```

2. **Tag the Release**:
   ```bash
   git tag -a v2.5.0 -m "Release version 2.5.0"
   git push origin v2.5.0
   ```

3. **Create GitHub Release**:
   - Go to GitHub > **Releases**
   - Click **Draft a new release**
   - Select your tag
   - Add release notes
   - Publish release

### Version Numbering

Follow Semantic Versioning (SemVer):
- **Major** (v3.0.0): Breaking changes
- **Minor** (v2.5.0): New features, backwards compatible
- **Patch** (v2.5.1): Bug fixes

---

## 🔄 Rollback Procedures

### Rollback in Lovable

1. Click the project name > **Version History**
2. Find the version before the issue
3. Click **Restore** button
4. Changes sync to GitHub automatically

### Rollback in GitHub

```bash
# Find the commit to rollback to
git log --oneline

# Create revert commit
git revert <commit-hash>

# Or reset to previous commit (use with caution)
git reset --hard <commit-hash>
git push origin main --force
```

### Rollback in Azure

1. Go to Azure Portal > Static Web App
2. Click **Deployment History**
3. Find previous successful deployment
4. Click **Redeploy**

---

## 🔐 Security Best Practices

### Protecting Secrets

✅ **Do**:
- Store secrets in GitHub Secrets
- Use `.env.local` for local development
- Add `.env.local` to `.gitignore`
- Rotate secrets periodically

❌ **Don't**:
- Commit secrets to repository
- Share secrets in chat or email
- Use production secrets in development
- Hardcode credentials in code

### Branch Protection

Configure in GitHub Settings > Branches:
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Include administrators in restrictions

---

## 🆘 Troubleshooting

### Common Issues

**Issue**: Changes in Lovable not syncing to GitHub
- **Solution**: Check GitHub connection status, reconnect if needed

**Issue**: GitHub Actions deployment failing
- **Solution**: Check secrets are configured, review build logs

**Issue**: Merge conflicts
- **Solution**: Pull latest changes, resolve conflicts locally, push

**Issue**: Preview deployment not working
- **Solution**: Check PR is from allowed branch, verify workflow file

### Getting Help

- **Lovable Documentation**: [docs.lovable.dev](https://docs.lovable.dev/)
- **GitHub Actions Docs**: [docs.github.com/actions](https://docs.github.com/actions)
- **Azure Static Web Apps Docs**: [docs.microsoft.com/azure/static-web-apps](https://docs.microsoft.com/azure/static-web-apps)
- **Project INGOT Support**: [Your support contact]

---

## 📚 Additional Resources

### Useful Commands

```bash
# View current branch
git branch

# View remote URL
git remote -v

# View commit history
git log --oneline --graph --all

# Check status
git status

# View changes
git diff

# Stash changes
git stash
git stash pop
```

### Helpful Git Aliases

Add to `~/.gitconfig`:
```ini
[alias]
    st = status
    co = checkout
    br = branch
    cm = commit -m
    lg = log --oneline --graph --all
```

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-09  
**Next Review**: Quarterly or when GitHub/Azure features change
