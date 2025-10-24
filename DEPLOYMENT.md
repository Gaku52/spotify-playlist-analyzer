# Deployment Guide

This guide will walk you through deploying the Spotify Playlist Analyzer to Vercel with automated GitHub Actions CI/CD.

## Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Spotify Developer account

## Step 1: Set up Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app or use existing one
3. Note your **Client ID** and **Client Secret**
4. In app settings, add redirect URIs:
   - For local development: `http://localhost:3000/api/auth/callback/spotify`
   - For production: `https://your-app-name.vercel.app/api/auth/callback/spotify` (update after deployment)

## Step 2: Deploy to Vercel (First Time)

### Option A: Via Vercel Dashboard (Recommended)

1. **Import your GitHub repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your `spotify-playlist-analyzer` repository

2. **Configure environment variables**:
   Add these in the "Environment Variables" section:

   ```
   NEXTAUTH_URL=https://your-app-name.vercel.app
   NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
   SPOTIFY_CLIENT_ID=<your-spotify-client-id>
   SPOTIFY_CLIENT_SECRET=<your-spotify-client-secret>
   SPOTIFY_REDIRECT_URI=https://your-app-name.vercel.app/api/auth/callback/spotify
   ```

3. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete
   - Note your deployment URL

4. **Update Spotify Redirect URI**:
   - Go back to Spotify Developer Dashboard
   - Add your production URL to Redirect URIs

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts and set up environment variables
```

## Step 3: Set up GitHub Actions for Automated Deployment

### Get Vercel Credentials

1. **Get Vercel Token**:
   - Go to Vercel Account Settings → [Tokens](https://vercel.com/account/tokens)
   - Create a new token
   - Copy the token

2. **Get Vercel Project IDs**:
   ```bash
   # In your project directory
   vercel link

   # View project details
   cat .vercel/project.json
   ```

   This will show your `projectId` and `orgId`.

### Add GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **New repository secret** and add:

   | Secret Name | Value | Description |
   |------------|-------|-------------|
   | `VERCEL_TOKEN` | Your Vercel token | From Vercel Account Settings |
   | `VERCEL_ORG_ID` | Your organization ID | From `.vercel/project.json` |
   | `VERCEL_PROJECT_ID` | Your project ID | From `.vercel/project.json` |
   | `NEXTAUTH_SECRET` | Generated secret | Run `openssl rand -base64 32` |
   | `SPOTIFY_CLIENT_ID` | Your Spotify Client ID | From Spotify Dashboard |
   | `SPOTIFY_CLIENT_SECRET` | Your Spotify Client Secret | From Spotify Dashboard |

## Step 4: Test Automated Deployment

1. Make a small change to your code
2. Commit and push to `master` or `main` branch:
   ```bash
   git add .
   git commit -m "Test automated deployment"
   git push origin master
   ```

3. Check GitHub Actions:
   - Go to your repository → **Actions** tab
   - You should see two workflows running:
     - ✅ **CI**: Linting and type checking
     - 🚀 **Deploy to Vercel**: Automated deployment

4. Once complete, your changes will be live at your Vercel URL!

## Workflows Overview

### CI Workflow (`.github/workflows/ci.yml`)
- Runs on every push and pull request
- Checks code quality (ESLint)
- Type checks (TypeScript)
- Builds the application

### Deploy Workflow (`.github/workflows/deploy-vercel.yml`)
- Runs on push to master/main branch
- Automatically deploys to Vercel production
- Shows deployment URL in workflow output

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXTAUTH_URL` | ✅ | Your production URL (e.g., https://your-app.vercel.app) |
| `NEXTAUTH_SECRET` | ✅ | Random secret for NextAuth.js (generate with `openssl rand -base64 32`) |
| `SPOTIFY_CLIENT_ID` | ✅ | Your Spotify application Client ID |
| `SPOTIFY_CLIENT_SECRET` | ✅ | Your Spotify application Client Secret |
| `SPOTIFY_REDIRECT_URI` | ✅ | OAuth callback URL (e.g., https://your-app.vercel.app/api/auth/callback/spotify) |

## Troubleshooting

### Deployment fails with "Invalid credentials"
- Double-check your Vercel token is correct
- Ensure token has not expired
- Verify `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` match your project

### Authentication not working
- Verify `NEXTAUTH_URL` matches your actual domain
- Ensure Spotify Redirect URI is added in Spotify Dashboard
- Check `NEXTAUTH_SECRET` is set correctly

### Build errors
- Check GitHub Actions logs for detailed error messages
- Ensure all environment variables are set in Vercel Dashboard
- Try building locally first: `npm run build`

## Monitoring Deployments

- **Vercel Dashboard**: View deployment logs and analytics
- **GitHub Actions**: Monitor CI/CD pipeline status
- **Vercel CLI**: Check deployment status with `vercel ls`

## Rolling Back

If you need to rollback to a previous version:

1. Go to Vercel Dashboard → Your Project → Deployments
2. Find the previous working deployment
3. Click "⋯" → "Promote to Production"

Or via CLI:
```bash
vercel rollback
```

## Custom Domain (Optional)

To use a custom domain:

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` and Spotify Redirect URI to use custom domain

## Next Steps

- Set up monitoring with Vercel Analytics
- Configure preview deployments for pull requests
- Add status badges to README
- Set up Vercel notifications for deployment status

For more information, see [Vercel Documentation](https://vercel.com/docs).
