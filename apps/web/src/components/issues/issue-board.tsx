"use client";

import type { IssueDto, IssueStatus } from "@projecthub/types";
import { BoardColumn } from "./board-column";
import { STATUS_OPTIONS } from "./status-icon";

interface IssueBoardProps {
  issues: IssueDto[];
  orgSlug: string;
  projectIdentifier: string;
  onUpdateStatus: (issueNumber: number, newStatus: IssueStatus) => void;
}

export function IssueBoard({
  issues,
  orgSlug,
  projectIdentifier,
  onUpdateStatus,
}: IssueBoardProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {STATUS_OPTIONS.map((status) => (
        <BoardColumn
          key={status}
          status={status}
          issues={issues.filter((i) => i.status === status)}
          orgSlug={orgSlug}
          projectIdentifier={projectIdentifier}
          onDropIssue={onUpdateStatus}
        />
      ))}
    </div>
  );
}
