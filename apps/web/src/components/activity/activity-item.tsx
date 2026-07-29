import { timeAgo } from "@/lib/utils";
import {
  ActivityDto,
  AssigneeChangedPayload,
  DueDateChangedPayload,
  IssuePriority,
  IssueStatus,
  LabelsChangedPayload,
  ParentChangedPayload,
  PriorityChangedPayload,
  StatusChangedPayload,
} from "@projecthub/types";
import {
  Calendar,
  CircleDot,
  FileText,
  GitBranch,
  LucideIcon,
  Pencil,
  Sparkles,
  Tag,
  UserRound,
} from "lucide-react";
import { getPriorityLabel } from "../issues/priority-icon";
import { getStatusLabel } from "../issues/status-icon";

function describeActivity(activity: ActivityDto): {
  icon: LucideIcon;
  text: string;
} {
  const actorName = activity.actor.name ?? activity.actor.email;

  switch (activity.type) {
    case "ISSUE_CREATED":
      return { icon: Sparkles, text: `${actorName} created this issue` };

    case "TITLE_CHANGED":
      return { icon: Pencil, text: `${actorName} changed the title` };

    case "DESCRIPTION_CHANGED":
      return { icon: FileText, text: `${actorName} updated the description` };

    case "STATUS_CHANGED": {
      const p = activity.payload as StatusChangedPayload;
      return {
        icon: CircleDot,
        text: `${actorName} changed status from ${getStatusLabel(p.oldStatus as IssueStatus)} to ${getStatusLabel(p.newStatus as IssueStatus)}`,
      };
    }

    case "PRIORITY_CHANGED": {
      const p = activity.payload as PriorityChangedPayload;
      return {
        icon: CircleDot,
        text: `${actorName} changed priority from ${getPriorityLabel(p.oldPriority as IssuePriority)} to ${getPriorityLabel(p.newPriority as IssuePriority)}`,
      };
    }

    case "ASSIGNEE_CHANGED": {
      const p = activity.payload as AssigneeChangedPayload;
      if (!p.oldAssigneeName && p.newAssigneeName) {
        return {
          icon: UserRound,
          text: `${actorName} assigned this to ${p.newAssigneeName}`,
        };
      }
      if (p.oldAssigneeName && !p.newAssigneeName) {
        return {
          icon: UserRound,
          text: `${actorName} unassigned ${p.oldAssigneeName}`,
        };
      }
      return {
        icon: UserRound,
        text: `${actorName} reassigned from ${p.oldAssigneeName} to ${p.newAssigneeName}`,
      };
    }

    case "DUE_DATE_CHANGED": {
      const p = activity.payload as DueDateChangedPayload;
      if (!p.oldDueDate && p.newDueDate) {
        return {
          icon: Calendar,
          text: `${actorName} set the due date to ${new Date(p.newDueDate).toLocaleDateString()}`,
        };
      }
      if (p.oldDueDate && !p.newDueDate) {
        return { icon: Calendar, text: `${actorName} removed the due date` };
      }
      return {
        icon: Calendar,
        text: `${actorName} changed the due date to ${new Date(p.newDueDate!).toLocaleDateString()}`,
      };
    }

    case "LABELS_CHANGED": {
      const p = activity.payload as LabelsChangedPayload;
      const parts: string[] = [];
      if (p.added.length)
        parts.push(`added ${p.added.map((l) => l.name).join(", ")}`);
      if (p.removed.length)
        parts.push(`removed ${p.removed.map((l) => l.name).join(", ")}`);
      return { icon: Tag, text: `${actorName} ${parts.join(" and ")}` };
    }

    case "PARENT_CHANGED": {
      const p = activity.payload as ParentChangedPayload;
      if (!p.oldParentKey && p.newParentKey)
        return {
          icon: GitBranch,
          text: `${actorName} marked this as a sub-issue of ${p.newParentKey}`,
        };
      if (p.oldParentKey && !p.newParentKey)
        return {
          icon: GitBranch,
          text: `${actorName} removed this from ${p.oldParentKey}`,
        };
      return {
        icon: GitBranch,
        text: `${actorName} moved this from ${p.oldParentKey} to ${p.newParentKey}`,
      };
    }

    default:
      return { icon: CircleDot, text: `${actorName} updated this issue` };
  }
}

interface ActivityItemProps {
  activity: ActivityDto;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const { icon: Icon, text } = describeActivity(activity);
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
        <Icon className="h-3 w-3 text-muted-foreground" />
      </div>
      <p className="text-xs">
        <span className="text-foreground">{text}</span>{" "}
        <span className="text-muted-foreground">
          {timeAgo(activity.createdAt)}
        </span>{" "}
      </p>
    </div>
  );
}
