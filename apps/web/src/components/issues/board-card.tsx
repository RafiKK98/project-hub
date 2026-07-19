"use client";

import { Avatar, AvatarFallback } from "@/components/ui/shadcn/avatar";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { IssueDto } from "@projecthub/types";
import Link from "next/link";
import { PriorityIcon } from "./priority-icon";

interface BoardCardProps {
  issue: IssueDto;
  orgSlug: string;
  projectIdentifier: string;
}

export function BoardCard({
  issue,
  orgSlug,
  projectIdentifier,
}: BoardCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: issue.id,
    data: { issue },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-col gap-2 rounded-md border border-border bg-card p-3 shadow-sm",
        "touch-none select-none",
        isDragging && "opacity-40 shadow-lg",
      )}
    >
      {/* Drag handle — the whole card is draggable but we separate the link */}
      <div
        {...attributes}
        {...listeners}
        className="flex cursor-grab items-center justify-between active:cursor-grabbing"
      >
        <span className="font-mono text-xs text-muted-foreground">
          {issue.key}
        </span>
        <PriorityIcon priority={issue.priority} />
      </div>

      <Link
        href={`/orgs/${orgSlug}/projects/${projectIdentifier}/issues/${issue.number}`}
        className="text-sm leading-snug text-foreground line-clamp-2 hover:underline"
        onClick={(e) => isDragging && e.preventDefault()}
      >
        {issue.title}
      </Link>

      <div className="flex items-center justify-between pt-1">
        {issue.dueDate ? (
          <span className="text-xs text-muted-foreground">
            {new Date(issue.dueDate).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        ) : (
          <span />
        )}
        {issue.assignee ? (
          <Avatar size="sm">
            <AvatarFallback
              name={issue.assignee.name ?? issue.assignee.email}
            />
          </Avatar>
        ) : (
          <div className="h-6 w-6 rounded-full border border-dashed border-border" />
        )}
      </div>
    </div>
  );
}
