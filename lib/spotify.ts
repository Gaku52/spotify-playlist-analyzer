import {
  SpotifyPlaylist,
  PlaylistTrack,
  AudioFeatures,
} from "@/types"

const SPOTIFY_API_BASE = "https://api.spotify.com/v1"

export class SpotifyClient {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Spotify API request failed")
    }

    return response.json()
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
    limit = 100,
    offset = 0
  ) {
    return this.fetch<{
      items: PlaylistTrack[]
      total: number
      limit: number
      offset: number
    }>(
      `/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}&fields=items(added_at,track(id,name,artists,album,duration_ms,uri,preview_url)),total,limit,offset`
    )
  }

  async getAllPlaylistTracks(playlistId: string): Promise<PlaylistTrack[]> {
    const allTracks: PlaylistTrack[] = []
    let offset = 0
    const limit = 100

    while (true) {
      const response = await this.getPlaylistTracks(playlistId, limit, offset)
      allTracks.push(...response.items)

      if (response.items.length < limit) {
        break
      }

      offset += limit
    }

    return allTracks
  }

  async getAudioFeatures(trackIds: string[]): Promise<AudioFeatures[]> {
    // Spotify API限制：最大100個のトラックID
    const chunks = []
    for (let i = 0; i < trackIds.length; i += 100) {
      chunks.push(trackIds.slice(i, i + 100))
    }

    const allFeatures: AudioFeatures[] = []

    for (const chunk of chunks) {
      const response = await this.fetch<{
        audio_features: (AudioFeatures | null)[]
      }>(`/audio-features?ids=${chunk.join(",")}`)

      const validFeatures = response.audio_features.filter(
        (f): f is AudioFeatures => f !== null
      )
      allFeatures.push(...validFeatures)
    }

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

    for (const chunk of chunks) {
      await this.fetch(`/playlists/${playlistId}/tracks`, {
        method: "POST",
        body: JSON.stringify({
          uris: chunk,
        }),
      })
    }

    return { success: true }
  }
}

export function createSpotifyClient(accessToken: string) {
  return new SpotifyClient(accessToken)
}
