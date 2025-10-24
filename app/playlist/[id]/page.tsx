import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { createSpotifyClient } from "@/lib/spotify"
import { PlaylistAnalyzer } from "@/components/playlist/playlist-analyzer"
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

  const spotify = createSpotifyClient(session.accessToken!)

  try {
    const [playlist, allTracks] = await Promise.all([
      spotify.getPlaylist(id),
      spotify.getAllPlaylistTracks(id),
    ])

    // Get audio features for all tracks
    const trackIds = allTracks
      .map((item) => item.track?.id)
      .filter((id): id is string => !!id)

    const audioFeatures = await spotify.getAudioFeatures(trackIds)

    // Combine tracks with audio features
    const tracksWithFeatures = allTracks
      .map((item) => {
        const features = audioFeatures.find((f) => f.id === item.track?.id)
        return features ? { ...item, audioFeatures: features } : null
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)

    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
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
    console.error("Error fetching playlist:", error)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Error loading playlist
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {error instanceof Error ? error.message : "Please try again"}
          </p>
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
