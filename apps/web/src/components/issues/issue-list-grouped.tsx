import { IssueDto, IssueStatus } from "@projecthub/types";
import { IssueRow } from "./issue-row";
import { getStatusLabel, STATUS_OPTIONS, StatusIcon } from "./status-icon";

export function IssueListGrouped({
  issues,
  orgSlug,
  projectIdentifier,
}: {
  issues: IssueDto[];
  orgSlug: string;
  projectIdentifier: string;
}) {
  const grouped = STATUS_OPTIONS.reduce<Record<IssueStatus, IssueDto[]>>(
    (acc, status) => {
      acc[status] = issues.filter((issue) => issue.status === status);
      return acc;
    },
    {} as Record<IssueStatus, IssueDto[]>,
  );

  // Only show groups that have issues, except always show Todo/In Progress when empty overall
  const visibleStatuses = STATUS_OPTIONS.filter(
    (status) => grouped[status].length > 0,
  );

  if (visibleStatuses.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {visibleStatuses.map((status) => (
        <div key={status}>
          <div className="mb-2 flex items-center gap-2 px-1">
            <StatusIcon status={status} />
            <h3 className="text-sm font-medium text-foreground">
              {getStatusLabel(status)}
            </h3>
            <span className="text-xs text-muted-foreground">
              {grouped[status].length}
            </span>
          </div>
          <div className="divide-y divide-border rounded-lg border border-border">
            {grouped[status].map((issue) => (
              <IssueRow
                key={issue.id}
                issue={issue}
                orgSlug={orgSlug}
                projectIdentifier={projectIdentifier}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
