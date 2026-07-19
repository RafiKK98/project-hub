"use client";

import { CommentThread } from "@/components/comments/comment-thread";
import {
  getPriorityLabel,
  PRIORITY_OPTIONS,
} from "@/components/issues/priority-icon";
import {
  getStatusLabel,
  STATUS_OPTIONS,
} from "@/components/issues/status-icon";
import { Select } from "@/components/ui/select";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/shadcn/avatar";
import { Button } from "@/components/ui/shadcn/button";
import { Spinner } from "@/components/ui/shadcn/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useDeleteIssue, useIssue, useUpdateIssue } from "@/hooks/use-issues";
import { useOrganization } from "@/hooks/use-organizations";
import {
  useProjectByIdentifier,
  useProjectMembers,
} from "@/hooks/use-projects";
import { getInitials } from "@/lib/utils";
import type { IssuePriority, IssueStatus } from "@projecthub/types";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";

interface IssueDetailPageProps {
  params: Promise<{ slug: string; identifier: string; number: string }>;
}

export default function IssueDetailPage({ params }: IssueDetailPageProps) {
  const { slug, identifier, number } = use(params);
  const issueNumber = parseInt(number, 10);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [descDraft, setDescDraft] = useState("");
  const [prevIssueId, setPrevIssueId] = useState<string | undefined>();

  const { data: org } = useOrganization(slug);
  const { data: project } = useProjectByIdentifier(org?.id ?? "", identifier);
  const { data: members } = useProjectMembers(org?.id ?? "", project?.id ?? "");
  const { data: issue, isLoading } = useIssue(
    org?.id ?? "",
    project?.id ?? "",
    issueNumber,
  );
  const updateIssue = useUpdateIssue(
    org?.id ?? "",
    project?.id ?? "",
    issueNumber,
  );
  const deleteIssue = useDeleteIssue(
    org?.id ?? "",
    project?.id ?? "",
    slug,
    identifier,
  );

  if (issue && issue.id !== prevIssueId) {
    setPrevIssueId(issue.id);
    setTitleDraft(issue.title);
    setDescDraft(issue.description ?? "");
  }

  function commitTitle() {
    if (issue && titleDraft.trim() && titleDraft !== issue.title)
      updateIssue.mutate({ title: titleDraft.trim() });
  }

  function commitDescription() {
    if (issue && descDraft !== (issue.description ?? ""))
      updateIssue.mutate({ description: descDraft });
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="space-y-4">
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          <div className="h-8 w-96 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-muted-foreground">Issue not found.</p>
        <Link
          href={`/orgs/${slug}/projects/${identifier}`}
          className="mt-4 inline-block text-sm text-foreground underline"
        >
          Back to project
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href={`/orgs/${slug}/projects/${identifier}`}
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {project?.name}
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <span className="font-mono text-sm text-muted-foreground">
          {issue.key}
        </span>
        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Delete this issue?
            </span>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteIssue.isPending}
              onClick={() => deleteIssue.mutate(issue.number)}
            >
              Confirm
              {deleteIssue.isPending && <Spinner data-icon="inline-start" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Delete issue"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Title — inline editable */}
      <textarea
        value={titleDraft}
        onChange={(e) => setTitleDraft(e.target.value)}
        onBlur={commitTitle}
        rows={1}
        className="mb-6 w-full resize-none overflow-hidden border-none bg-transparent text-2xl font-semibold tracking-tight text-foreground outline-none focus:ring-0"
      />

      <div className="grid grid-cols-[1fr_220px] gap-8">
        {/* Main content */}
        <div className="min-w-0">
          <Textarea
            value={descDraft}
            onChange={(e) => setDescDraft(e.target.value)}
            onBlur={commitDescription}
            placeholder="Add a description..."
            rows={8}
            className="border-none bg-transparent px-0 text-sm focus-visible:ring-0"
          />

          {/* Comments */}
          {org && project && (
            <CommentThread
              orgId={org.id}
              projectId={project.id}
              issueNumber={issueNumber}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-5">
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              Status
            </p>
            <Select
              value={issue.status}
              onChange={(e) =>
                updateIssue.mutate({ status: e.target.value as IssueStatus })
              }
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {getStatusLabel(s)}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              Priority
            </p>
            <Select
              value={issue.priority}
              onChange={(e) =>
                updateIssue.mutate({
                  priority: e.target.value as IssuePriority,
                })
              }
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {getPriorityLabel(p)}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              Assignee
            </p>
            <Select
              value={issue.assignee?.id ?? ""}
              onChange={(e) =>
                updateIssue.mutate({ assigneeId: e.target.value || null })
              }
            >
              <option value="">Unassigned</option>
              {members?.map((m) => (
                <option key={m.user.id} value={m.user.id}>
                  {m.user.name ?? m.user.email}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              Due date
            </p>
            <input
              type="date"
              value={issue.dueDate ? issue.dueDate.slice(0, 10) : ""}
              onChange={(e) =>
                updateIssue.mutate({ dueDate: e.target.value || null })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="border-t border-border pt-4">
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              Created by
            </p>
            <div className="flex items-center gap-2">
              <Avatar size="sm">
                <AvatarImage
                  src={issue.createdBy.avatarUrl!}
                  alt={`@${issue.createdBy.email.split("@")[0]}`}
                />
                <AvatarFallback className="bg-teal-500 text-muted">
                  {getInitials(issue.createdBy.name ?? issue.createdBy.email)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-foreground">
                {issue.createdBy.name ?? issue.createdBy.email}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
