import { Badge } from "@/components/ui/badge";
import { MemberRole } from "@projecthub/types";

const ROLE_CONFIG: Record<
  MemberRole,
  {
    label: string;
    variant: "default" | "secondary" | "success" | "warning" | "destructive";
  }
> = {
  OWNER: { label: "Owner", variant: "default" },
  ADMIN: { label: "Admin", variant: "warning" },
  MANAGER: { label: "Manager", variant: "success" },
  DEVELOPER: { label: "Developer", variant: "secondary" },
  REPORTER: { label: "Reporter", variant: "secondary" },
  GUEST: { label: "Guest", variant: "secondary" },
};

export function RoleBadge({ role }: { role: MemberRole }) {
  const config = ROLE_CONFIG[role];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
