import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome",
};

/**
 * Landing page placeholder.
 * Phase 2 replaces this with the authentication flow.
 * Phase 4+ replaces it with the authenticated dashboard redirect.
 */
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Logo mark */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground">
          <span className="text-xl font-bold text-background">P</span>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            ProjectHub
          </h1>
          <p className="text-muted-foreground">
            Project management for modern engineering teams.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-sm text-muted-foreground">
            Foundation milestone complete
          </span>
        </div>
      </div>
    </main>
  );
}
