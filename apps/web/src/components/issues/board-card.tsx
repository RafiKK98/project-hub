"use client";

import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { IssueDto } from "@projecthub/types";
import Link from "next/link";
import { DragEvent, useState } from "react";
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
  const [isDragging, setIsDragging] = useState(false);

  function handleDragStart(e: DragEvent) {
    e.dataTransfer.setData("text/issue-number", String(issue.number));
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  }

  function handleDragEnd() {
    setIsDragging(false);
  }

  return (
    <Link
      href={`/orgs/${orgSlug}/projects/${projectIdentifier}/issues/${issue.number}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        "flex flex-col gap-2 rounded-md border border-border bg-card p-3 text-left shadow-sm transition-all",
        "cursor-grab hover:border-foreground/20 active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">
          {issue.key}
        </span>
        <PriorityIcon priority={issue.priority} />
      </div>

      <p className="text-sm leading-snug text-foreground line-clamp-2">
        {issue.title}
      </p>

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
          <Avatar
            name={issue.assignee.name ?? issue.assignee.email}
            size="sm"
          />
        ) : (
          <div className="h-6 w-6 rounded-full border border-dashed border-border" />
        )}
      </div>
    </Link>
  );
}
