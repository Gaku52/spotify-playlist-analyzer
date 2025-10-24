import Link from "next/link"
import { SpotifyPlaylist } from "@/types"
import { Music } from "lucide-react"

interface PlaylistGridProps {
  playlists: SpotifyPlaylist[]
}

export function PlaylistGrid({ playlists }: PlaylistGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {playlists.map((playlist) => (
        <Link
          key={playlist.id}
          href={`/playlist/${playlist.id}`}
          className="group overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow-md dark:bg-zinc-900"
        >
          <div className="aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            {playlist.images?.[0]?.url ? (
              <img
                src={playlist.images[0].url}
                alt={playlist.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Music className="h-16 w-16 text-zinc-400 dark:text-zinc-600" />
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="mb-1 truncate font-semibold text-zinc-900 dark:text-zinc-50">
              {playlist.name}
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {playlist.tracks.total} tracks
            </p>
            {playlist.description && (
              <p className="mt-2 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-500">
                {playlist.description}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
