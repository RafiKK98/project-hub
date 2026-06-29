"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background">
          <span className="text-lg font-semibold">
            {user?.name?.charAt(0).toUpperCase() ?? "?"}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome, {user?.name ?? "there"}
          </h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-sm text-muted-foreground">
            Authenticated · Phase 2 complete
          </span>
        </div>

        <Button variant="outline" size="sm" onClick={logout}>
          Sign out
        </Button>
      </div>
    </main>
  );
}
