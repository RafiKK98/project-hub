import { issueKeys, useSetParent } from "@/hooks/use-issues";
import { ApiClientError } from "@/lib/api-client";
import { issuesApi } from "@/lib/issues-api";
import { IssueDto } from "@projecthub/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ListChecks, Plus, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
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
  const [title, setTitle] = useState("");
  const queryClient = useQueryClient();
  const setParent = useSetParent(orgId, projectId);

  const createSubtask = useMutation({
    mutationFn: (t: string) =>
      issuesApi.create(orgId, projectId, { title: t, parentId: issue.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: issueKeys.all(orgId, projectId),
      });
      setTitle("");
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

  // This issue IS a subtask — just show the parent link. Subtasks can't
  // have their own subtasks, so no "add subtask" UI here.
  if (issue.parent)
    return (
      <div className="mb-6 flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
        <span className="shrink-0 text-muted-foreground">Sub-issue of</span>
        <Link
          href={`/orgs/${orgSlug}/projects/${projectIdentifier}/issues/${issue.parent.number}`}
          className="shrink-0 font-mono text-xs text-foreground hover:underline"
        >
          {issue.parent.key}
        </Link>
        <span className="truncate text-foreground">{issue.parent.title}</span>
        <button
          onClick={() =>
            setParent.mutate({ number: issue.number, parentId: null })
          }
          className="ml-auto shrink-0 text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Remove from parent"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );

  return (
    <div className="mb-6">
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
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowAddForm((v) => !v)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add subtask
        </Button>
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

      {showAddForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (title.trim()) createSubtask.mutate(title.trim());
          }}
          className="flex gap-2"
        >
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Subtask title"
            className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <Button
            size="sm"
            type="submit"
            disabled={!title.trim() || createSubtask.isPending}
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
  );
}
