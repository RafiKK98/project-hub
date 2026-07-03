"use client";

import type { IssueDto, IssueStatus } from "@projecthub/types";
import dynamic from "next/dynamic";

// @dnd-kit uses browser APIs (PointerEvent, window) — must be client-only.
// dynamic() with ssr:false ensures it never runs during SSR and is code-split
// from the initial bundle, so users on list view never download DnD code.
const IssueBoard = dynamic(
  () => import("@/components/issues/issue-board").then((m) => m.IssueBoard),
  {
    ssr: false,
    loading: () => (
      <div className="flex gap-3 overflow-x-auto pb-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex w-72 shrink-0 flex-col rounded-lg border border-border bg-muted/20"
          >
            <div className="border-b border-border px-3 py-2.5">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            </div>
            <div className="flex flex-col gap-2 p-2">
              {[...Array(2)].map((_, j) => (
                <div
                  key={j}
                  className="h-20 animate-pulse rounded-md border border-border bg-card"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    ),
  },
);

interface LazyIssueBoardProps {
  issues: IssueDto[];
  orgSlug: string;
  projectIdentifier: string;
  onReorder: (
    issueNumber: number,
    newBoardOrder: number,
    newStatus: IssueStatus,
  ) => void;
}

export function LazyIssueBoard(props: LazyIssueBoardProps) {
  return <IssueBoard {...props} />;
}
