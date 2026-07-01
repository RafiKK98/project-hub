"use client";

import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { IssueDto, IssueStatus } from "@projecthub/types";
import { BoardCard } from "./board-card";
import { StatusIcon, getStatusLabel } from "./status-icon";

interface BoardColumnProps {
  status: IssueStatus;
  issues: IssueDto[];
  orgSlug: string;
  projectIdentifier: string;
}

export function BoardColumn({
  status,
  issues,
  orgSlug,
  projectIdentifier,
}: BoardColumnProps) {
  // The droppable id matches the status string so DragOverEvent can identify it
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-lg border border-border bg-muted/20 transition-colors",
        isOver && "border-foreground/30 bg-muted/40",
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <StatusIcon status={status} />
        <h3 className="text-sm font-medium text-foreground">
          {getStatusLabel(status)}
        </h3>
        <span className="text-xs text-muted-foreground">{issues.length}</span>
      </div>

      {/*
        SortableContext needs the card ids in their current sorted order.
        This is what tells @dnd-kit where to draw the drop indicator.
        setNodeRef on the inner div makes the empty column area a valid drop zone.
      */}
      <SortableContext
        items={issues.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className="flex min-h-50 flex-col gap-2 overflow-y-auto p-2"
        >
          {issues.map((issue) => (
            <BoardCard
              key={issue.id}
              issue={issue}
              orgSlug={orgSlug}
              projectIdentifier={projectIdentifier}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
