import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { createSpotifyClient } from "@/lib/spotify"
import { PlaylistAnalyzer } from "@/components/playlist/playlist-analyzer"
import { ValidPlaylistTrack } from "@/types"
import { DebugLogger } from "@/components/debug/debug-logger"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface PlaylistPageProps {
  params: Promise<{ id: string }>
}

export default async function PlaylistPage({ params }: PlaylistPageProps) {
  const { id } = await params
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
    // Check if this is the "Liked Songs" playlist
    const isLikedSongs = id === "liked"

    // Fetch playlist info and tracks
    const [playlist, allTracks] = isLikedSongs
      ? await Promise.all([
          // For Liked Songs, create a pseudo-playlist object
          Promise.resolve({
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
            tracks: { total: 0, href: "" },
            owner: {
              display_name: session.user.name || "You",
              id: session.user.id,
            },
            public: false,
            collaborative: false,
          }),
          spotify.getAllSavedTracks(),
        ])
      : await Promise.all([
          spotify.getPlaylist(id),
          spotify.getAllPlaylistTracks(id),
        ])

    // Update total for Liked Songs
    if (isLikedSongs) {
      playlist.tracks.total = allTracks.length
    }

    // Filter out tracks that are null (deleted tracks)
    const validTracks = allTracks.filter(
      (item): item is ValidPlaylistTrack =>
        item.track !== null
    )

    // Audio features will be fetched client-side to avoid timeout
    // Server only provides basic track information
    console.log(`[Playlist Page] Loaded ${validTracks.length} tracks (audio features will be fetched client-side)`)

    const tracksWithFeatures = validTracks

    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <DebugLogger />
        {/* Header */}
        <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to playlists
            </Link>
          </div>
        </header>

        {/* Playlist Header */}
        <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex gap-6">
              {playlist.images?.[0]?.url && (
                <div className="h-48 w-48 flex-shrink-0 overflow-hidden rounded-lg shadow-lg">
                  <img
                    src={playlist.images[0].url}
                    alt={playlist.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex flex-col justify-end">
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Playlist
                </p>
                <h1 className="mt-2 text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                  {playlist.name}
                </h1>
                {playlist.description && (
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                    {playlist.description}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="font-medium">{playlist.owner.display_name}</span>
                  <span>•</span>
                  <span>{playlist.tracks.total} tracks</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <PlaylistAnalyzer
            playlist={playlist}
            tracks={tracksWithFeatures}
            accessToken={session.accessToken!}
            userId={session.user.id}
          />
        </main>
      </div>
    )
  } catch (error) {
    console.error("[Playlist Page] Error fetching playlist:", error)
    console.error("[Playlist Page] Playlist ID:", id)
    console.error("[Playlist Page] Session info:", {
      hasUser: !!session?.user,
      hasAccessToken: !!session?.accessToken,
      error: session?.error,
    })

    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <DebugLogger />
        <div className="max-w-2xl text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Error loading playlist
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {error instanceof Error ? error.message : "Please try again"}
          </p>
          <div className="mt-4 rounded-lg bg-zinc-100 p-4 text-left dark:bg-zinc-800">
            <h2 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              デバッグ情報:
            </h2>
            <pre className="overflow-x-auto text-xs text-zinc-700 dark:text-zinc-300">
{`Playlist ID: ${id}
Is Liked Songs: ${id === "liked"}
Session User: ${session?.user ? "✓" : "✗"}
Access Token: ${session?.accessToken ? "✓" : "✗"}
Session Error: ${session?.error || "None"}
Error: ${error instanceof Error ? error.message : String(error)}
Stack: ${error instanceof Error ? error.stack : "N/A"}`}
            </pre>
          </div>
          <Link
            href="/dashboard"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to playlists
          </Link>
        </div>
      </div>
    )
  }
}
