import { auth } from "@/lib/auth"
import { createSpotifyClient } from "@/lib/spotify"
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

    const spotify = createSpotifyClient(session.accessToken)

    console.log(`[Audio Features API] Fetching features for ${trackIds.length} tracks`)

    const audioFeatures = await spotify.getAudioFeatures(trackIds)

    console.log(`[Audio Features API] Successfully fetched ${audioFeatures.length} features`)

    return NextResponse.json({
      success: true,
      audioFeatures,
    })
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
