"use client";

import { NotificationBell } from "@/components/notifications/notification-bell";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useOrganizations } from "@/hooks/use-organizations";
import { useAuthStore } from "@/store/auth.store";
import { Building2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { ThemeToggle } from "../theme-toggle";
import { UserMenu } from "./user-menu";

export function TopNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const { data: orgs } = useOrganizations();

  const currentOrgSlug = pathname.match(/^\/orgs\/([^/]+)/)?.[1] ?? null;
  const currentOrg = orgs?.find((o) => o.slug === currentOrgSlug);

  return (
    <header className="sticky top-0 z-40 flex h-12 items-center border-b border-border bg-background/95 px-4 backdrop-blur-sm">
      {/* Left — logo + breadcrumb */}
      <div className="flex flex-1 items-center gap-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-foreground"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground">
            <span className="text-xs font-bold text-background">P</span>
          </div>
          <span className="text-sm font-semibold">ProjectHub</span>
        </Link>

        {currentOrg && (
          <Fragment>
            <Separator orientation="vertical" className="mx-1 h-4" />
            <Link
              href={`/orgs/${currentOrg.slug}`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Building2 className="h-3.5 w-3.5" />
              {currentOrg.name}
            </Link>
          </Fragment>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <NotificationBell />

        <UserMenu user={user} logout={logout} />
      </div>
    </header>
  );
}
