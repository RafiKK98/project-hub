import { Badge } from "@/components/ui/badge";
import { ProjectStatus } from "@projecthub/types";

const STATUS_CONFIG: Record<
  ProjectStatus,
  {
    label: string;
    variant: "default" | "secondary" | "success" | "warning" | "destructive";
  }
> = {
  ACTIVE: { label: "Active", variant: "success" },
  PAUSED: { label: "Paused", variant: "warning" },
  ARCHIVED: { label: "Archived", variant: "secondary" },
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
