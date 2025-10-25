"use client"

import { useEffect, useState } from "react"

interface LogEntry {
  timestamp: string
  type: "info" | "error" | "warn"
  message: string
  data?: unknown
}

export function DebugLogger() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Intercept console methods
    const originalLog = console.log
    const originalError = console.error
    const originalWarn = console.warn

    console.log = (...args) => {
      const message = args.map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(" ")

      if (message.includes("[Spotify API]") || message.includes("[Auth]")) {
        setLogs((prev) => [
          ...prev,
          {
            timestamp: new Date().toISOString(),
            type: "info",
            message,
            data: args.length > 1 ? args.slice(1) : undefined,
          },
        ])
      }
      originalLog(...args)
    }

    console.error = (...args) => {
      const message = args.map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(" ")

      if (message.includes("[Spotify API]") || message.includes("[Auth]")) {
        setLogs((prev) => [
          ...prev,
          {
            timestamp: new Date().toISOString(),
            type: "error",
            message,
            data: args.length > 1 ? args.slice(1) : undefined,
          },
        ])
      }
      originalError(...args)
    }

    console.warn = (...args) => {
      const message = args.map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(" ")

      if (message.includes("[Spotify API]") || message.includes("[Auth]")) {
        setLogs((prev) => [
          ...prev,
          {
            timestamp: new Date().toISOString(),
            type: "warn",
            message,
            data: args.length > 1 ? args.slice(1) : undefined,
          },
        ])
      }
      originalWarn(...args)
    }

    return () => {
      console.log = originalLog
      console.error = originalError
      console.warn = originalWarn
    }
  }, [])

  if (!isVisible && logs.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isVisible ? (
        <button
          onClick={() => setIsVisible(true)}
          className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-red-700"
        >
          デバッグログ ({logs.length})
        </button>
      ) : (
        <div className="flex max-h-[80vh] w-[600px] flex-col rounded-lg bg-zinc-900 shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-700 px-4 py-2">
            <h3 className="font-semibold text-white">API デバッグログ</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setLogs([])}
                className="rounded bg-zinc-700 px-3 py-1 text-xs text-white hover:bg-zinc-600"
              >
                クリア
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="rounded bg-zinc-700 px-3 py-1 text-xs text-white hover:bg-zinc-600"
              >
                閉じる
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {logs.length === 0 ? (
              <p className="text-sm text-zinc-400">ログがありません</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={`rounded-md p-3 text-xs ${
                      log.type === "error"
                        ? "bg-red-900/30 text-red-200"
                        : log.type === "warn"
                        ? "bg-yellow-900/30 text-yellow-200"
                        : "bg-zinc-800 text-zinc-200"
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-mono text-[10px] text-zinc-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          log.type === "error"
                            ? "bg-red-700 text-white"
                            : log.type === "warn"
                            ? "bg-yellow-700 text-white"
                            : "bg-blue-700 text-white"
                        }`}
                      >
                        {log.type}
                      </span>
                    </div>
                    <pre className="whitespace-pre-wrap break-words font-mono text-xs">
                      {log.message}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
