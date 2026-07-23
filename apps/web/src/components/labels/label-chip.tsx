import { cn } from "@/lib/utils";
import { IssueLabel } from "@projecthub/types";

interface LabelChipProps {
  label: IssueLabel;
  className?: string;
}

export function LabelChip({ label, className }: LabelChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white",
        className,
      )}
      style={{ backgroundColor: label.color }}
    >
      {label.name}
    </span>
  );
}

export function LabelChipList({
  labels,
  max = 3,
}: {
  labels: IssueLabel[];
  max?: number;
}) {
  if (!labels.length) return null;
  const visible = labels.slice(0, max);
  const overflow = labels.length - max;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((l) => (
        <LabelChip key={l.id} label={l} />
      ))}
      {overflow > 0 && (
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          +{overflow}
        </span>
      )}
    </div>
  );
}
