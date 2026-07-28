import { useActivity } from "@/hooks/use-activity";
import { useComments } from "@/hooks/use-comments";
import { ActivityDto, CommentDto } from "@projecthub/types";
import { MessageSquare } from "lucide-react";
import { ActivityItem } from "../activity/activity-item";
import { CommentComposer } from "./comment-composer";
import { CommentItem } from "./comment-item";

interface CommentThreadProps {
  orgId: string;
  projectId: string;
  issueNumber: number;
}

type TimelineEntry =
  | { kind: "comment"; createdAt: string; data: CommentDto }
  | { kind: "activity"; createdAt: string; data: ActivityDto };

export function CommentThread({
  orgId,
  projectId,
  issueNumber,
}: CommentThreadProps) {
  const { data: comments, isLoading: commentsLoading } = useComments(
    orgId,
    projectId,
    issueNumber,
  );
  const { data: activity, isLoading: activityLoading } = useActivity(
    orgId,
    projectId,
    issueNumber,
  );

  const isLoading = commentsLoading || activityLoading;

  const entries: TimelineEntry[] = [
    ...(comments ?? []).map((c): TimelineEntry => ({
      kind: "comment",
      createdAt: c.createdAt,
      data: c,
    })),
    ...(activity ?? []).map((a): TimelineEntry => ({
      kind: "activity",
      createdAt: a.createdAt,
      data: a,
    })),
  ].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const commentCount = comments?.length ?? 0;

  return (
    <div className="mt-10 border-t border-border pt-8">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-medium text-foreground">
          Activity
          {commentCount > 0 &&
            ` · ${commentCount} ${commentCount === 1 ? "comment" : "comments"}`}
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
          {entries.map((entry) =>
            entry.kind === "comment" ? (
              <CommentItem
                key={`c-${entry.data.id}`}
                comment={entry.data}
                orgId={orgId}
                projectId={projectId}
                issueNumber={issueNumber}
              />
            ) : (
              <ActivityItem key={`a-${entry.data.id}`} activity={entry.data} />
            ),
          )}
        </div>
      )}

      <div className={entries.length > 0 ? "mt-6" : "mt-0"}>
        <CommentComposer
          orgId={orgId}
          projectId={projectId}
          issueNumber={issueNumber}
        />
      </div>
    </div>
  );
}
