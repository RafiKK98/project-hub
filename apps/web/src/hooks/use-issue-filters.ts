"use client";

import type { IssuePriority, IssueStatus } from "@projecthub/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export interface ActiveFilters {
  search: string;
  statuses: IssueStatus[];
  priorities: IssuePriority[];
  assigneeId: string;
}

export function useIssueFilters(): {
  filters: ActiveFilters;
  setSearch: (q: string) => void;
  toggleStatus: (s: IssueStatus) => void;
  togglePriority: (p: IssuePriority) => void;
  setAssignee: (id: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
} {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters: ActiveFilters = {
    search: searchParams.get("q") ?? "",
    statuses: (searchParams.get("status")?.split(",").filter(Boolean) ??
      []) as IssueStatus[],
    priorities: (searchParams.get("priority")?.split(",").filter(Boolean) ??
      []) as IssuePriority[],
    assigneeId: searchParams.get("assignee") ?? "",
  };

  const hasActiveFilters =
    Boolean(filters.search) ||
    filters.statuses.length > 0 ||
    filters.priorities.length > 0 ||
    Boolean(filters.assigneeId);

  const update = useCallback(
    (
      updates: Partial<
        Record<"q" | "status" | "priority" | "assignee", string>
      >,
    ) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const setSearch = useCallback((q: string) => update({ q }), [update]);

  const toggleStatus = useCallback(
    (status: IssueStatus) => {
      const current = filters.statuses;
      const next = current.includes(status)
        ? current.filter((s) => s !== status)
        : [...current, status];
      update({ status: next.join(",") });
    },
    [filters.statuses, update],
  );

  const togglePriority = useCallback(
    (priority: IssuePriority) => {
      const current = filters.priorities;
      const next = current.includes(priority)
        ? current.filter((p) => p !== priority)
        : [...current, priority];
      update({ priority: next.join(",") });
    },
    [filters.priorities, update],
  );

  const setAssignee = useCallback(
    (id: string) => update({ assignee: id }),
    [update],
  );

  const clearFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  return {
    filters,
    setSearch,
    toggleStatus,
    togglePriority,
    setAssignee,
    clearFilters,
    hasActiveFilters,
  };
}

/**
 * Applies active filters to an issue list client-side.
 */
export function applyIssueFilters<
  T extends {
    title: string;
    status: IssueStatus;
    priority: IssuePriority;
    assignee: { id: string } | null;
  },
>(issues: T[], filters: ActiveFilters): T[] {
  return issues.filter((issue) => {
    if (
      filters.search &&
      !issue.title.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;

    if (filters.statuses.length > 0 && !filters.statuses.includes(issue.status))
      return false;

    if (
      filters.priorities.length > 0 &&
      !filters.priorities.includes(issue.priority)
    )
      return false;

    if (filters.assigneeId) {
      if (filters.assigneeId === "unassigned" && issue.assignee !== null)
        return false;
      if (
        filters.assigneeId !== "unassigned" &&
        issue.assignee?.id !== filters.assigneeId
      )
        return false;
    }
    return true;
  });
}
