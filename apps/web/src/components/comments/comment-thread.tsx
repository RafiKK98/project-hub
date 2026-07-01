import { useComments } from "@/hooks/use-comments";
import { MessageSquare } from "lucide-react";
import { CommentComposer } from "./comment-composer";
import { CommentItem } from "./comment-item";

interface CommentThreadProps {
  orgId: string;
  projectId: string;
  issueNumber: number;
}

export function CommentThread({
  orgId,
  projectId,
  issueNumber,
}: CommentThreadProps) {
  const { data: comments, isLoading } = useComments(
    orgId,
    projectId,
    issueNumber,
  );

  return (
    <div className="mt-10 border-t border-border pt-8">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-medium text-foreground">
          Comments {comments && comments.length > 0 && `(${comments.length})`}
        </h2>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                <div className="h-10 w-full animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {comments?.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              orgId={orgId}
              projectId={projectId}
              issueNumber={issueNumber}
            />
          ))}
        </div>
      )}

      <div className={comments && comments.length > 0 ? "mt-6" : "mt-0"}>
        <CommentComposer
          orgId={orgId}
          projectId={projectId}
          issueNumber={issueNumber}
        />
      </div>
    </div>
  );
}
