"use client"

import { signIn } from "next-auth/react"
import { Music } from "lucide-react"

export function SignInButton() {
  return (
    <button
      onClick={() => signIn("spotify", { callbackUrl: "/dashboard" })}
      className="flex items-center gap-3 rounded-lg bg-[#1DB954] px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-[#1ed760] hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
    >
      <Music className="h-6 w-6" />
      <span>Sign in with Spotify</span>
    </button>
  )
}
