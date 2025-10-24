"use client"

import { useState, useMemo } from "react"
import { SpotifyPlaylist, PlaylistTrack, AudioFeatures, FilterOptions } from "@/types"
import { FilterPanel } from "./filter-panel"
import { TrackList } from "./track-list"
import { StatsPanel } from "./stats-panel"
import { CreatePlaylistButton } from "./create-playlist-button"

interface PlaylistAnalyzerProps {
  playlist: SpotifyPlaylist
  tracks: Array<PlaylistTrack & { audioFeatures: AudioFeatures }>
  accessToken: string
  userId: string
}

export function PlaylistAnalyzer({
  tracks,
  userId
}: PlaylistAnalyzerProps) {
  const [filters, setFilters] = useState<FilterOptions>({})
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false)

  // Filter tracks based on current filters
  const filteredTracks = useMemo(() => {
    return tracks.filter((item) => {
      const features = item.audioFeatures

      // BPM filter
      if (filters.bpmMin !== undefined && features.tempo < filters.bpmMin) {
        return false
      }
      if (filters.bpmMax !== undefined && features.tempo > filters.bpmMax) {
        return false
      }

      // Key filter
      if (filters.key !== undefined && features.key !== filters.key) {
        return false
      }

      // Energy filter
      if (filters.energyMin !== undefined && features.energy < filters.energyMin) {
        return false
      }
      if (filters.energyMax !== undefined && features.energy > filters.energyMax) {
        return false
      }

      // Danceability filter
      if (filters.danceabilityMin !== undefined && features.danceability < filters.danceabilityMin) {
        return false
      }
      if (filters.danceabilityMax !== undefined && features.danceability > filters.danceabilityMax) {
        return false
      }

      // Valence filter
      if (filters.valenceMin !== undefined && features.valence < filters.valenceMin) {
        return false
      }
      if (filters.valenceMax !== undefined && features.valence > filters.valenceMax) {
        return false
      }

      return true
    })
  }, [tracks, filters])

  // Calculate statistics for filtered tracks
  const stats = useMemo(() => {
    if (filteredTracks.length === 0) {
      return {
        count: 0,
        avgTempo: 0,
        avgEnergy: 0,
        avgDanceability: 0,
        avgValence: 0,
        totalDuration: 0,
      }
    }

    const sum = filteredTracks.reduce(
      (acc, item) => ({
        tempo: acc.tempo + item.audioFeatures.tempo,
        energy: acc.energy + item.audioFeatures.energy,
        danceability: acc.danceability + item.audioFeatures.danceability,
        valence: acc.valence + item.audioFeatures.valence,
        duration: acc.duration + item.track.duration_ms,
      }),
      { tempo: 0, energy: 0, danceability: 0, valence: 0, duration: 0 }
    )

    return {
      count: filteredTracks.length,
      avgTempo: sum.tempo / filteredTracks.length,
      avgEnergy: sum.energy / filteredTracks.length,
      avgDanceability: sum.danceability / filteredTracks.length,
      avgValence: sum.valence / filteredTracks.length,
      totalDuration: sum.duration,
    }
  }, [filteredTracks])

  const handleCreatePlaylist = async (name: string, description: string) => {
    setIsCreatingPlaylist(true)
    try {
      const trackUris = filteredTracks.map((item) => item.track.uri)

      const response = await fetch("/api/playlists/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          trackUris,
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create playlist")
      }

      const data = await response.json()

      // Open the created playlist in Spotify
      if (data.externalUrl) {
        window.open(data.externalUrl, "_blank")
      }

      return data
    } catch (error) {
      console.error("Error creating playlist:", error)
      throw error
    } finally {
      setIsCreatingPlaylist(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Panel */}
      <StatsPanel stats={stats} totalTracks={tracks.length} />

      {/* Filter Panel */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Filters
          </h2>
          <button
            onClick={() => setFilters({})}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Reset all
          </button>
        </div>
        <FilterPanel filters={filters} onChange={setFilters} />
      </div>

      {/* Create Playlist Button */}
      {filteredTracks.length > 0 && (
        <div className="flex justify-end">
          <CreatePlaylistButton
            onCreatePlaylist={handleCreatePlaylist}
            trackCount={filteredTracks.length}
            isLoading={isCreatingPlaylist}
          />
        </div>
      )}

      {/* Track List */}
      <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 p-6 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Tracks ({filteredTracks.length})
          </h2>
        </div>
        <TrackList tracks={filteredTracks} />
      </div>
    </div>
  )
}
