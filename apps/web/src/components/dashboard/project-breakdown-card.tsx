import { ProjectStatusBreakdown } from "@projecthub/types";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  BACKLOG: "bg-muted-foreground/30",
  TODO: "bg-muted-foreground/50",
  IN_PROGRESS: "bg-yellow-500",
  IN_REVIEW: "bg-violet-500",
  DONE: "bg-green-500",
  CANCELLED: "bg-muted-foreground/20",
};

const STATUS_LABEL: Record<string, string> = {
  BACKLOG: "Backlog",
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
  CANCELLED: "Cancelled",
};

interface ProjectBreakdownCardProps {
  breakdown: ProjectStatusBreakdown;
}

export function ProjectBreakdownCard({ breakdown }: ProjectBreakdownCardProps) {
  const activeStatuses = Object.entries(breakdown.counts).filter(
    ([, count]) => count > 0,
  );
  const completionPct =
    breakdown.total > 0
      ? Math.round(
          ((breakdown.counts.DONE + breakdown.counts.CANCELLED) /
            breakdown.total) *
            100,
        )
      : 0;

  return (
    <Link
      href={`/orgs/${breakdown.orgSlug}/projects/${breakdown.projectIdentifier}`}
      className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/30"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-muted-foreground">
            {breakdown.projectIdentifier}
          </span>
          <span className="text-sm font-medium text-foreground">
            {breakdown.projectName}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {breakdown.total} issues
        </span>
      </div>

      {/* Stacked progress bar */}
      {breakdown.total > 0 && (
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
          {activeStatuses.map(([status, count]) => (
            <div
              key={status}
              className={STATUS_COLORS[status] ?? "bg-muted"}
              style={{ width: `${(count / breakdown.total) * 100}%` }}
              title={`${STATUS_LABEL[status]}: ${count}`}
            />
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {activeStatuses.map(([status, count]) => (
          <div key={status} className="flex items-center gap-1">
            <div className={`h-2 w-2 rounded-full ${STATUS_COLORS[status]}`} />
            <span className="text-xs text-muted-foreground">
              {STATUS_LABEL[status]} {count}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">{completionPct}% complete</p>
    </Link>
  );
}
