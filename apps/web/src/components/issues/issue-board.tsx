"use client";

import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { IssueDto, IssueStatus } from "@projecthub/types";
import { useState } from "react";
import { BoardCard } from "./board-card";
import { BoardColumn } from "./board-column";
import { STATUS_OPTIONS } from "./status-icon";

interface IssueBoardProps {
  issues: IssueDto[];
  orgSlug: string;
  projectIdentifier: string;
  onReorder: (
    issueNumber: number,
    newBoardOrder: number,
    newStatus: IssueStatus,
  ) => void;
}

/**
 * Computes the midpoint boardOrder between two neighbors.
 * If no prev, returns next - 1000. If no next, returns prev + 1000.
 */
function computeBoardOrder(
  prev: IssueDto | undefined,
  next: IssueDto | undefined,
): number {
  if (!prev && !next) return 1000;
  if (!prev) return (next?.boardOrder ?? 1000) - 1000;
  if (!next) return prev.boardOrder + 1000;
  return (prev.boardOrder + next.boardOrder) / 2;
}

export function IssueBoard({
  issues,
  orgSlug,
  projectIdentifier,
  onReorder,
}: IssueBoardProps) {
  const [activeIssue, setActiveIssue] = useState<IssueDto | null>(null);
  // Local shadow copy so we can do optimistic column reassignment during drag-over
  const [localIssues, setLocalIssues] = useState<IssueDto[]>(issues);

  // Keep localIssues in sync when server data changes (after mutations settle)
  if (
    JSON.stringify(issues.map((i) => i.id + i.status + i.boardOrder)) !==
    JSON.stringify(localIssues.map((i) => i.id + i.status + i.boardOrder))
  ) {
    setLocalIssues(issues);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    const issue = localIssues.find((i) => i.id === event.active.id);
    setActiveIssue(issue ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeIssue = localIssues.find((i) => i.id === active.id);
    if (!activeIssue) return;

    // Dropped over a column droppable (not a card)
    const overIsColumn = STATUS_OPTIONS.includes(over.id as IssueStatus);
    const targetStatus = overIsColumn
      ? (over.id as IssueStatus)
      : localIssues.find((i) => i.id === over.id)?.status;

    if (!targetStatus || targetStatus === activeIssue.status) return;

    // Optimistically move to target column
    setLocalIssues((prev) =>
      prev.map((i) =>
        i.id === activeIssue.id ? { ...i, status: targetStatus } : i,
      ),
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveIssue(null);

    if (!over) {
      setLocalIssues(issues); // reset on cancelled drag
      return;
    }

    const draggedIssue = localIssues.find((i) => i.id === active.id);
    if (!draggedIssue) return;

    // Determine target status
    const overIsColumn = STATUS_OPTIONS.includes(over.id as IssueStatus);
    const targetStatus = overIsColumn
      ? (over.id as IssueStatus)
      : (localIssues.find((i) => i.id === over.id)?.status ??
        draggedIssue.status);

    // Get ordered issues in target column (excluding the dragged one)
    const columnIssues = localIssues
      .filter((i) => i.status === targetStatus && i.id !== active.id)
      .sort((a, b) => a.boardOrder - b.boardOrder);

    let newBoardOrder: number;

    if (overIsColumn) {
      // Dropped directly onto column header → place at end
      const last = columnIssues[columnIssues.length - 1];
      newBoardOrder = computeBoardOrder(last, undefined);
    } else {
      // Dropped onto a card → insert before/after that card
      const overIndex = columnIssues.findIndex((i) => i.id === over.id);
      if (overIndex === -1) {
        const last = columnIssues[columnIssues.length - 1];
        newBoardOrder = computeBoardOrder(last, undefined);
      } else {
        const prev = columnIssues[overIndex - 1];
        const next = columnIssues[overIndex];
        newBoardOrder = computeBoardOrder(prev, next);
      }
    }

    onReorder(draggedIssue.number, newBoardOrder, targetStatus);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STATUS_OPTIONS.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            issues={localIssues
              .filter((i) => i.status === status)
              .sort((a, b) => a.boardOrder - b.boardOrder)}
            orgSlug={orgSlug}
            projectIdentifier={projectIdentifier}
          />
        ))}
      </div>

      <DragOverlay>
        {activeIssue && (
          <div className="rotate-1 opacity-90 shadow-xl">
            <BoardCard
              issue={activeIssue}
              orgSlug={orgSlug}
              projectIdentifier={projectIdentifier}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
