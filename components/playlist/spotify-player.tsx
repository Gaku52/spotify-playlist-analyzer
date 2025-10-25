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

interface SpotifyPlayer {
  addListener(event: string, callback: (data: SpotifyPlayerState) => void): void
  removeListener(event: string, callback?: (data: SpotifyPlayerState) => void): void
  connect(): Promise<boolean>
  disconnect(): void
  pause(): Promise<void>
  resume(): Promise<void>
  togglePlay(): Promise<void>
  getCurrentState(): Promise<SpotifyPlayerState | null>
  setVolume(volume: number): Promise<void>
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
