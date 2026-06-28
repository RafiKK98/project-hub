import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '404 — Page Not Found',
}

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 text-center">
        <p className="text-sm font-medium text-muted-foreground">404</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Page not found
        </h1>
        <p className="max-w-sm text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-80"
        >
          Go home
        </Link>
      </div>
    </main>
  )
}
