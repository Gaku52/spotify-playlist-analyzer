# CI/CD Setup Guide

This project uses a **hybrid approach** combining Vercel's GitHub integration for deployments and GitHub Actions for code quality checks.

## Architecture

```
git push to master
   ↓
   ├─ GitHub Actions (CI) - Code Quality
   │   ├─ ESLint
   │   ├─ TypeScript Type Check
   │   └─ Build Verification
   │
   └─ Vercel Git Integration - Deployment
       ├─ Production Build
       ├─ Deploy to Production
       └─ Update music.ogadix.com
```

## Why This Approach?

### ✅ Benefits

1. **Best of Both Worlds**
   - Fast, optimized deployments via Vercel
   - Code quality enforcement via GitHub Actions

2. **Zero Maintenance**
   - Vercel handles deployment automatically
   - No need to manage deployment secrets in GitHub

3. **Cost Effective**
   - Minimal GitHub Actions minutes used (CI only)
   - Vercel's free tier handles all deployments

4. **Developer Experience**
   - Automatic preview deployments for PRs
   - Deployment status comments on PRs
   - Easy rollback via Vercel dashboard

## Setup Instructions

### Step 1: Vercel GitHub Integration (Deployment)

1. Go to [Vercel Dashboard](https://vercel.com/gaku52s-projects/spotify-playlist-analyzer/settings/git)

2. Click **"Connect Git Repository"**

3. Select your repository: `Gaku52/spotify-playlist-analyzer`

4. Configure settings:
   - **Production Branch:** `master`
   - **Install Command:** `npm install`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

5. Click **"Connect"**

That's it! Now every push to `master` automatically deploys to production.

### Step 2: GitHub Actions (CI)

The CI workflow is already configured in `.github/workflows/ci.yml`.

**What it does:**
- Runs on every push and pull request
- Checks code quality (ESLint)
- Verifies TypeScript types
- Confirms the build succeeds

**No secrets needed!** The CI workflow uses test credentials for build verification only.

### Step 3: Verify Setup

1. **Check Vercel Integration:**
   ```bash
   vercel git ls
   ```

2. **Test CI:**
   - Make a small change and push
   - Check GitHub Actions tab: https://github.com/Gaku52/spotify-playlist-analyzer/actions

3. **Test Deployment:**
   - Push to master
   - Check Vercel dashboard for deployment status
   - Visit https://music.ogadix.com to verify

## How It Works

### On Every Push to Master:

1. **GitHub Actions starts CI workflow**
   - Checks code quality
   - Reports status on GitHub

2. **Vercel detects push**
   - Pulls latest code
   - Builds production bundle
   - Deploys to https://music.ogadix.com
   - Updates all domains

### On Pull Requests:

1. **GitHub Actions runs CI**
   - Ensures code quality before merge

2. **Vercel creates preview deployment**
   - Unique URL for testing changes
   - Posted as comment on PR
   - Auto-deleted when PR is merged/closed

## Monitoring

- **GitHub Actions:** https://github.com/Gaku52/spotify-playlist-analyzer/actions
- **Vercel Deployments:** https://vercel.com/gaku52s-projects/spotify-playlist-analyzer
- **Production URL:** https://music.ogadix.com

## Troubleshooting

### CI Failing

Check GitHub Actions logs:
1. Go to Actions tab
2. Click on failed workflow
3. Review error messages

### Deployment Failing

Check Vercel dashboard:
1. Go to Deployments
2. Click on failed deployment
3. Review build logs

### Environment Variables

Environment variables are managed in **Vercel Dashboard only**:
- Go to Settings → Environment Variables
- Add/update as needed
- Redeploy to apply changes

## Rollback

If you need to rollback a deployment:

1. Go to Vercel Dashboard → Deployments
2. Find the previous working deployment
3. Click "..." → "Promote to Production"

## Next Steps

- Set up Vercel Analytics for monitoring
- Add automated testing to CI workflow
- Configure deployment notifications

## Reference

- [Vercel Git Integration](https://vercel.com/docs/deployments/git)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

Last updated: 2025-10-25
