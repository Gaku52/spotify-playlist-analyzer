interface StatsPanelProps {
  stats: {
    count: number
    avgTempo: number
    avgEnergy: number
    avgDanceability: number
    avgValence: number
    totalDuration: number
  }
  totalTracks: number
}

function formatDuration(ms: number) {
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

export function StatsPanel({ stats, totalTracks }: StatsPanelProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Tracks
        </div>
        <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {stats.count}
        </div>
        <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
          of {totalTracks} total
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Avg BPM
        </div>
        <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {stats.count > 0 ? Math.round(stats.avgTempo) : "-"}
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Avg Energy
        </div>
        <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {stats.count > 0 ? (stats.avgEnergy * 100).toFixed(0) : "-"}%
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Avg Dance
        </div>
        <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {stats.count > 0 ? (stats.avgDanceability * 100).toFixed(0) : "-"}%
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Avg Mood
        </div>
        <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {stats.count > 0 ? (stats.avgValence * 100).toFixed(0) : "-"}%
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Duration
        </div>
        <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {stats.count > 0 ? formatDuration(stats.totalDuration) : "-"}
        </div>
      </div>
    </div>
  )
}
