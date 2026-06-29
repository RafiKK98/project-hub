import { cn } from "@/lib/utils";

type BadgeVariant =
  "default" | "secondary" | "success" | "warning" | "destructive";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        {
          "bg-foreground/10 text-foreground": variant === "default",
          "bg-muted text-muted-foreground": variant === "secondary",
          "bg-green-500/10 text-green-600 dark:text-green-400":
            variant === "success",
          "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400":
            variant === "warning",
          "bg-destructive/10 text-destructive": variant === "destructive",
        },
        className,
      )}
    >
      {children}
    </span>
  );
}
