"use client"

import { useState, useMemo, useEffect } from "react"
import { SpotifyPlaylist, ValidPlaylistTrack, AudioFeatures, FilterOptions } from "@/types"
import { FilterPanel } from "./filter-panel"
import { TrackList } from "./track-list"
import { StatsPanel } from "./stats-panel"
import { CreatePlaylistButton } from "./create-playlist-button"
import { SpotifyPlayer, playTrack } from "./spotify-player"

interface PlaylistAnalyzerProps {
  playlist: SpotifyPlaylist
  tracks: Array<ValidPlaylistTrack & { audioFeatures?: AudioFeatures }>
  accessToken: string
  userId: string
}

export function PlaylistAnalyzer({
  tracks: initialTracks,
  userId,
  accessToken
}: PlaylistAnalyzerProps) {
  const [tracks, setTracks] = useState(initialTracks)
  const [filters, setFilters] = useState<FilterOptions>({})
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false)
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [playbackError, setPlaybackError] = useState<string | null>(null)

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

  const handlePlayTrack = async (trackUri: string) => {
    if (!deviceId) {
      setPlaybackError("Spotify player not ready. Please wait.")
      return
    }

    try {
      setPlaybackError(null)
      await playTrack(accessToken, deviceId, trackUri)
    } catch (error) {
      console.error("Error playing track:", error)
      setPlaybackError(
        error instanceof Error ? error.message : "Failed to play track"
      )
    }
  }

  // Analyze BPM from preview URLs on client side
  useEffect(() => {
    const analyzeBPM = async () => {
      // Dynamic import to avoid SSR issues
      const { analyzeBPMBatch } = await import('@/lib/bpm-analyzer')

      // Get all tracks that don't have audio features yet
      const tracksWithoutFeatures = initialTracks.filter(
        (track) => !track.audioFeatures && track.track.id
      )

      if (tracksWithoutFeatures.length === 0) {
        return // All tracks already have features
      }

      console.log(`[Client] Analyzing BPM for ${tracksWithoutFeatures.length} tracks using preview URLs...`)
      setIsLoadingFeatures(true)
      setLoadingProgress(0)

      // Prepare track list with preview URLs
      const tracksToAnalyze = tracksWithoutFeatures
        .filter((track) => track.track.preview_url)
        .map((track) => ({
          id: track.track.id,
          previewUrl: track.track.preview_url,
        }))

      const tracksWithoutPreview = tracksWithoutFeatures.length - tracksToAnalyze.length

      console.log(`[Client] ${tracksToAnalyze.length} tracks have preview URLs`)
      console.log(`[Client] ${tracksWithoutPreview} tracks do not have preview URLs`)

      if (tracksToAnalyze.length === 0) {
        setLoadingError('No preview URLs available for BPM analysis')
        setIsLoadingFeatures(false)
        return
      }

      try {
        // Analyze BPM for all tracks
        const results = await analyzeBPMBatch(tracksToAnalyze, (current, total) => {
          setLoadingProgress(Math.round((current / total) * 100))
        })

        console.log(`[Client] BPM analysis complete: ${results.size} results`)

        // Update tracks with BPM data
        setTracks((prevTracks) =>
          prevTracks.map((track) => {
            const result = results.get(track.track.id)
            if (result && result.success) {
              return {
                ...track,
                audioFeatures: {
                  id: track.track.id,
                  tempo: result.tempo,
                  // Other fields not available from preview URL analysis
                  key: -1,
                  mode: -1,
                  time_signature: 4,
                  acousticness: 0,
                  danceability: 0,
                  energy: 0,
                  instrumentalness: 0,
                  liveness: 0,
                  loudness: 0,
                  speechiness: 0,
                  valence: 0,
                },
              }
            }
            return track
          })
        )

        console.log(`[Client] Updated tracks with BPM data`)
      } catch (error) {
        console.error(`[Client] Error analyzing BPM:`, error)
        setLoadingError(`Error: ${error instanceof Error ? error.message : String(error)}`)
      }

      setIsLoadingFeatures(false)
    }

    analyzeBPM()
  }, [initialTracks])

  return (
    <div className="space-y-6">
      {/* Loading Progress */}
      {isLoadingFeatures && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Analyzing BPM from audio previews...
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
          <p className="mt-2 text-xs text-blue-800 dark:text-blue-200">
            Using 30-second previews for BPM detection. Tracks without preview URLs will be skipped.
          </p>
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

      {/* Spotify Player */}
      <SpotifyPlayer
        accessToken={accessToken}
        onReady={(id) => {
          console.log("[PlaylistAnalyzer] Player ready with device ID:", id)
          setDeviceId(id)
        }}
      />

      {/* Playback Error */}
      {playbackError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-start gap-2">
            <span className="text-sm font-semibold text-red-900 dark:text-red-100">Playback Error:</span>
            <span className="text-sm text-red-800 dark:text-red-200">{playbackError}</span>
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
        <TrackList
          tracks={filteredTracks}
          onPlayTrack={handlePlayTrack}
          canPlay={deviceId !== null}
        />
      </div>
    </div>
  )
}
