"use client"

import { useState, useMemo, useEffect } from "react"
import { SpotifyPlaylist, ValidPlaylistTrack, AudioFeatures, FilterOptions } from "@/types"
import { FilterPanel } from "./filter-panel"
import { TrackList } from "./track-list"
import { StatsPanel } from "./stats-panel"
import { CreatePlaylistButton } from "./create-playlist-button"

interface PlaylistAnalyzerProps {
  playlist: SpotifyPlaylist
  tracks: Array<ValidPlaylistTrack & { audioFeatures?: AudioFeatures }>
  accessToken: string
  userId: string
}

export function PlaylistAnalyzer({
  tracks: initialTracks,
  userId
}: PlaylistAnalyzerProps) {
  const [tracks, setTracks] = useState(initialTracks)
  const [filters, setFilters] = useState<FilterOptions>({})
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false)
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingError, setLoadingError] = useState<string | null>(null)

  // Filter tracks based on current filters
  const filteredTracks = useMemo(() => {
    return tracks.filter((item) => {
      const features = item.audioFeatures
      const track = item.track

      // Audio features filters (only if audioFeatures is available)
      if (features) {
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
      }

      // Basic filters (always available)
      // Popularity filter
      if (filters.popularityMin !== undefined && track.popularity < filters.popularityMin) {
        return false
      }
      if (filters.popularityMax !== undefined && track.popularity > filters.popularityMax) {
        return false
      }

      // Duration filter
      if (filters.durationMinMs !== undefined && track.duration_ms < filters.durationMinMs) {
        return false
      }
      if (filters.durationMaxMs !== undefined && track.duration_ms > filters.durationMaxMs) {
        return false
      }

      // Explicit filter
      if (filters.explicitOnly && !track.explicit) {
        return false
      }
      if (filters.nonExplicitOnly && track.explicit) {
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
        avgPopularity: 0,
        hasAudioFeatures: false,
      }
    }

    // Check if any track has audio features
    const hasAudioFeatures = filteredTracks.some(item => item.audioFeatures !== undefined)

    const sum = filteredTracks.reduce(
      (acc, item) => ({
        tempo: acc.tempo + (item.audioFeatures?.tempo || 0),
        energy: acc.energy + (item.audioFeatures?.energy || 0),
        danceability: acc.danceability + (item.audioFeatures?.danceability || 0),
        valence: acc.valence + (item.audioFeatures?.valence || 0),
        duration: acc.duration + item.track.duration_ms,
        popularity: acc.popularity + item.track.popularity,
      }),
      { tempo: 0, energy: 0, danceability: 0, valence: 0, duration: 0, popularity: 0 }
    )

    const tracksWithFeatures = filteredTracks.filter(item => item.audioFeatures !== undefined).length

    return {
      count: filteredTracks.length,
      avgTempo: tracksWithFeatures > 0 ? sum.tempo / tracksWithFeatures : 0,
      avgEnergy: tracksWithFeatures > 0 ? sum.energy / tracksWithFeatures : 0,
      avgDanceability: tracksWithFeatures > 0 ? sum.danceability / tracksWithFeatures : 0,
      avgValence: tracksWithFeatures > 0 ? sum.valence / tracksWithFeatures : 0,
      totalDuration: sum.duration,
      avgPopularity: sum.popularity / filteredTracks.length,
      hasAudioFeatures,
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

  // Fetch audio features incrementally on client side
  useEffect(() => {
    const fetchAudioFeatures = async () => {
      // Get all track IDs that don't have audio features yet
      const tracksWithoutFeatures = initialTracks.filter(
        (track) => !track.audioFeatures && track.track.id
      )

      if (tracksWithoutFeatures.length === 0) {
        return // All tracks already have features
      }

      const trackIds = tracksWithoutFeatures
        .map((track) => track.track.id)
        .filter((id): id is string => !!id)

      console.log(`[Client] Fetching audio features for ${trackIds.length} tracks...`)
      setIsLoadingFeatures(true)
      setLoadingProgress(0)

      // Split into batches of 50
      const batchSize = 50
      const batches = []
      for (let i = 0; i < trackIds.length; i += batchSize) {
        batches.push(trackIds.slice(i, i + batchSize))
      }

      console.log(`[Client] Processing ${batches.length} batches...`)

      // Fetch features batch by batch
      const allFeatures: AudioFeatures[] = []

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]
        console.log(`[Client] Fetching batch ${i + 1}/${batches.length} (${batch.length} tracks)...`)

        try {
          console.log(`[Client] Sending request to /api/audio-features with ${batch.length} track IDs`)
          console.log(`[Client] First 3 track IDs:`, batch.slice(0, 3))

          const response = await fetch("/api/audio-features", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ trackIds: batch }),
          })

          console.log(`[Client] Response status: ${response.status} ${response.statusText}`)
          console.log(`[Client] Response headers:`, Object.fromEntries(response.headers.entries()))

          if (!response.ok) {
            const errorText = await response.text()
            console.error(`[Client] Batch ${i + 1} failed: ${response.status} - ${errorText}`)
            setLoadingError(`Failed to fetch audio features: ${response.status} ${errorText}`)
            continue
          }

          const data = await response.json()
          console.log(`[Client] ===== FULL API RESPONSE =====`)
          console.log(`[Client] Response data keys:`, Object.keys(data))
          console.log(`[Client] Response data.success:`, data.success)
          console.log(`[Client] Response data.audioFeatures type:`, typeof data.audioFeatures)
          console.log(`[Client] Response data.audioFeatures is array:`, Array.isArray(data.audioFeatures))
          console.log(`[Client] Response data.audioFeatures length:`, data.audioFeatures?.length)
          console.log(`[Client] First audio feature:`, data.audioFeatures?.[0])
          console.log(`[Client] Second audio feature:`, data.audioFeatures?.[1])
          console.log(`[Client] Third audio feature:`, data.audioFeatures?.[2])
          console.log(`[Client] Debug info:`, data.debug)
          console.log(`[Client] Full response (first 1000 chars):`, JSON.stringify(data).substring(0, 1000))
          console.log(`[Client] ===== END RESPONSE =====`)

          if (data.audioFeatures && Array.isArray(data.audioFeatures)) {
            console.log(`[Client] Processing ${data.audioFeatures.length} audio features`)
            allFeatures.push(...data.audioFeatures)

            // Update tracks with fetched features
            setTracks((prevTracks) =>
              prevTracks.map((track) => {
                const feature = data.audioFeatures.find(
                  (f: AudioFeatures) => f.id === track.track.id
                )
                return feature ? { ...track, audioFeatures: feature } : track
              })
            )

            console.log(`[Client] Batch ${i + 1}/${batches.length} complete. Total features: ${allFeatures.length}`)
          } else {
            console.error(`[Client] Batch ${i + 1} returned no audio features or not an array`)
            console.error(`[Client] data.audioFeatures value:`, data.audioFeatures)
            setLoadingError(`No audio features returned from API`)
          }
        } catch (error) {
          console.error(`[Client] Error fetching batch ${i + 1}:`, error)
          setLoadingError(`Error: ${error instanceof Error ? error.message : String(error)}`)
        }

        // Update progress
        setLoadingProgress(Math.round(((i + 1) / batches.length) * 100))

        // Add delay between batches to avoid rate limiting
        if (i < batches.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }

      setIsLoadingFeatures(false)
      console.log(`[Client] Finished fetching audio features. Total: ${allFeatures.length}`)
    }

    fetchAudioFeatures()
  }, [initialTracks])

  return (
    <div className="space-y-6">
      {/* Loading Progress */}
      {isLoadingFeatures && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Loading audio features (BPM, Key, Energy)...
            </span>
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {loadingProgress}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-blue-200 dark:bg-blue-800">
            <div
              className="h-full bg-blue-600 transition-all duration-300 dark:bg-blue-400"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Loading Error */}
      {loadingError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-start gap-2">
            <span className="text-sm font-semibold text-red-900 dark:text-red-100">Error:</span>
            <span className="text-sm text-red-800 dark:text-red-200">{loadingError}</span>
          </div>
          <div className="mt-2 text-xs text-red-700 dark:text-red-300">
            Check browser console (F12) for more details
          </div>
        </div>
      )}
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
        <FilterPanel filters={filters} onChange={setFilters} hasAudioFeatures={stats.hasAudioFeatures} />
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
