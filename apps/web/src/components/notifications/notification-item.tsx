import { cn, timeAgo } from "@/lib/utils";
import type { NotificationDto, NotificationType } from "@projecthub/types";
import { CircleDot, GitBranch, MessageSquare, UserPlus } from "lucide-react";
import Link from "next/link";

function NotificationIcon({ type }: { type: NotificationType }) {
  const className = "h-4 w-4 shrink-0";
  switch (type) {
    case "ISSUE_ASSIGNED":
      return <GitBranch className={cn(className, "text-blue-500")} />;
    case "ISSUE_STATUS_CHANGED":
      return <CircleDot className={cn(className, "text-yellow-500")} />;
    case "COMMENT_ADDED":
      return <MessageSquare className={cn(className, "text-violet-500")} />;
    case "MEMBER_INVITED":
    case "MEMBER_JOINED":
      return <UserPlus className={cn(className, "text-green-500")} />;
    default:
      return <CircleDot className={cn(className, "text-muted-foreground")} />;
  }
}

function getNotificationHref(notification: NotificationDto): string | null {
  const p = notification.payload;
  switch (notification.type) {
    case "ISSUE_ASSIGNED":
    case "ISSUE_STATUS_CHANGED":
    case "COMMENT_ADDED": {
      const payload = p as {
        orgSlug: string;
        projectIdentifier: string;
        issueNumber?: number;
      };
      const num = "issueNumber" in payload ? payload.issueNumber : undefined;
      if (payload.orgSlug && payload.projectIdentifier) {
        return `/orgs/${payload.orgSlug}/projects/${payload.projectIdentifier}${num ? `/issues/${num}` : ""}`;
      }
      return null;
    }
    case "MEMBER_INVITED": {
      const payload = p as { invitationId: string };
      return payload.invitationId
        ? `/invitations/${payload.invitationId}`
        : null;
    }
    case "MEMBER_JOINED": {
      const payload = p as { orgSlug: string };
      return payload.orgSlug ? `/orgs/${payload.orgSlug}` : null;
    }
    default:
      return null;
  }
}

interface NotificationItemProps {
  notification: NotificationDto;
  onRead: (id: string) => void;
}

export function NotificationItem({
  notification,
  onRead,
}: NotificationItemProps) {
  const href = getNotificationHref(notification);
  const isUnread = !notification.readAt;

  const content = (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
        isUnread && "bg-muted/20",
      )}
      onClick={() => isUnread && onRead(notification.id)}
    >
      <div className="mt-0.5">
        <NotificationIcon type={notification.type} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm",
            isUnread ? "font-medium text-foreground" : "text-foreground",
          )}
        >
          {notification.title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
          {notification.body}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {timeAgo(notification.createdAt)}
        </p>
      </div>
      {isUnread && (
        <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return <div className="cursor-default">{content}</div>;
}
