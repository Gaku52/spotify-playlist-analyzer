"use client"

import { FilterOptions } from "@/types"

interface FilterPanelProps {
  filters: FilterOptions
  onChange: (filters: FilterOptions) => void
}

const KEYS = [
  { value: 0, label: "C" },
  { value: 1, label: "C♯/D♭" },
  { value: 2, label: "D" },
  { value: 3, label: "D♯/E♭" },
  { value: 4, label: "E" },
  { value: 5, label: "F" },
  { value: 6, label: "F♯/G♭" },
  { value: 7, label: "G" },
  { value: 8, label: "G♯/A♭" },
  { value: 9, label: "A" },
  { value: 10, label: "A♯/B♭" },
  { value: 11, label: "B" },
]

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  return (
    <div className="space-y-6">
      {/* BPM Filter */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          BPM (Tempo)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="number"
              placeholder="Min"
              value={filters.bpmMin ?? ""}
              onChange={(e) =>
                onChange({
                  ...filters,
                  bpmMin: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Max"
              value={filters.bpmMax ?? ""}
              onChange={(e) =>
                onChange({
                  ...filters,
                  bpmMax: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>
        </div>
      </div>

      {/* Key Filter */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Musical Key
        </label>
        <select
          value={filters.key ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              key: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        >
          <option value="">All keys</option>
          {KEYS.map((key) => (
            <option key={key.value} value={key.value}>
              {key.label}
            </option>
          ))}
        </select>
      </div>

      {/* Energy Filter */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Energy (0-1)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              placeholder="Min"
              value={filters.energyMin ?? ""}
              onChange={(e) =>
                onChange({
                  ...filters,
                  energyMin: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>
          <div>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              placeholder="Max"
              value={filters.energyMax ?? ""}
              onChange={(e) =>
                onChange({
                  ...filters,
                  energyMax: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>
        </div>
      </div>

      {/* Danceability Filter */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Danceability (0-1)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              placeholder="Min"
              value={filters.danceabilityMin ?? ""}
              onChange={(e) =>
                onChange({
                  ...filters,
                  danceabilityMin: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>
          <div>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              placeholder="Max"
              value={filters.danceabilityMax ?? ""}
              onChange={(e) =>
                onChange({
                  ...filters,
                  danceabilityMax: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>
        </div>
      </div>

      {/* Valence Filter */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Valence/Mood (0-1)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              placeholder="Min"
              value={filters.valenceMin ?? ""}
              onChange={(e) =>
                onChange({
                  ...filters,
                  valenceMin: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>
          <div>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              placeholder="Max"
              value={filters.valenceMax ?? ""}
              onChange={(e) =>
                onChange({
                  ...filters,
                  valenceMax: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
