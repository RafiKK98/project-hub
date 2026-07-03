"use client";

import { NotificationBell } from "@/components/notifications/notification-bell";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useOrganizations } from "@/hooks/use-organizations";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { BarChart3, Building2, ChevronDown, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function TopNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const { data: orgs } = useOrganizations();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Extract current org slug from URL e.g. /orgs/acme/... → acme
  const currentOrgSlug = pathname.match(/^\/orgs\/([^/]+)/)?.[1] ?? null;
  const currentOrg = orgs?.find((o) => o.slug === currentOrgSlug);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      )
        setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-12 items-center border-b border-border bg-background/95 px-4 backdrop-blur-sm">
      {/* Left — logo + current org breadcrumb */}
      <div className="flex flex-1 items-center gap-3">
        <Link href="/orgs" className="flex items-center gap-2 text-foreground">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground">
            <span className="text-xs font-bold text-background">P</span>
          </div>
          <span className="text-sm font-semibold">ProjectHub</span>
        </Link>

        {currentOrg && (
          <>
            <span className="text-muted-foreground">/</span>
            <Link
              href={`/orgs/${currentOrg.slug}`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <Building2 className="h-3.5 w-3.5" />
              {currentOrg.name}
            </Link>
          </>
        )}
      </div>

      {/* Right — notifications + user menu */}
      <div className="flex items-center gap-2">
        <NotificationBell />

        {/* User menu */}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors",
              "text-muted-foreground hover:bg-muted hover:text-foreground",
              userMenuOpen && "bg-muted text-foreground",
            )}
          >
            <Avatar name={user?.name! ?? user?.email} size="sm" />
            <ChevronDown className="h-3 w-3" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-10 z-50 w-56 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
              {/* User info */}
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-medium text-foreground">
                  {user?.name ?? "User"}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <Link
                  href="/dashboard"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted"
                >
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  Dashboard
                </Link>
                <Link
                  href="/orgs"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted"
                >
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Organizations
                </Link>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted"
                >
                  <LogOut className="h-4 w-4 text-muted-foreground" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
