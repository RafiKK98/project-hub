"use client";

import {
  closestCenter,
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
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { IssueDto, IssueStatus } from "@projecthub/types";
import { useEffect, useRef, useState } from "react";
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
 * Computes a boardOrder float to insert `item` between `prev` and `next`.
 * Uses gaps of 1000 so there's plenty of precision before needing a reindex.
 */
function orderBetween(
  prev: IssueDto | undefined,
  next: IssueDto | undefined,
): number {
  if (!prev && !next) return 1000;
  if (!prev) return next!.boardOrder - 1000;
  if (!next) return prev.boardOrder + 1000;
  return (prev.boardOrder + next.boardOrder) / 2;
}

export function IssueBoard({
  issues,
  orgSlug,
  projectIdentifier,
  onReorder,
}: IssueBoardProps) {
  // localIssues is our single source of truth during a drag session.
  // We keep it in sync with the server copy between drags.
  const [localIssues, setLocalIssues] = useState<IssueDto[]>(
    [...issues].sort((a, b) => a.boardOrder - b.boardOrder),
  );
  const [activeIssue, setActiveIssue] = useState<IssueDto | null>(null);

  // Track the last server copy so we know when to resync
  const lastServerKey = useRef("");

  useEffect(() => {
    const serverKey = issues
      .map((i) => `${i.id}:${i.status}:${i.boardOrder}`)
      .join("|");
    if (serverKey !== lastServerKey.current && !activeIssue) {
      lastServerKey.current = serverKey;
      setLocalIssues([...issues].sort((a, b) => a.boardOrder - b.boardOrder));
    }
  }, [issues, activeIssue]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragStart({ active }: DragStartEvent) {
    setActiveIssue(localIssues.find((i) => i.id === active.id) ?? null);
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over || active.id === over.id) return;

    const activeIssue = localIssues.find((i) => i.id === active.id);
    if (!activeIssue) return;

    // `over` is either a column id (string status) or another card id (cuid)
    const overIsColumn = STATUS_OPTIONS.includes(over.id as IssueStatus);
    const targetStatus = overIsColumn
      ? (over.id as IssueStatus)
      : localIssues.find((i) => i.id === over.id)?.status;

    if (!targetStatus) return;

    if (targetStatus !== activeIssue.status) {
      // Moving to a different column — reassign status optimistically so the
      // SortableContext in the target column can calculate the correct insertion index
      setLocalIssues((prev) =>
        prev.map((i) =>
          i.id === activeIssue.id ? { ...i, status: targetStatus } : i,
        ),
      );
    }
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    const draggedIssue = localIssues.find((i) => i.id === active.id);
    setActiveIssue(null);

    if (!over || !draggedIssue) {
      // Cancelled — restore server state
      setLocalIssues([...issues].sort((a, b) => a.boardOrder - b.boardOrder));
      return;
    }

    const overIsColumn = STATUS_OPTIONS.includes(over.id as IssueStatus);
    const finalStatus = overIsColumn
      ? (over.id as IssueStatus)
      : (localIssues.find((i) => i.id === over.id)?.status ??
        draggedIssue.status);

    // Get the full ordered list for the target column (including the dragged item
    // already in it from handleDragOver's optimistic update)
    const columnItems = localIssues
      .filter((i) => i.status === finalStatus)
      .sort((a, b) => a.boardOrder - b.boardOrder);

    const oldIndex = columnItems.findIndex((i) => i.id === active.id);

    let newIndex: number;
    if (overIsColumn) {
      // Dropped on column header → put at end
      newIndex = columnItems.length - 1;
    } else {
      newIndex = columnItems.findIndex((i) => i.id === over.id);
    }

    if (newIndex === -1) newIndex = columnItems.length - 1;

    // Use arrayMove to get the correct final order — this is what fixes the
    // off-by-one: arrayMove handles both up and down moves correctly
    const reordered = arrayMove(columnItems, oldIndex, newIndex);

    const movedIndex = reordered.findIndex((i) => i.id === draggedIssue.id);
    const prev = reordered[movedIndex - 1];
    const next = reordered[movedIndex + 1];
    const newBoardOrder = orderBetween(prev, next);

    // Apply to local state immediately for smooth UI
    setLocalIssues((prev) =>
      prev.map((i) =>
        i.id === draggedIssue.id
          ? { ...i, boardOrder: newBoardOrder, status: finalStatus }
          : i,
      ),
    );

    // Persist — only call if something actually changed
    if (
      newBoardOrder !== draggedIssue.boardOrder ||
      finalStatus !== draggedIssue.status
    ) {
      onReorder(draggedIssue.number, newBoardOrder, finalStatus);
    }
  }

  const issuesByStatus = STATUS_OPTIONS.reduce<Record<IssueStatus, IssueDto[]>>(
    (acc, status) => {
      acc[status] = localIssues
        .filter((i) => i.status === status)
        .sort((a, b) => a.boardOrder - b.boardOrder);
      return acc;
    },
    {} as Record<IssueStatus, IssueDto[]>,
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STATUS_OPTIONS.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            issues={issuesByStatus[status]}
            orgSlug={orgSlug}
            projectIdentifier={projectIdentifier}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
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
