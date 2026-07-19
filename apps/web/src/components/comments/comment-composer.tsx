import { Avatar, AvatarFallback } from "@/components/ui/shadcn/avatar";
import { Button } from "@/components/ui/shadcn/button";
import { Spinner } from "@/components/ui/shadcn/spinner";
import { Textarea } from "@/components/ui/shadcn/textarea";
import { useCreateComment } from "@/hooks/use-comments";
import { useAuthStore } from "@/store/auth.store";
import { SubmitEvent, useState } from "react";

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
      <Avatar size="sm">
        <AvatarFallback name={currentUser?.name ?? currentUser?.email} />
      </Avatar>
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
            disabled={createComment.isPending || !body.trim()}
          >
            Comment
            {createComment.isPending && <Spinner data-icon="inline-start" />}
          </Button>
        </div>
      </div>
    </form>
  );
}
