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
    const { name, description, trackUris, userId } = body

    if (!name || !trackUris || !Array.isArray(trackUris) || trackUris.length === 0) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }

    const spotify = createSpotifyClient(session.accessToken)

    // Create the playlist
    const playlist = await spotify.createPlaylist(
      userId || session.user.id,
      name,
      description || "Created with Spotify Playlist Analyzer",
      false
    )

    // Add tracks to the playlist
    await spotify.addTracksToPlaylist(playlist.id, trackUris)

    return NextResponse.json({
      success: true,
      playlistId: playlist.id,
      externalUrl: `https://open.spotify.com/playlist/${playlist.id}`,
    })
  } catch (error) {
    console.error("Error creating playlist:", error)
    return NextResponse.json(
      { error: "Failed to create playlist" },
      { status: 500 }
    )
  }
}
