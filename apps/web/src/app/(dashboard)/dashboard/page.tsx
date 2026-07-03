"use client";

import { DashboardIssueRow } from "@/components/dashboard/dashboard-issue-row";
import { ProjectBreakdownCard } from "@/components/dashboard/project-breakdown-card";
import { useDashboard } from "@/hooks/use-dashboard";
import { useOrganizations } from "@/hooks/use-organizations";
import { useAuthStore } from "@/store/auth.store";
import { ArrowRight, BarChart3, Clock, ListTodo } from "lucide-react";
import Link from "next/link";
import { ElementType, ReactNode } from "react";

function Section({
  icon: Icon,
  title,
  children,
  isEmpty,
  emptyMessage,
}: {
  icon: ElementType;
  title: string;
  children: ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
      </div>
      {isEmpty ? (
        <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        children
      )}
    </section>
  );
}

function SkeletonRows({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-1">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5">
          <div className="h-4 w-4 animate-pulse rounded-full bg-muted" />
          <div className="h-3 w-12 animate-pulse rounded bg-muted" />
          <div className="h-3 flex-1 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useDashboard();
  const { data: orgs } = useOrganizations();

  // Build a orgId → slug map so we can construct issue links
  const orgSlugById = new Map(orgs?.map((o) => [o.id, o.slug]) ?? []);

  // For dashboard issue rows we need the orgSlug. We derive it from projectId via
  // the project breakdowns list which carries orgSlug.
  function getOrgSlugForIssue(projectId: string): string {
    return (
      data?.projectBreakdowns.find((b) => b.projectId === projectId)?.orgSlug ??
      ""
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Good {getTimeOfDay()}, {user?.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's what needs your attention today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
        {/* Left column */}
        <div className="flex flex-col gap-10">
          {/* Assigned to me */}
          <Section
            icon={ListTodo}
            title="Assigned to me"
            isEmpty={!isLoading && (data?.assignedToMe.length ?? 0) === 0}
            emptyMessage="No open issues assigned to you. Enjoy the quiet."
          >
            {isLoading ? (
              <SkeletonRows count={4} />
            ) : (
              <div className="divide-y divide-border rounded-lg border border-border">
                {data?.assignedToMe.map((issue) => (
                  <DashboardIssueRow
                    key={issue.id}
                    issue={issue}
                    orgSlug={getOrgSlugForIssue(issue.projectId)}
                  />
                ))}
              </div>
            )}
          </Section>

          {/* Recently updated */}
          <Section
            icon={Clock}
            title="Recently updated"
            isEmpty={!isLoading && (data?.recentlyUpdated.length ?? 0) === 0}
            emptyMessage="No recent activity yet."
          >
            {isLoading ? (
              <SkeletonRows count={5} />
            ) : (
              <div className="divide-y divide-border rounded-lg border border-border">
                {data?.recentlyUpdated.map((issue) => (
                  <DashboardIssueRow
                    key={issue.id}
                    issue={issue}
                    orgSlug={getOrgSlugForIssue(issue.projectId)}
                  />
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* Right column — project breakdowns */}
        <div>
          <Section
            icon={BarChart3}
            title="Project progress"
            isEmpty={!isLoading && (data?.projectBreakdowns.length ?? 0) === 0}
            emptyMessage="No active projects yet."
          >
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-28 animate-pulse rounded-lg border border-border bg-muted"
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {data?.projectBreakdowns.map((breakdown) => (
                  <ProjectBreakdownCard
                    key={breakdown.projectId}
                    breakdown={breakdown}
                  />
                ))}
                {orgs && orgs.length > 0 && (
                  <Link
                    href="/orgs"
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    View all organizations
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}
