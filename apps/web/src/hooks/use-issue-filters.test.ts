import { applyIssueFilters } from "@/hooks/use-issue-filters";
import type { IssueDto } from "@projecthub/types";
import { describe, expect, it } from "vitest";

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeIssue(overrides: Partial<IssueDto>): IssueDto {
  return {
    id: "issue-1",
    number: 1,
    key: "WEB-1",
    title: "Fix login button",
    description: null,
    status: "BACKLOG",
    priority: "NO_PRIORITY",
    boardOrder: 1000,
    projectId: "project-1",
    createdById: "user-1",
    dueDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: {
      id: "user-1",
      name: "Jane",
      email: "jane@example.com",
      avatarUrl: null,
    },
    assignee: null,
    ...overrides,
  };
}

const emptyFilters = {
  search: "",
  statuses: [],
  priorities: [],
  assigneeId: "",
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("applyIssueFilters", () => {
  const issues: IssueDto[] = [
    makeIssue({
      id: "1",
      title: "Fix login button",
      status: "TODO",
      priority: "HIGH",
    }),
    makeIssue({
      id: "2",
      title: "Add dark mode",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
    }),
    makeIssue({
      id: "3",
      title: "Write tests",
      status: "DONE",
      priority: "LOW",
      assignee: {
        id: "user-2",
        name: "Bob",
        email: "bob@example.com",
        avatarUrl: null,
      },
    }),
    makeIssue({
      id: "4",
      title: "Deploy to production",
      status: "BACKLOG",
      priority: "URGENT",
    }),
  ];

  it("returns all issues when no filters are active", () => {
    expect(applyIssueFilters(issues, emptyFilters)).toHaveLength(4);
  });

  describe("search filter", () => {
    it("filters by title substring (case-insensitive)", () => {
      const result = applyIssueFilters(issues, {
        ...emptyFilters,
        search: "login",
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.title).toBe("Fix login button");
    });

    it("is case-insensitive", () => {
      const result = applyIssueFilters(issues, {
        ...emptyFilters,
        search: "DARK MODE",
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.title).toBe("Add dark mode");
    });

    it("returns empty array when no titles match", () => {
      const result = applyIssueFilters(issues, {
        ...emptyFilters,
        search: "nonexistent",
      });
      expect(result).toHaveLength(0);
    });

    it("returns all issues when search is empty string", () => {
      expect(
        applyIssueFilters(issues, { ...emptyFilters, search: "" }),
      ).toHaveLength(4);
    });
  });

  describe("status filter", () => {
    it("filters to a single status", () => {
      const result = applyIssueFilters(issues, {
        ...emptyFilters,
        statuses: ["TODO"],
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.status).toBe("TODO");
    });

    it("filters to multiple statuses (OR logic)", () => {
      const result = applyIssueFilters(issues, {
        ...emptyFilters,
        statuses: ["TODO", "IN_PROGRESS"],
      });
      expect(result).toHaveLength(2);
    });

    it("returns empty array when no issues match status", () => {
      const result = applyIssueFilters(issues, {
        ...emptyFilters,
        statuses: ["CANCELLED"],
      });
      expect(result).toHaveLength(0);
    });
  });

  describe("priority filter", () => {
    it("filters to a single priority", () => {
      const result = applyIssueFilters(issues, {
        ...emptyFilters,
        priorities: ["HIGH"],
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.priority).toBe("HIGH");
    });

    it("filters to multiple priorities", () => {
      const result = applyIssueFilters(issues, {
        ...emptyFilters,
        priorities: ["HIGH", "URGENT"],
      });
      expect(result).toHaveLength(2);
    });
  });

  describe("assignee filter", () => {
    it("filters to a specific assignee by userId", () => {
      const result = applyIssueFilters(issues, {
        ...emptyFilters,
        assigneeId: "user-2",
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.assignee?.id).toBe("user-2");
    });

    it('filters to unassigned issues when assigneeId is "unassigned"', () => {
      const result = applyIssueFilters(issues, {
        ...emptyFilters,
        assigneeId: "unassigned",
      });
      expect(result).toHaveLength(3); // all except the one with user-2
      result.forEach((i) => expect(i.assignee).toBeNull());
    });

    it("returns all issues when assigneeId is empty string", () => {
      expect(
        applyIssueFilters(issues, { ...emptyFilters, assigneeId: "" }),
      ).toHaveLength(4);
    });
  });

  describe("combined filters", () => {
    it("applies search AND status filters together", () => {
      const result = applyIssueFilters(issues, {
        ...emptyFilters,
        search: "login",
        statuses: ["TODO"],
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.title).toBe("Fix login button");
    });

    it("returns empty when filters are individually valid but have no overlap", () => {
      // "login" matches TODO issue, but DONE has no "login" title
      const result = applyIssueFilters(issues, {
        ...emptyFilters,
        search: "login",
        statuses: ["DONE"],
      });
      expect(result).toHaveLength(0);
    });

    it("handles all filters active simultaneously", () => {
      const result = applyIssueFilters(issues, {
        search: "Write",
        statuses: ["DONE"],
        priorities: ["LOW"],
        assigneeId: "user-2",
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.title).toBe("Write tests");
    });
  });
});
