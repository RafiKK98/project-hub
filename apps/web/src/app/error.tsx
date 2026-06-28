'use client'

import { useEffect } from 'react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // In production, send to your error tracking service (Sentry, etc.)
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 text-center">
        <p className="text-sm font-medium text-muted-foreground">Error</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="max-w-sm text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>
        {error.digest && (
          <p className="font-mono text-xs text-muted-foreground">
            ID: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-80"
        >
          Try again
        </button>
      </div>
    </main>
  )
}
