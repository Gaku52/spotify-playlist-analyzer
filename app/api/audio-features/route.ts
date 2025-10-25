import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user || !session.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { trackIds } = body

    if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid request body. trackIds array is required." },
        { status: 400 }
      )
    }

    // Limit to 50 tracks per request to avoid timeout
    if (trackIds.length > 50) {
      return NextResponse.json(
        { error: "Too many tracks. Maximum 50 tracks per request." },
        { status: 400 }
      )
    }

    console.log(`[Audio Features API] Fetching features for ${trackIds.length} tracks`)
    console.log(`[Audio Features API] Track IDs:`, trackIds)

    // Try audio-analysis endpoint instead of audio-features (which is restricted in Dev Mode)
    try {
      // Test single track endpoint
      const testTrackId = trackIds[0]
      const endpoint = `/audio-analysis/${testTrackId}`

      console.log(`[Audio Features API] Testing audio-analysis endpoint: ${endpoint}`)

      // Make direct fetch to Spotify API
      const spotifyResponse = await fetch(`https://api.spotify.com/v1${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        }
      })

      console.log(`[Audio Features API] Spotify response status: ${spotifyResponse.status}`)

      const rawText = await spotifyResponse.text()
      console.log(`[Audio Features API] Raw response text:`, rawText)

      let rawData
      try {
        rawData = JSON.parse(rawText)
      } catch {
        rawData = { error: 'Failed to parse JSON', rawText }
      }

      console.log(`[Audio Features API] Parsed response:`, JSON.stringify(rawData, null, 2))

      // Extract audio features from audio-analysis response
      let audioFeature = null
      if (spotifyResponse.ok && rawData.track) {
        // Convert audio-analysis format to audio-features format
        audioFeature = {
          id: testTrackId,
          tempo: rawData.track.tempo,
          key: rawData.track.key,
          mode: rawData.track.mode,
          time_signature: rawData.track.time_signature,
          loudness: rawData.track.loudness,
          duration_ms: Math.round(rawData.track.duration * 1000),
          // audio-analysis doesn't provide these, so we set defaults or omit
          // energy: rawData.track.energy || 0,
          // danceability: rawData.track.danceability || 0,
          // valence: rawData.track.valence || 0,
          // acousticness: rawData.track.acousticness || 0,
          // instrumentalness: rawData.track.instrumentalness || 0,
          // liveness: rawData.track.liveness || 0,
          // speechiness: rawData.track.speechiness || 0,
        }
      }

      // Return response to client for debugging
      return NextResponse.json({
        success: spotifyResponse.ok,
        audioFeatures: audioFeature ? [audioFeature] : [],
        debug: {
          requestedTrackIds: trackIds,
          requestedCount: trackIds.length,
          firstTrackId: testTrackId,
          spotifyStatusCode: spotifyResponse.status,
          spotifyStatusText: spotifyResponse.statusText,
          rawResponse: rawData,
          endpoint: endpoint,
          extractedFeature: audioFeature,
          note: "Using audio-analysis API instead of audio-features (Dev Mode compatible)"
        }
      })
    } catch (fetchError) {
      console.error(`[Audio Features API] Fetch error:`, fetchError)
      return NextResponse.json({
        success: false,
        audioFeatures: [],
        debug: {
          error: fetchError instanceof Error ? fetchError.message : String(fetchError),
          errorType: fetchError instanceof Error ? fetchError.constructor.name : typeof fetchError,
        }
      })
    }
  } catch (error) {
    console.error("[Audio Features API] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch audio features",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
