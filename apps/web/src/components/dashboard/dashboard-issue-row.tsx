import { PriorityIcon } from "@/components/issues/priority-icon";
import { StatusIcon } from "@/components/issues/status-icon";
import type { IssueDto } from "@projecthub/types";
import Link from "next/link";

interface DashboardIssueRowProps {
  issue: IssueDto;
  orgSlug: string;
}

export function DashboardIssueRow({ issue, orgSlug }: DashboardIssueRowProps) {
  // Derive project identifier from the issue key (e.g. "WEB-1" → "WEB")
  const projectIdentifier = issue.key.split("-")[0] ?? "";

  return (
    <Link
      href={`/orgs/${orgSlug}/projects/${projectIdentifier}/issues/${issue.number}`}
      className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-muted/50"
    >
      <StatusIcon status={issue.status} />
      <span className="w-16 shrink-0 font-mono text-xs text-muted-foreground">
        {issue.key}
      </span>
      <PriorityIcon priority={issue.priority} />
      <span className="flex-1 truncate text-sm text-foreground">
        {issue.title}
      </span>
      {issue.dueDate && (
        <span className="shrink-0 text-xs text-muted-foreground">
          {new Date(issue.dueDate).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
      )}
    </Link>
  );
}
