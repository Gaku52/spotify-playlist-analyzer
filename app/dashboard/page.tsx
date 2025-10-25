import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { createSpotifyClient } from "@/lib/spotify"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { PlaylistGrid } from "@/components/dashboard/playlist-grid"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/")
  }

  if (session.error === "RefreshAccessTokenError") {
    redirect("/")
  }

  if (!session.accessToken) {
    console.error("Access token is missing from session")
    redirect("/")
  }

  const spotify = createSpotifyClient(session.accessToken)

  try {
    const [user, playlists, savedTracks] = await Promise.all([
      spotify.getCurrentUser(),
      spotify.getUserPlaylists(50, 0),
      spotify.getSavedTracks(1, 0), // Get just the total count
    ])

    // Create a pseudo-playlist for Liked Songs
    const likedSongsPlaylist = {
      id: "liked",
      name: "Liked Songs",
      description: "Your favorite tracks",
      images: [
        {
          url: "https://misc.scdn.co/liked-songs/liked-songs-640.png",
          height: 640,
          width: 640,
        },
      ],
      tracks: {
        total: savedTracks.total,
        href: "",
      },
      owner: {
        display_name: user.display_name,
        id: user.id,
      },
      public: false,
      collaborative: false,
    }

    // Combine Liked Songs with user playlists
    const allPlaylists = [likedSongsPlaylist, ...playlists.items]

    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        {/* Header */}
        <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  {user.images?.[0]?.url && (
                    <img
                      src={user.images[0].url}
                      alt={user.display_name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {user.display_name}
                  </h1>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {savedTracks.total} liked songs • {playlists.total} playlists
                  </p>
                </div>
              </div>
              <SignOutButton />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Your Music
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Select a playlist or your liked songs to analyze and filter tracks
            </p>
          </div>

          <PlaylistGrid playlists={allPlaylists} />
        </main>
      </div>
    )
  } catch (error) {
    console.error("Error fetching data:", error)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Error loading playlists
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Please try signing in again
          </p>
          <div className="mt-4">
            <SignOutButton />
          </div>
        </div>
      </div>
    )
  }
}
