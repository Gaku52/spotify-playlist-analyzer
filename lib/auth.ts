import NextAuth, { DefaultSession } from "next-auth"
import Spotify from "next-auth/providers/spotify"
import type { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    error?: string
    user: {
      id: string
    } & DefaultSession["user"]
  }
}

interface ExtendedJWT extends JWT {
  accessToken?: string
  refreshToken?: string
  accessTokenExpires?: number
  error?: string
  id?: string
}

// Spotify OAuth scopes
const SPOTIFY_SCOPES = [
  "user-read-email",
  "user-read-private",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-library-read",
  "user-top-read",
].join(" ")

const SPOTIFY_AUTHORIZATION_URL =
  "https://accounts.spotify.com/authorize?" +
  new URLSearchParams({
    scope: SPOTIFY_SCOPES,
  })

async function refreshAccessToken(token: ExtendedJWT): Promise<ExtendedJWT> {
  try {
    const url = "https://accounts.spotify.com/api/token"

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.SPOTIFY_CLIENT_ID +
              ":" +
              process.env.SPOTIFY_CLIENT_SECRET
          ).toString("base64"),
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken || "",
      }),
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      throw refreshedTokens
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    }
  } catch (error) {
    console.error("Error refreshing access token:", error)
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Spotify({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: SPOTIFY_AUTHORIZATION_URL,
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      const extendedToken = token as ExtendedJWT

      // Initial sign in
      if (account && user) {
        return {
          ...extendedToken,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at! * 1000,
          id: user.id,
        } as ExtendedJWT
      }

      // Return previous token if the access token has not expired yet
      if (extendedToken.accessTokenExpires && Date.now() < extendedToken.accessTokenExpires) {
        return extendedToken
      }

      // Access token has expired, try to update it
      return refreshAccessToken(extendedToken)
    },
    async session({ session, token }) {
      const extendedToken = token as ExtendedJWT
      session.accessToken = extendedToken.accessToken
      session.error = extendedToken.error
      if (session.user) {
        session.user.id = extendedToken.id || ""
      }
      return session
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
})
