"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { issueKeys, useIssues, useSetParent } from "@/hooks/use-issues";
import { ApiClientError } from "@/lib/api-client";
import { issuesApi } from "@/lib/issues-api";
import type { IssueDto } from "@projecthub/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GitBranch, Link2, ListChecks, Plus, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { StatusIcon } from "./status-icon";

interface SubtaskSectionProps {
  orgId: string;
  projectId: string;
  orgSlug: string;
  projectIdentifier: string;
  issue: IssueDto;
}

export function SubtaskSection({
  orgId,
  projectId,
  orgSlug,
  projectIdentifier,
  issue,
}: SubtaskSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [showChangeParentForm, setShowChangeParentForm] = useState(false);
  const [showMakeSubtaskForm, setShowMakeSubtaskForm] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [linkTargetId, setLinkTargetId] = useState("");
  const [changeParentId, setChangeParentId] = useState("");
  const [makeSubtaskParentId, setMakeSubtaskParentId] = useState("");

  const queryClient = useQueryClient();
  const setParent = useSetParent(orgId, projectId);

  // Candidate pool for every picker below. The list endpoint already
  // excludes subtasks, so everything returned here is guaranteed top-level
  // and therefore eligible to act as a parent.
  const { data: allIssues } = useIssues(orgId, projectId);

  const createSubtask = useMutation({
    mutationFn: (t: string) =>
      issuesApi.create(orgId, projectId, { title: t, parentId: issue.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: issueKeys.all(orgId, projectId),
      });
      setNewTitle("");
      setShowAddForm(false);
      toast.success("Subtask added");
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError
          ? error.body.message
          : "Failed to add subtask";
      toast.error(message);
    },
  });

  function handleLinkExisting() {
    if (!linkTargetId) return;
    const target = allIssues?.find((i) => i.id === linkTargetId);
    if (!target) return;
    setParent.mutate(
      { number: target.number, parentId: issue.id },
      {
        onSuccess: () => {
          setLinkTargetId("");
          setShowLinkForm(false);
        },
      },
    );
  }

  function handleChangeParent() {
    if (!changeParentId) return;
    setParent.mutate(
      { number: issue.number, parentId: changeParentId },
      {
        onSuccess: () => {
          setChangeParentId("");
          setShowChangeParentForm(false);
        },
      },
    );
  }

  function handleMakeSubtask() {
    if (!makeSubtaskParentId) return;
    setParent.mutate(
      { number: issue.number, parentId: makeSubtaskParentId },
      {
        onSuccess: () => {
          setMakeSubtaskParentId("");
          setShowMakeSubtaskForm(false);
        },
      },
    );
  }

  // ── This issue IS a subtask — breadcrumb, change parent, or remove ────────
  if (issue.parent) {
    const changeCandidates = (allIssues ?? []).filter(
      (i) => i.id !== issue.id && i.id !== issue.parent?.id,
    );

    return (
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
          <span className="shrink-0 text-muted-foreground">Sub-issue of</span>
          <Link
            href={`/orgs/${orgSlug}/projects/${projectIdentifier}/issues/${issue.parent.number}`}
            className="shrink-0 font-mono text-xs text-foreground hover:underline"
          >
            {issue.parent.key}
          </Link>
          <span className="truncate text-foreground">{issue.parent.title}</span>
          <div className="ml-auto flex shrink-0 items-center gap-3">
            <button
              onClick={() => setShowChangeParentForm((v) => !v)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Change
            </button>
            <button
              onClick={() =>
                setParent.mutate({ number: issue.number, parentId: null })
              }
              className="text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Remove from parent"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {showChangeParentForm && (
          <div className="flex gap-2">
            <Select
              value={changeParentId}
              onValueChange={(value) => setChangeParentId(value)}
            >
              <option value="">Select a new parent issue…</option>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {changeCandidates.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.key} — {i.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              disabled={!changeParentId || setParent.isPending}
              onClick={handleChangeParent}
            >
              Move
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowChangeParentForm(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    );
  }

  // ── This issue is NOT a subtask ────────────────────────────────────────────
  // Eligible to become one only if it has no subtasks of its own (single
  // level of nesting — matches the backend's setParent validation).
  const canBecomeSubtask = issue.subtaskStats.total === 0;
  const becomeSubtaskCandidates = (allIssues ?? []).filter(
    (i) => i.id !== issue.id,
  );
  const linkCandidates = (allIssues ?? []).filter(
    (i) => i.id !== issue.id && i.subtaskStats.total === 0,
  );

  return (
    <div className="mb-6 flex flex-col gap-3">
      {canBecomeSubtask && (
        <div>
          {!showMakeSubtaskForm ? (
            <button
              onClick={() => setShowMakeSubtaskForm(true)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <GitBranch className="h-3 w-3" />
              Make this a sub-issue
            </button>
          ) : (
            <div className="flex gap-2">
              <Select
                value={makeSubtaskParentId}
                onValueChange={(value) => setMakeSubtaskParentId(value)}
              >
                <option value="">Select a parent issue…</option>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {becomeSubtaskCandidates.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.key} — {i.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                disabled={!makeSubtaskParentId || setParent.isPending}
                onClick={handleMakeSubtask}
              >
                Set parent
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowMakeSubtaskForm(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">
              Subtasks
              {issue.subtaskStats.total > 0 && (
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  {issue.subtaskStats.done}/{issue.subtaskStats.total}
                </span>
              )}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowLinkForm((v) => !v)}
            >
              <Link2 className="h-3.5 w-3.5" />
              Link existing
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAddForm((v) => !v)}
            >
              <Plus className="h-3.5 w-3.5" />
              Add subtask
            </Button>
          </div>
        </div>

        {issue.subtasks.length > 0 && (
          <div className="mb-2 divide-y divide-border rounded-md border border-border">
            {issue.subtasks.map((sub) => (
              <div key={sub.id} className="flex items-center gap-2 px-3 py-2">
                <StatusIcon status={sub.status} />
                <Link
                  href={`/orgs/${orgSlug}/projects/${projectIdentifier}/issues/${sub.number}`}
                  className="flex-1 truncate text-sm text-foreground hover:underline"
                >
                  <span className="mr-1.5 font-mono text-xs text-muted-foreground">
                    {sub.key}
                  </span>
                  {sub.title}
                </Link>
                <button
                  onClick={() =>
                    setParent.mutate({ number: sub.number, parentId: null })
                  }
                  className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Remove subtask"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {showLinkForm && (
          <div className="mb-2 flex gap-2">
            <Select
              value={linkTargetId}
              onValueChange={(value) => setLinkTargetId(value)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {linkCandidates.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.key} — {i.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              disabled={!linkTargetId || setParent.isPending}
              onClick={handleLinkExisting}
            >
              Link
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowLinkForm(false)}
            >
              Cancel
            </Button>
          </div>
        )}

        {showAddForm && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newTitle.trim()) createSubtask.mutate(newTitle.trim());
            }}
            className="flex gap-2"
          >
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Subtask title"
              className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Button
              size="sm"
              type="submit"
              disabled={!newTitle.trim() || createSubtask.isPending}
            >
              Add
            </Button>
            <Button
              size="sm"
              type="button"
              variant="ghost"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
