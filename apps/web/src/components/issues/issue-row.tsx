import { Avatar, AvatarFallback } from "@/components/ui/shadcn/avatar";
import { IssueDto } from "@projecthub/types";
import Link from "next/link";
import { PriorityIcon } from "./priority-icon";
import { StatusIcon } from "./status-icon";

export function IssueRow({
  issue,
  orgSlug,
  projectIdentifier,
}: {
  issue: IssueDto;
  orgSlug: string;
  projectIdentifier: string;
}) {
  return (
    <Link
      href={`/orgs/${orgSlug}/projects/${projectIdentifier}/issues/${issue.number}`}
      className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50"
    >
      <StatusIcon status={issue.status} />
      <span className="w-14 shrink-0 font-mono text-xs text-muted-foreground">
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
      <div className="shrink-0">
        {issue.assignee ? (
          <Avatar size="sm">
            <AvatarFallback
              name={issue.assignee.name ?? issue.assignee.email}
            />
          </Avatar>
        ) : (
          <div className="h-7 w-7 rounded-full border border-dashed border-border" />
        )}
      </div>
    </Link>
  );
}
