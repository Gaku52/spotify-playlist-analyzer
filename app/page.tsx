import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SignInButton } from "@/components/auth/sign-in-button"
import { Music2, Sliders, ListMusic, Sparkles } from "lucide-react"

export default async function Home() {
  const session = await auth()

  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 px-4 dark:from-zinc-950 dark:via-black dark:to-zinc-900">
      <main className="flex max-w-4xl flex-col items-center text-center">
        {/* Logo & Title */}
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-2xl bg-[#1DB954] p-4 shadow-lg">
            <Music2 className="h-10 w-10 text-white" />
          </div>
        </div>

        <h1 className="mb-4 text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
          Spotify Playlist Analyzer
        </h1>

        <p className="mb-12 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Analyze your Spotify playlists based on musical characteristics like BPM, key, energy level, and more.
          Automatically organize your music and create new playlists tailored to your preferences.
        </p>

        {/* Features Grid */}
        <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
            <div className="rounded-full bg-blue-50 p-3 dark:bg-blue-950">
              <Sliders className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Smart Filtering</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Filter by BPM, key, energy, and more
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
            <div className="rounded-full bg-purple-50 p-3 dark:bg-purple-950">
              <ListMusic className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Audio Analysis</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Deep analysis of track characteristics
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
            <div className="rounded-full bg-green-50 p-3 dark:bg-green-950">
              <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Auto Playlists</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Create playlists from filtered results
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-900">
            <div className="rounded-full bg-orange-50 p-3 dark:bg-orange-950">
              <Music2 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Save Presets</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Save your favorite filter combinations
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <SignInButton />

        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-500">
          Secure OAuth 2.0 authentication with Spotify
        </p>
      </main>
    </div>
  )
}
