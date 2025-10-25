import { ValidPlaylistTrack, AudioFeatures } from "@/types"

interface TrackListProps {
  tracks: Array<ValidPlaylistTrack & { audioFeatures: AudioFeatures }>
}

const KEYS = ["C", "C♯/D♭", "D", "D♯/E♭", "E", "F", "F♯/G♭", "G", "G♯/A♭", "A", "A♯/B♭", "B"]

function formatDuration(ms: number) {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export function TrackList({ tracks }: TrackListProps) {
  if (tracks.length === 0) {
    return (
      <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">
        No tracks match the current filters
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              #
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Track
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Artist
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              BPM
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Key
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Energy
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Dance
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Duration
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {tracks.map((item, index) => (
            <tr
              key={item.track.id}
              className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                {index + 1}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {item.track.album.images[0]?.url && (
                    <img
                      src={item.track.album.images[0].url}
                      alt={item.track.album.name}
                      className="h-10 w-10 rounded"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                      {item.track.name}
                    </div>
                    <div className="truncate text-sm text-zinc-500 dark:text-zinc-400">
                      {item.track.album.name}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                {item.track.artists.map((artist) => artist.name).join(", ")}
              </td>
              <td className="px-4 py-3 text-center text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {Math.round(item.audioFeatures.tempo)}
              </td>
              <td className="px-4 py-3 text-center text-sm text-zinc-700 dark:text-zinc-300">
                {KEYS[item.audioFeatures.key] || "?"}
              </td>
              <td className="px-4 py-3 text-center text-sm text-zinc-700 dark:text-zinc-300">
                {(item.audioFeatures.energy * 100).toFixed(0)}%
              </td>
              <td className="px-4 py-3 text-center text-sm text-zinc-700 dark:text-zinc-300">
                {(item.audioFeatures.danceability * 100).toFixed(0)}%
              </td>
              <td className="px-4 py-3 text-right text-sm text-zinc-500 dark:text-zinc-400">
                {formatDuration(item.track.duration_ms)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
