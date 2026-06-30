"use client";

import { cn } from "@/lib/utils";
import { Kanban, List } from "lucide-react";

export type IssueView = "list" | "board";

interface ViewToggleProps {
  view: IssueView;
  onChange: (view: IssueView) => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-0.5 rounded-md border border-border p-0.5">
      <button
        onClick={() => onChange("list")}
        className={cn(
          "flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors",
          view === "list"
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-label="List view"
      >
        <List className="h-3.5 w-3.5" />
        List
      </button>
      <button
        onClick={() => onChange("board")}
        className={cn(
          "flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors",
          view === "board"
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-label="Board view"
      >
        <Kanban className="h-3.5 w-3.5" />
        Board
      </button>
    </div>
  );
}
