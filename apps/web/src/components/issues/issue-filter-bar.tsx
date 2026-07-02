"use client";

import {
  getPriorityLabel,
  PRIORITY_OPTIONS,
  PriorityIcon,
} from "@/components/issues/priority-icon";
import {
  getStatusLabel,
  STATUS_OPTIONS,
  StatusIcon,
} from "@/components/issues/status-icon";
import { useIssueFilters } from "@/hooks/use-issue-filters";
import { cn } from "@/lib/utils";
import type { ProjectMemberDto } from "@projecthub/types";
import { ChevronDown, Search, X } from "lucide-react";
import { useRef } from "react";

interface FilterBarProps {
  members?: ProjectMemberDto[];
}

export function IssueFilterBar({ members }: FilterBarProps) {
  const {
    filters,
    setSearch,
    toggleStatus,
    togglePriority,
    setAssignee,
    clearFilters,
    hasActiveFilters,
  } = useIssueFilters();
  const searchRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={searchRef}
          type="text"
          placeholder="Search issues…"
          value={filters.search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            "h-8 w-48 rounded-md border border-input bg-background pl-8 pr-3 text-sm",
            "text-foreground placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            "transition-all",
          )}
        />
        {filters.search && (
          <button
            onClick={() => {
              setSearch("");
              searchRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Status multi-select */}
      <FilterDropdown label="Status" activeCount={filters.statuses.length}>
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            onClick={() => toggleStatus(status)}
            className={cn(
              "flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors",
              filters.statuses.includes(status)
                ? "bg-muted text-foreground"
                : "text-foreground hover:bg-muted/50",
            )}
          >
            <StatusIcon status={status} />
            <span>{getStatusLabel(status)}</span>
            {filters.statuses.includes(status) && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </button>
        ))}
      </FilterDropdown>

      {/* Priority multi-select */}
      <FilterDropdown label="Priority" activeCount={filters.priorities.length}>
        {PRIORITY_OPTIONS.map((priority) => (
          <button
            key={priority}
            onClick={() => togglePriority(priority)}
            className={cn(
              "flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors",
              filters.priorities.includes(priority)
                ? "bg-muted text-foreground"
                : "text-foreground hover:bg-muted/50",
            )}
          >
            <PriorityIcon priority={priority} />
            <span>{getPriorityLabel(priority)}</span>
            {filters.priorities.includes(priority) && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </button>
        ))}
      </FilterDropdown>

      {/* Assignee filter */}
      {members && members.length > 0 && (
        <FilterDropdown
          label="Assignee"
          activeCount={filters.assigneeId ? 1 : 0}
        >
          <button
            onClick={() => setAssignee("")}
            className={cn(
              "flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors",
              !filters.assigneeId
                ? "bg-muted text-foreground"
                : "text-foreground hover:bg-muted/50",
            )}
          >
            <span>Anyone</span>
          </button>
          <button
            onClick={() => setAssignee("unassigned")}
            className={cn(
              "flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors",
              filters.assigneeId === "unassigned"
                ? "bg-muted text-foreground"
                : "text-foreground hover:bg-muted/50",
            )}
          >
            <div className="h-5 w-5 rounded-full border border-dashed border-muted-foreground" />
            <span>Unassigned</span>
          </button>
          {members.map((m) => (
            <button
              key={m.user.id}
              onClick={() =>
                setAssignee(filters.assigneeId === m.user.id ? "" : m.user.id)
              }
              className={cn(
                "flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors",
                filters.assigneeId === m.user.id
                  ? "bg-muted text-foreground"
                  : "text-foreground hover:bg-muted/50",
              )}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
                {(m.user.name ?? m.user.email).charAt(0).toUpperCase()}
              </span>
              <span className="truncate">{m.user.name ?? m.user.email}</span>
              {filters.assigneeId === m.user.id && (
                <span className="ml-auto text-xs text-muted-foreground">✓</span>
              )}
            </button>
          ))}
        </FilterDropdown>
      )}

      {/* Clear all */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      )}
    </div>
  );
}

// ── Reusable dropdown wrapper ─────────────────────────────────────────────────

interface FilterDropdownProps {
  label: string;
  activeCount: number;
  children: React.ReactNode;
}

function FilterDropdown({ label, activeCount, children }: FilterDropdownProps) {
  return (
    <div className="relative">
      <details className="group">
        <summary
          className={cn(
            "flex h-8 cursor-pointer list-none items-center gap-1.5 rounded-md border px-2.5 text-sm transition-colors select-none",
            activeCount > 0
              ? "border-foreground/40 bg-muted text-foreground"
              : "border-input bg-background text-muted-foreground hover:text-foreground",
          )}
        >
          {label}
          {activeCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
              {activeCount}
            </span>
          )}
          <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" />
        </summary>
        <div className="absolute left-0 top-10 z-50 min-w-40 rounded-lg border border-border bg-card p-1 shadow-lg">
          {children}
        </div>
      </details>
    </div>
  );
}
