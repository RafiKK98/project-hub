"use client";

import { Avatar, AvatarFallback } from "@/components/ui/shadcn/avatar";
import { Button } from "@/components/ui/shadcn/button";
import { Spinner } from "@/components/ui/shadcn/spinner";
import { Textarea } from "@/components/ui/shadcn/textarea";
import { useDeleteComment, useUpdateComment } from "@/hooks/use-comments";
import { CommentDto } from "@projecthub/types";
import { useState } from "react";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface CommentItemProps {
  comment: CommentDto;
  orgId: string;
  projectId: string;
  issueNumber: number;
}

export function CommentItem({
  comment,
  orgId,
  projectId,
  issueNumber,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.body);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const updateComment = useUpdateComment(orgId, projectId, issueNumber);
  const deleteComment = useDeleteComment(orgId, projectId, issueNumber);

  function handleSave() {
    if (!draft.trim() || draft.trim() === comment.body) {
      setIsEditing(false);
      setDraft(comment.body);
      return;
    }

    updateComment.mutate(
      { commentId: comment.id, payload: { body: draft.trim() } },
      { onSuccess: () => setIsEditing(false) },
    );
  }

  function handleCancel() {
    setDraft(comment.body);
    setIsEditing(false);
  }
  return (
    <div className="flex gap-3">
      <Avatar size="sm">
        <AvatarFallback name={comment.author.name ?? comment.author.email} />
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {comment.author.name ?? comment.author.email}
          </span>
          <span className="text-xs text-muted-foreground">
            {timeAgo(comment.createdAt)}
          </span>
          {comment.editedAt && (
            <span className="text-xs text-muted-foreground">(edited)</span>
          )}
        </div>

        {isEditing ? (
          <div className="mt-1.5 flex flex-col gap-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={updateComment.isPending}
                onClick={handleSave}
              >
                Save
                {updateComment.isPending && (
                  <Spinner data-icon="inline-start" />
                )}
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-0.5 whitespace-pre-wrap text-sm text-foreground">
            {comment.body}
          </p>
        )}

        {!isEditing && (comment.canEdit || comment.canDelete) && (
          <div className="mt-1.5 flex items-center gap-3">
            {comment.canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Edit
              </button>
            )}
            {comment.canDelete &&
              (confirmDelete ? (
                <span className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Delete?</span>
                  <button
                    onClick={() => deleteComment.mutate(comment.id)}
                    className="font-medium text-destructive hover:underline"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Delete
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
