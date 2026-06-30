import { cn } from "@/lib/utils";
import type { IssueStatus } from "@projecthub/types";
import {
  Circle,
  CircleCheck,
  CircleDashed,
  CircleDot,
  CircleX,
} from "lucide-react";

const STATUS_CONFIG: Record<
  IssueStatus,
  { label: string; icon: typeof Circle; className: string }
> = {
  BACKLOG: {
    label: "Backlog",
    icon: CircleDashed,
    className: "text-muted-foreground",
  },
  TODO: { label: "Todo", icon: Circle, className: "text-muted-foreground" },
  IN_PROGRESS: {
    label: "In Progress",
    icon: CircleDot,
    className: "text-yellow-500",
  },
  IN_REVIEW: {
    label: "In Review",
    icon: CircleDot,
    className: "text-violet-500",
  },
  DONE: { label: "Done", icon: CircleCheck, className: "text-green-500" },
  CANCELLED: {
    label: "Cancelled",
    icon: CircleX,
    className: "text-muted-foreground",
  },
};

export function StatusIcon({
  status,
  className,
}: {
  status: IssueStatus;
  className?: string;
}) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return <Icon className={cn("h-4 w-4", config.className, className)} />;
}

export function getStatusLabel(status: IssueStatus): string {
  return STATUS_CONFIG[status].label;
}

export const STATUS_OPTIONS: IssueStatus[] = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
  "CANCELLED",
];
