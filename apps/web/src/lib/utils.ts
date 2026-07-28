import { type ClassValue, clsx } from "clsx";
import { formatDistanceToNowStrict } from "date-fns";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS class names safely, resolving conflicts.
 * Used by all shadcn/ui components and throughout the app.
 */
const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

function timeAgo(dateStr: string) {
  const result = formatDistanceToNowStrict(new Date(dateStr));

  const [value, unit] = result.split(" ");

  switch (unit) {
    case "second":
    case "seconds":
      return "just now";

    case "minute":
    case "minutes":
      return `${value}m ago`;

    case "hour":
    case "hours":
      return `${value}h ago`;

    case "day":
    case "days":
      return `${value}d ago`;

    default:
      return new Date(dateStr).toLocaleDateString();
  }
}

export { cn, getInitials, timeAgo };
