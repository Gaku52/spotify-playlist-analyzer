import MusicTempo from 'music-tempo'

export interface BPMAnalysisResult {
  tempo: number
  confidence: number
  success: boolean
  error?: string
}

/**
 * Analyze BPM from audio URL (Spotify preview_url)
 */
export async function analyzeBPM(audioUrl: string): Promise<BPMAnalysisResult> {
  try {
    console.log(`[BPM Analyzer] Starting analysis for: ${audioUrl}`)

    // Fetch audio data
    const response = await fetch(audioUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    console.log(`[BPM Analyzer] Audio data fetched: ${arrayBuffer.byteLength} bytes`)

    // Decode audio data using Web Audio API
    const audioContext = new AudioContext()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

    console.log(`[BPM Analyzer] Audio decoded: ${audioBuffer.duration}s, ${audioBuffer.numberOfChannels} channels`)

    // Get audio data as Float32Array
    const audioData = audioBuffer.getChannelData(0) // Use first channel (mono)

    // Analyze tempo using music-tempo library
    const analyzer = new MusicTempo(audioData)

    const tempo = analyzer.tempo
    const confidence = analyzer.confidence || 0

    console.log(`[BPM Analyzer] Analysis complete: tempo=${tempo}, confidence=${confidence}`)

    // Close audio context to free resources
    await audioContext.close()

    return {
      tempo: Math.round(tempo),
      confidence: confidence,
      success: true,
    }
  } catch (error) {
    console.error(`[BPM Analyzer] Error:`, error)
    return {
      tempo: 0,
      confidence: 0,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Analyze BPM for multiple tracks in batches
 */
export async function analyzeBPMBatch(
  audioUrls: Array<{ id: string; previewUrl: string | null }>,
  onProgress?: (current: number, total: number) => void
): Promise<Map<string, BPMAnalysisResult>> {
  const results = new Map<string, BPMAnalysisResult>()

  console.log(`[BPM Analyzer] Starting batch analysis for ${audioUrls.length} tracks`)

  for (let i = 0; i < audioUrls.length; i++) {
    const { id, previewUrl } = audioUrls[i]

    if (!previewUrl) {
      console.log(`[BPM Analyzer] Track ${id}: No preview URL available`)
      results.set(id, {
        tempo: 0,
        confidence: 0,
        success: false,
        error: 'No preview URL available',
      })
      continue
    }

    const result = await analyzeBPM(previewUrl)
    results.set(id, result)

    if (onProgress) {
      onProgress(i + 1, audioUrls.length)
    }

    // Add delay between requests to avoid overwhelming the browser
    if (i < audioUrls.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  console.log(`[BPM Analyzer] Batch analysis complete: ${results.size} results`)

  return results
}
