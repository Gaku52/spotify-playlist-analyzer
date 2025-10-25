"use client"

import { useEffect, useState } from "react"

interface SpotifyPlayerProps {
  accessToken: string
  onReady?: (deviceId: string) => void
}

interface SpotifyPlayerState {
  device_id: string
  message?: string
}

interface SpotifyTrack {
  name: string
  artists: Array<{ name: string }>
  album: {
    name: string
    images: Array<{ url: string }>
  }
  uri: string
  duration_ms: number
}

interface PlaybackState {
  paused: boolean
  position: number
  duration: number
  track_window: {
    current_track: SpotifyTrack
  }
}

interface SpotifyPlayer {
  addListener(event: "ready" | "not_ready", callback: (data: SpotifyPlayerState) => void): void
  addListener(
    event: "initialization_error" | "authentication_error" | "account_error" | "playback_error",
    callback: (data: { message: string }) => void
  ): void
  addListener(event: "player_state_changed", callback: (state: PlaybackState | null) => void): void
  removeListener(event: string, callback?: ((data: unknown) => void) | undefined): void
  connect(): Promise<boolean>
  disconnect(): void
  pause(): Promise<void>
  resume(): Promise<void>
  togglePlay(): Promise<void>
  getCurrentState(): Promise<PlaybackState | null>
  setVolume(volume: number): Promise<void>
  seek(position_ms: number): Promise<void>
}

interface SpotifyPlayerConstructor {
  new (options: {
    name: string
    getOAuthToken: (cb: (token: string) => void) => void
    volume?: number
  }): SpotifyPlayer
}

interface SpotifySDK {
  Player: SpotifyPlayerConstructor
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void
    Spotify: SpotifySDK
  }
}

export function SpotifyPlayer({ accessToken, onReady }: SpotifyPlayerProps) {
  const [player, setPlayer] = useState<SpotifyPlayer | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playbackState, setPlaybackState] = useState<PlaybackState | null>(null)
  const [currentPosition, setCurrentPosition] = useState(0)

  useEffect(() => {
    // Load Spotify Web Playback SDK
    const script = document.createElement("script")
    script.src = "https://sdk.scdn.co/spotify-player.js"
    script.async = true
    document.body.appendChild(script)

    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log("[Spotify Player] SDK loaded")

      const spotifyPlayer = new window.Spotify.Player({
        name: "Spotify Playlist Analyzer",
        getOAuthToken: (cb) => {
          cb(accessToken)
        },
        volume: 0.5,
      })

      // Error handling
      spotifyPlayer.addListener("initialization_error", ({ message }) => {
        console.error("[Spotify Player] Initialization error:", message)
        setError(`Initialization error: ${message}`)
      })

      spotifyPlayer.addListener("authentication_error", ({ message }) => {
        console.error("[Spotify Player] Authentication error:", message)
        setError(`Authentication error: ${message}`)
      })

      spotifyPlayer.addListener("account_error", ({ message }) => {
        console.error("[Spotify Player] Account error:", message)
        setError(`Account error: ${message}`)
      })

      spotifyPlayer.addListener("playback_error", ({ message }) => {
        console.error("[Spotify Player] Playback error:", message)
        setError(`Playback error: ${message}`)
      })

      // Ready
      spotifyPlayer.addListener("ready", ({ device_id }) => {
        console.log("[Spotify Player] Ready with Device ID:", device_id)
        setIsReady(true)
        setError(null)
        if (onReady) {
          onReady(device_id)
        }
      })

      // Not Ready
      spotifyPlayer.addListener("not_ready", ({ device_id }) => {
        console.log("[Spotify Player] Device has gone offline:", device_id)
        setIsReady(false)
      })

      // Player state changed
      spotifyPlayer.addListener("player_state_changed", (state) => {
        if (state) {
          console.log("[Spotify Player] State changed:", {
            paused: state.paused,
            position: state.position,
            track: state.track_window.current_track.name,
          })
          setPlaybackState(state)
          setCurrentPosition(state.position)
        } else {
          setPlaybackState(null)
          setCurrentPosition(0)
        }
      })

      // Connect to the player
      spotifyPlayer.connect().then((success) => {
        if (success) {
          console.log("[Spotify Player] Connected successfully")
        } else {
          console.error("[Spotify Player] Connection failed")
          setError("Failed to connect to Spotify")
        }
      })

      setPlayer(spotifyPlayer)
    }

    // Cleanup
    return () => {
      if (player) {
        console.log("[Spotify Player] Disconnecting player")
        player.disconnect()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken])

  // Update position every second when playing
  useEffect(() => {
    if (!playbackState || playbackState.paused) {
      return
    }

    const interval = setInterval(() => {
      setCurrentPosition((prev) => {
        const newPosition = prev + 1000
        // Don't exceed track duration
        if (newPosition >= playbackState.duration) {
          return playbackState.duration
        }
        return newPosition
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [playbackState])

  const handleSeek = async (position: number) => {
    if (!player) return

    try {
      await player.seek(position)
      setCurrentPosition(position)
    } catch (error) {
      console.error("[Spotify Player] Seek error:", error)
    }
  }

  const handleTogglePlay = async () => {
    if (!player) return

    try {
      await player.togglePlay()
    } catch (error) {
      console.error("[Spotify Player] Toggle play error:", error)
    }
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // If there's a playback state, show the player bar
  if (playbackState && isReady) {
    const track = playbackState.track_window.current_track
    const progress = (currentPosition / playbackState.duration) * 100

    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-screen-2xl px-4 py-3">
          {/* Track info and controls */}
          <div className="mb-2 flex items-center gap-4">
            {/* Album art */}
            {track.album.images[0] && (
              <img
                src={track.album.images[0].url}
                alt={track.album.name}
                className="h-14 w-14 rounded"
              />
            )}

            {/* Track details */}
            <div className="flex-1 min-w-0">
              <div className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                {track.name}
              </div>
              <div className="truncate text-sm text-zinc-500 dark:text-zinc-400">
                {track.artists.map((artist) => artist.name).join(", ")}
              </div>
            </div>

            {/* Play/Pause button */}
            <button
              onClick={handleTogglePlay}
              className="rounded-full bg-green-600 p-3 text-white transition-colors hover:bg-green-700"
            >
              {playbackState.paused ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              )}
            </button>
          </div>

          {/* Seek bar */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 w-10 text-right">
              {formatTime(currentPosition)}
            </span>
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max={playbackState.duration}
                value={currentPosition}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="w-full h-1 bg-zinc-300 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700"
                style={{
                  background: `linear-gradient(to right, rgb(34 197 94) 0%, rgb(34 197 94) ${progress}%, rgb(212 212 216) ${progress}%, rgb(212 212 216) 100%)`,
                }}
              />
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 w-10">
              {formatTime(playbackState.duration)}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Show initialization status
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <p className="text-sm text-red-800 dark:text-red-200">
          <strong>Playback Error:</strong> {error}
        </p>
        <p className="mt-2 text-xs text-red-700 dark:text-red-300">
          Note: Spotify Premium is required for playback functionality.
        </p>
      </div>
    )
  }

  if (!isReady) {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Initializing Spotify player...
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
      <p className="text-sm text-green-800 dark:text-green-200">
        Spotify player ready. Click play buttons to listen to tracks.
      </p>
    </div>
  )
}

export async function playTrack(
  accessToken: string,
  deviceId: string,
  trackUri: string
) {
  try {
    console.log(`[Spotify Player] Playing track: ${trackUri} on device: ${deviceId}`)

    const response = await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          uris: [trackUri],
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to play track")
    }

    console.log("[Spotify Player] Track started playing")
  } catch (error) {
    console.error("[Spotify Player] Error playing track:", error)
    throw error
  }
}
