import { cn } from "@/lib/utils";

interface AvatarProps {
  name?: string | null | undefined;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Deterministic color from name
function getColor(name: string): string {
  const colors = [
    "bg-blue-500",
    "bg-violet-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-indigo-500",
    "bg-rose-500",
  ];
  const index = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[index % colors.length] ?? "bg-blue-500";
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const sizeClasses = {
    sm: "h-7 w-7 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  };

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name ?? "Avatar"}
        className={cn(
          "rounded-full object-cover",
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  const display = name ?? "?";
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-medium text-white",
        sizeClasses[size],
        getColor(display),
        className,
      )}
    >
      {getInitials(display)}
    </div>
  );
}
