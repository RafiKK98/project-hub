import { useCreateComment } from "@/hooks/use-comments";
import { useAuthStore } from "@/store/auth.store";
import { SubmitEvent, useState } from "react";
import { Avatar } from "../ui/avatar";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface CommentComposerProps {
  orgId: string;
  projectId: string;
  issueNumber: number;
}

export function CommentComposer({
  orgId,
  projectId,
  issueNumber,
}: CommentComposerProps) {
  const [body, setBody] = useState("");
  const currentUser = useAuthStore((s) => s.user);
  const createComment = useCreateComment(orgId, projectId, issueNumber);

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;

    createComment.mutate({ body: trimmed }, { onSuccess: () => setBody("") });
  }
  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <Avatar name={currentUser?.name ?? currentUser?.email} size="sm" />
      <div className="flex-1 min-w-0">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Leave a comment..."
          rows={3}
        />
        <div className="mt-2 flex justify-end">
          <Button
            type="submit"
            size="sm"
            isLoading={createComment.isPending}
            disabled={!body.trim()}
          >
            Comment
          </Button>
        </div>
      </div>
    </form>
  );
}
