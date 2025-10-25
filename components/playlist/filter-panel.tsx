"use client"

import { FilterOptions } from "@/types"

interface FilterPanelProps {
  filters: FilterOptions
  onChange: (filters: FilterOptions) => void
  hasAudioFeatures?: boolean
}

export function FilterPanel({ filters, onChange, hasAudioFeatures = false }: FilterPanelProps) {
  return (
    <div className="space-y-6">
      {!hasAudioFeatures && (
        <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> Audio features (BPM, Key, Energy) could not be loaded for this playlist.
            This may be due to playlist size or API rate limits. You can still filter by popularity and duration.
          </p>
        </div>
      )}
      {/* Popularity Filter */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Popularity (0-100)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="Min"
              value={filters.popularityMin ?? ""}
              onChange={(e) =>
                onChange({
                  ...filters,
                  popularityMin: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>
          <div>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="Max"
              value={filters.popularityMax ?? ""}
              onChange={(e) =>
                onChange({
                  ...filters,
                  popularityMax: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>
        </div>
      </div>

      {/* Duration Filter */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Duration (minutes)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="number"
              step="0.5"
              min="0"
              placeholder="Min"
              value={filters.durationMinMs ? filters.durationMinMs / 60000 : ""}
              onChange={(e) =>
                onChange({
                  ...filters,
                  durationMinMs: e.target.value ? Number(e.target.value) * 60000 : undefined,
                })
              }
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>
          <div>
            <input
              type="number"
              step="0.5"
              min="0"
              placeholder="Max"
              value={filters.durationMaxMs ? filters.durationMaxMs / 60000 : ""}
              onChange={(e) =>
                onChange({
                  ...filters,
                  durationMaxMs: e.target.value ? Number(e.target.value) * 60000 : undefined,
                })
              }
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>
        </div>
      </div>

      {/* Explicit Filter */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Explicit Content
        </label>
        <select
          value={filters.explicitOnly ? "explicit" : filters.nonExplicitOnly ? "clean" : "all"}
          onChange={(e) => {
            const value = e.target.value
            onChange({
              ...filters,
              explicitOnly: value === "explicit",
              nonExplicitOnly: value === "clean",
            })
          }}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        >
          <option value="all">All tracks</option>
          <option value="explicit">Explicit only</option>
          <option value="clean">Clean only</option>
        </select>
      </div>
    </div>
  )
}
