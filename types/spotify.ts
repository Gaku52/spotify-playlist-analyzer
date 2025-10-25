export interface SpotifyImage {
  url: string
  height: number
  width: number
}

export interface SpotifyPlaylist {
  id: string
  name: string
  description: string
  images: SpotifyImage[]
  tracks: {
    total: number
    href: string
  }
  owner: {
    display_name: string
    id: string
  }
  public: boolean
  collaborative: boolean
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{
    id: string
    name: string
  }>
  album: {
    id: string
    name: string
    images: SpotifyImage[]
    release_date?: string
  }
  duration_ms: number
  uri: string
  preview_url: string | null
  popularity: number
  explicit: boolean
}

export interface AudioFeatures {
  id: string
  acousticness: number
  danceability: number
  energy: number
  instrumentalness: number
  key: number
  liveness: number
  loudness: number
  mode: number
  speechiness: number
  tempo: number
  time_signature: number
  valence: number
}

export interface PlaylistTrack {
  added_at: string
  track: SpotifyTrack | null
}

export interface ValidPlaylistTrack extends Omit<PlaylistTrack, "track"> {
  track: SpotifyTrack
}

export interface FilterOptions {
  // Audio features filters (deprecated - only for apps with extended access)
  bpmMin?: number
  bpmMax?: number
  key?: number
  energyMin?: number
  energyMax?: number
  danceabilityMin?: number
  danceabilityMax?: number
  valenceMin?: number
  valenceMax?: number

  // Basic filters (available for all apps)
  popularityMin?: number
  popularityMax?: number
  durationMinMs?: number
  durationMaxMs?: number
  explicitOnly?: boolean
  nonExplicitOnly?: boolean
}
