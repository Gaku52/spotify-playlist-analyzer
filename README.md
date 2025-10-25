# Spotify Playlist Analyzer

A web application that analyzes your Spotify playlists based on musical characteristics like BPM, key, energy level, and more. Automatically organize your music and create new playlists tailored to your preferences.

## Features

- 🎵 **Spotify Authentication** - Secure OAuth 2.0 login
- 📊 **Audio Analysis** - Analyze BPM, key, energy, danceability, and more
- 🔍 **Smart Filtering** - Filter tracks by BPM range, key, energy level
- 📝 **Playlist Creation** - Automatically create new playlists from filtered results
- 💾 **Preset Saving** - Save your favorite filter combinations

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: NextAuth.js v5
- **API**: Spotify Web API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Spotify Developer Account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Gaku52/spotify-playlist-analyzer.git
cd spotify-playlist-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the project root:
```bash
touch .env.local
```

4. Add your Spotify credentials to `.env.local`:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Copy Client ID and Client Secret
   - Add redirect URI: `http://localhost:3000/api/auth/callback/spotify`
   - Add the following to your `.env.local` file:
   ```bash
   SPOTIFY_CLIENT_ID=your_client_id_here
   SPOTIFY_CLIENT_SECRET=your_client_secret_here
   NEXTAUTH_SECRET=your_nextauth_secret_here
   NEXTAUTH_URL=http://localhost:3000
   ```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Documentation

### 📚 Technical Specifications (日本語 / Japanese)

- **[アーキテクチャ & データフロー](./ARCHITECTURE.md)** - システム設計、API仕様、状態管理
- **[エラーハンドリング](./ERROR_HANDLING_en.md)** - エラー処理、ローディング状態 (English)
- **[パフォーマンス最適化](./PERFORMANCE_en.md)** - パフォーマンス戦略、最適化手法 (English)

### 🌐 English Documentation (Backup)

- [Architecture (English)](./ARCHITECTURE_en.md)
- [Error Handling (English)](./ERROR_HANDLING_en.md)
- [Performance (English)](./PERFORMANCE_en.md)

## Environment Variables

Required environment variables for the application:

- `SPOTIFY_CLIENT_ID` - Your Spotify application client ID
- `SPOTIFY_CLIENT_SECRET` - Your Spotify application client secret
- `NEXTAUTH_SECRET` - Secret for NextAuth.js (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your application URL (e.g., `http://localhost:3000` for development)

## Project Structure

```
spotify-playlist-analyzer/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── dashboard/         # Dashboard pages
│   ├── playlist/          # Playlist detail pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Auth components
│   ├── dashboard/        # Dashboard components
│   └── playlist/         # Playlist components
├── lib/                   # Utilities and helpers
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript type definitions
```

## Deployment

### 🚀 Hybrid CI/CD Approach (Best Practice)

This project uses a **hybrid approach** combining the best of both worlds:

1. **Vercel Git Integration** - Handles all deployments
   - Automatic deployments on push to master
   - Preview deployments for pull requests
   - Zero configuration required after setup
   - Fast, optimized builds

2. **GitHub Actions** - Code quality checks only
   - ESLint validation
   - TypeScript type checking
   - Build verification
   - No deployment secrets needed

**Benefits:**
- ✅ Fast, reliable deployments via Vercel
- ✅ Code quality enforcement via GitHub Actions
- ✅ Minimal GitHub Actions minutes usage
- ✅ Zero maintenance required

📚 **[Complete CI/CD Setup Guide](./CICD_SETUP.md)**

### Manual Deployment to Vercel

1. **Fork and clone this repository**

2. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

3. **Login to Vercel**
   ```bash
   vercel login
   ```

4. **Deploy**
   ```bash
   vercel
   ```

5. **Set up environment variables in Vercel Dashboard**:
   - `NEXTAUTH_URL` - Your production URL (e.g., https://your-app.vercel.app)
   - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
   - `SPOTIFY_CLIENT_ID` - From Spotify Developer Dashboard
   - `SPOTIFY_CLIENT_SECRET` - From Spotify Developer Dashboard
   - `SPOTIFY_REDIRECT_URI` - Your production callback URL (e.g., https://your-app.vercel.app/api/auth/callback/spotify)

6. **Update Spotify App Settings**:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Add your production callback URL to Redirect URIs

7. **Connect to Vercel Git Integration**:
   - Go to Vercel Dashboard → Settings → Git
   - Connect your GitHub repository
   - Set production branch to `master`
   - Done! Future pushes will auto-deploy

**Live URL**: [https://music.ogadix.com](https://music.ogadix.com)

**Note**: With the hybrid approach, you don't need to configure GitHub Secrets for deployment. Vercel handles everything automatically once you connect your repository.

## Roadmap

### Phase 1 (MVP) ✅ COMPLETED
- [x] Project setup
- [x] Spotify authentication
- [x] Playlist listing
- [x] Audio features analysis
- [x] Filtering functionality
- [x] Playlist creation
- [x] CI/CD with GitHub Actions
- [x] Vercel deployment configuration

### Phase 2
- [ ] Preset saving
- [ ] Supabase integration
- [ ] Dark mode toggle
- [ ] Advanced animations

### Phase 3
- [ ] iOS app development
- [ ] Cross-platform sync

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Related Projects

- [spotify-playlist-analyzer-ios](https://github.com/Gaku52/spotify-playlist-analyzer-ios) - iOS version (Coming soon)

## Author

[Gaku52](https://github.com/Gaku52)

## Acknowledgments

- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
