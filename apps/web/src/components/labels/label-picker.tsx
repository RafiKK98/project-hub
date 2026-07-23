"use client";

import {
  useCreateLabel,
  useDeleteLabel,
  useLabels,
  useSetIssueLabels,
} from "@/hooks/use-labels";
import { cn } from "@/lib/utils";
import type { IssueLabel } from "@projecthub/types";
import { LABEL_COLORS } from "@projecthub/types";
import { Check, Plus, Tag, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LabelChip } from "./label-chip";

interface LabelPickerProps {
  orgId: string;
  projectId: string;
  issueNumber: number;
  currentLabels: IssueLabel[];
  canManage?: boolean; // project managers can create/delete labels
}

export function LabelPicker({
  orgId,
  projectId,
  issueNumber,
  currentLabels,
  canManage = false,
}: LabelPickerProps) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<
    (typeof LABEL_COLORS)[number]["hex"]
  >(LABEL_COLORS[6].hex); // indigo default
  const ref = useRef<HTMLDivElement>(null);

  const { data: allLabels = [] } = useLabels(orgId, projectId);
  const setLabels = useSetIssueLabels(orgId, projectId, issueNumber);
  const createLabel = useCreateLabel(orgId, projectId);
  const deleteLabel = useDeleteLabel(orgId, projectId);

  const selectedIds = new Set(currentLabels.map((l) => l.id));

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggleLabel(labelId: string) {
    const next = selectedIds.has(labelId)
      ? [...selectedIds].filter((id) => id !== labelId)
      : [...selectedIds, labelId];
    setLabels.mutate(next);
  }

  function handleCreate() {
    if (!newName.trim()) return;
    createLabel.mutate(
      { name: newName.trim(), color: newColor },
      {
        onSuccess: () => {
          setNewName("");
          setCreating(false);
        },
      },
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors",
          "hover:bg-muted/50 text-left",
          open && "bg-muted/50",
        )}
      >
        <Tag className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="text-muted-foreground">
          {currentLabels.length > 0 ? (
            <span className="flex flex-wrap gap-1">
              {currentLabels.map((l) => (
                <LabelChip key={l.id} label={l} />
              ))}
            </span>
          ) : (
            "No labels"
          )}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-lg border border-border bg-card shadow-lg">
          <div className="p-1">
            {allLabels.length === 0 && !creating && (
              <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                No labels yet
              </p>
            )}
            {allLabels.map((label) => (
              <div
                key={label.id}
                className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted/50"
              >
                <button
                  className="flex flex-1 items-center gap-2"
                  onClick={() => toggleLabel(label.id)}
                >
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="flex-1 truncate text-sm text-foreground">
                    {label.name}
                  </span>
                  {selectedIds.has(label.id) && (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  )}
                </button>
                {canManage && (
                  <button
                    onClick={() => deleteLabel.mutate(label.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    aria-label={`Delete ${label.name}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {canManage && (
            <div className="border-t border-border p-2">
              {creating ? (
                <div className="flex flex-col gap-2">
                  <input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreate();
                      if (e.key === "Escape") setCreating(false);
                    }}
                    placeholder="Label name"
                    className="w-full rounded border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <div className="flex flex-wrap gap-1">
                    {LABEL_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => setNewColor(c.hex)}
                        className={cn(
                          "h-5 w-5 rounded-full transition-transform",
                          newColor === c.hex &&
                            "ring-2 ring-ring ring-offset-1 scale-110",
                        )}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={handleCreate}
                      disabled={!newName.trim() || createLabel.isPending}
                      className="flex-1 rounded bg-primary px-2 py-1 text-xs text-primary-foreground disabled:opacity-50"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => setCreating(false)}
                      className="rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setCreating(true)}
                  className="flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create label
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
