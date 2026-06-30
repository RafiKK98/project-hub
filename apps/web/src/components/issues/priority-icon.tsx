import { cn } from "@/lib/utils";
import type { IssuePriority } from "@projecthub/types";
import {
  Minus,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
} from "lucide-react";

const PRIORITY_CONFIG: Record<
  IssuePriority,
  { label: string; icon: typeof Signal; className: string }
> = {
  URGENT: { label: "Urgent", icon: Signal, className: "text-red-500" },
  HIGH: { label: "High", icon: SignalHigh, className: "text-orange-500" },
  MEDIUM: { label: "Medium", icon: SignalMedium, className: "text-yellow-500" },
  LOW: { label: "Low", icon: SignalLow, className: "text-blue-500" },
  NO_PRIORITY: {
    label: "No priority",
    icon: Minus,
    className: "text-muted-foreground",
  },
};

export function PriorityIcon({
  priority,
  className,
}: {
  priority: IssuePriority;
  className?: string;
}) {
  const config = PRIORITY_CONFIG[priority];
  const Icon = config.icon;

  return <Icon className={cn("h-4 w-4", config.className, className)} />;
}

export function getPriorityLabel(priority: IssuePriority) {
  return PRIORITY_CONFIG[priority].label;
}

export const PRIORITY_OPTIONS: IssuePriority[] = [
  "URGENT",
  "HIGH",
  "MEDIUM",
  "LOW",
  "NO_PRIORITY",
];
