import {
  SpotifyPlaylist,
  PlaylistTrack,
  AudioFeatures,
} from "@/types"

const SPOTIFY_API_BASE = "https://api.spotify.com/v1"

// Helper function to add delay between requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export class SpotifyClient {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private async fetch<T>(
    endpoint: string,
    options?: RequestInit,
    retries = 3
  ): Promise<T> {
    const fullUrl = `${SPOTIFY_API_BASE}${endpoint}`
    console.log(`[Spotify API] Request: ${options?.method || 'GET'} ${fullUrl}`)
    console.log(`[Spotify API] Access Token: ${this.accessToken ? this.accessToken.substring(0, 20) + '...' : 'MISSING'}`)

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(fullUrl, {
          ...options,
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
            ...options?.headers,
          },
        })

        console.log(`[Spotify API] Response Status: ${response.status} ${response.statusText}`)

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After")
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : (attempt + 1) * 2000
          console.log(`[Spotify API] Rate limited. Waiting ${waitTime}ms before retry...`)
          await delay(waitTime)
          continue
        }

        if (!response.ok) {
          const errorText = await response.text()
          let error
          try {
            error = JSON.parse(errorText)
          } catch {
            error = { message: errorText }
          }

          const errorDetails = {
            status: response.status,
            statusText: response.statusText,
            url: fullUrl,
            method: options?.method || 'GET',
            error,
            attempt: attempt + 1,
            maxRetries: retries,
          }

          console.error(`[Spotify API] Error Details:`, errorDetails)

          // Create detailed error message
          const spotifyErrorMessage = error.error?.message || error.message || 'Unknown error'
          const errorMessage = `Spotify API Error [${response.status}]: ${spotifyErrorMessage}\nEndpoint: ${fullUrl}\nDetails: ${JSON.stringify(error, null, 2)}`

          throw new Error(errorMessage)
        }

        return response.json()
      } catch (error) {
        if (attempt === retries - 1) {
          console.error(`[Spotify API] Max retries reached for ${fullUrl}`)
          console.error(`[Spotify API] Last error:`, error)
          const detailedError = new Error(
            `Max retries reached for ${fullUrl}\nOriginal error: ${error instanceof Error ? error.message : String(error)}`
          )
          detailedError.cause = error
          throw detailedError
        }
        console.log(`[Spotify API] Retry ${attempt + 1}/${retries - 1} after error:`, error)
        // Wait before retrying
        await delay((attempt + 1) * 1000)
      }
    }

    throw new Error("Max retries reached")
  }

  async getCurrentUser() {
    return this.fetch<{
      id: string
      display_name: string
      email: string
      images: Array<{ url: string }>
    }>("/me")
  }

  async getUserPlaylists(limit = 50, offset = 0) {
    return this.fetch<{
      items: SpotifyPlaylist[]
      total: number
      limit: number
      offset: number
    }>(`/me/playlists?limit=${limit}&offset=${offset}`)
  }

  async getPlaylist(playlistId: string) {
    return this.fetch<SpotifyPlaylist>(`/playlists/${playlistId}`)
  }

  async getPlaylistTracks(
    playlistId: string,
    limit = 50,
    offset = 0
  ) {
    return this.fetch<{
      items: PlaylistTrack[]
      total: number
      limit: number
      offset: number
    }>(
      `/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`
    )
  }

  async getAllPlaylistTracks(playlistId: string): Promise<PlaylistTrack[]> {
    const allTracks: PlaylistTrack[] = []
    let offset = 0
    const limit = 50

    console.log(`Fetching playlist tracks for ${playlistId}...`)

    while (true) {
      const response = await this.getPlaylistTracks(playlistId, limit, offset)
      allTracks.push(...response.items)

      console.log(`Fetched ${allTracks.length}/${response.total} playlist tracks...`)

      if (response.items.length < limit) {
        break
      }

      offset += limit
      // Add small delay between pagination requests
      await delay(200)
    }

    console.log(`Successfully fetched all ${allTracks.length} playlist tracks`)
    return allTracks
  }

  async getSavedTracks(limit = 50, offset = 0) {
    return this.fetch<{
      items: Array<{ added_at: string; track: PlaylistTrack["track"] }>
      total: number
      limit: number
      offset: number
    }>(`/me/tracks?limit=${limit}&offset=${offset}`)
  }

  async getAllSavedTracks(): Promise<PlaylistTrack[]> {
    const allTracks: PlaylistTrack[] = []
    let offset = 0
    const limit = 50

    console.log("[Spotify API] Fetching saved tracks...")

    try {
      while (true) {
        console.log(`[Spotify API] Fetching saved tracks batch: offset=${offset}, limit=${limit}`)
        const response = await this.getSavedTracks(limit, offset)
        const formattedTracks = response.items.map((item) => ({
          added_at: item.added_at,
          track: item.track,
        }))
        allTracks.push(...formattedTracks)

        console.log(`[Spotify API] Fetched ${allTracks.length}/${response.total} saved tracks...`)

        if (response.items.length < limit) {
          console.log("[Spotify API] Reached end of saved tracks")
          break
        }

        offset += limit
        // Add small delay between pagination requests
        await delay(200)
      }

      console.log(`[Spotify API] Successfully fetched all ${allTracks.length} saved tracks`)
      return allTracks
    } catch (error) {
      console.error(`[Spotify API] Error in getAllSavedTracks at offset ${offset}:`, error)
      throw error
    }
  }

  async getAudioFeatures(trackIds: string[]): Promise<AudioFeatures[]> {
    // Use single track endpoint since batch endpoint returns empty results
    const allFeatures: AudioFeatures[] = []

    console.log(`[Spotify API] Fetching audio features for ${trackIds.length} tracks individually...`)

    for (let i = 0; i < trackIds.length; i++) {
      const trackId = trackIds[i]
      console.log(`[Spotify API] Fetching track ${i + 1}/${trackIds.length}: ${trackId}`)

      try {
        const response = await this.fetch<AudioFeatures>(`/audio-features/${trackId}`)

        if (response && response.id) {
          allFeatures.push(response)
          console.log(`[Spotify API] Track ${i + 1}/${trackIds.length} success: tempo=${response.tempo}, energy=${response.energy}`)
        }
      } catch (error) {
        console.error(`[Spotify API] Error fetching track ${i + 1}/${trackIds.length} (${trackId}):`, error)
        // Continue with next track even if this one fails
      }

      // Add delay between requests to avoid rate limiting (every 10 tracks)
      if ((i + 1) % 10 === 0 && i < trackIds.length - 1) {
        const delayMs = 500
        console.log(`[Spotify API] Waiting ${delayMs}ms after ${i + 1} tracks...`)
        await delay(delayMs)
      }
    }

    console.log(`[Spotify API] Successfully fetched ${allFeatures.length} audio features out of ${trackIds.length} requested`)
    return allFeatures
  }

  async createPlaylist(
    userId: string,
    name: string,
    description?: string,
    isPublic = false
  ) {
    return this.fetch<SpotifyPlaylist>(`/users/${userId}/playlists`, {
      method: "POST",
      body: JSON.stringify({
        name,
        description,
        public: isPublic,
      }),
    })
  }

  async addTracksToPlaylist(playlistId: string, trackUris: string[]) {
    // Spotify API限制：最大100個のトラックURI
    const chunks = []
    for (let i = 0; i < trackUris.length; i += 100) {
      chunks.push(trackUris.slice(i, i + 100))
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      await this.fetch(`/playlists/${playlistId}/tracks`, {
        method: "POST",
        body: JSON.stringify({
          uris: chunk,
        }),
      })

      // Add delay between batches to avoid rate limiting (except for last batch)
      if (i < chunks.length - 1) {
        await delay(400) // 400ms delay between requests
      }
    }

    return { success: true }
  }
}

export function createSpotifyClient(accessToken: string) {
  return new SpotifyClient(accessToken)
}
