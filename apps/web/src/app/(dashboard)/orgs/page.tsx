"use client";

import { RoleBadge } from "@/components/organizations/role-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useOrganizations } from "@/hooks/use-organizations";
import { Building2, Plus } from "lucide-react";
import Link from "next/link";

export default function OrgsPage() {
  const { logout } = useAuth();
  const { data: orgs, isLoading } = useOrganizations();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Organizations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Select an organization or create a new one
          </p>
        </div>
        <Link href="/orgs/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New organization
          </Button>
        </Link>
        <Button onClick={logout}>Logout</Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-lg border border-border bg-muted"
            />
          ))}
        </div>
      ) : orgs?.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">No organizations yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create one to start managing your projects
            </p>
          </div>
          <Link href="/orgs/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Create organization
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {orgs?.map((org) => (
            <Link
              key={org.id}
              href={`/orgs/${org.slug}`}
              className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
            >
              <Avatar name={org.name} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground truncate">
                    {org.name}
                  </p>
                  <RoleBadge role={org.currentUserRole} />
                </div>
                {org.description && (
                  <p className="mt-0.5 text-sm text-muted-foreground truncate">
                    {org.description}
                  </p>
                )}
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {org.memberCount}{" "}
                  {org.memberCount === 1 ? "member" : "members"}
                </p>
              </div>
              <span className="text-muted-foreground">→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
