"use client";

import { cn } from "@/lib/utils";
import { IssueDto, IssueStatus } from "@projecthub/types";
import { DragEvent, useState } from "react";
import { BoardCard } from "./board-card";
import { getStatusLabel, StatusIcon } from "./status-icon";

interface BoardColumnProps {
  status: IssueStatus;
  issues: IssueDto[];
  orgSlug: string;
  projectIdentifier: string;
  onDropIssue: (issueNumber: number, status: IssueStatus) => void;
}

export function BoardColumn({
  status,
  issues,
  orgSlug,
  projectIdentifier,
  onDropIssue,
}: BoardColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const issueNumber = Number(e.dataTransfer.getData("text/issue-number"));
    if (issueNumber) onDropIssue(issueNumber, status);
  }
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-lg border border-border bg-muted/20 transition-colors",
        isDragOver && "border-foreground/40 bg-muted/40",
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <StatusIcon status={status} />
        <h3 className="text-sm font-medium text-foreground">
          {getStatusLabel(status)}
        </h3>
        <span className="text-xs text-muted-foreground">{issues.length}</span>
      </div>

      <div className="flex min-h-50 flex-col gap-2 overflow-y-auto p-2">
        {issues.map((issue) => (
          <BoardCard
            key={issue.id}
            issue={issue}
            orgSlug={orgSlug}
            projectIdentifier={projectIdentifier}
          />
        ))}
      </div>
    </div>
  );
}
