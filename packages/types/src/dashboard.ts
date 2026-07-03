import type { IssueDto } from "./issue";
import type { ProjectStatus } from "./project";

export interface ProjectStatusBreakdown {
  projectId: string;
  projectName: string;
  projectIdentifier: string;
  orgSlug: string;
  status: ProjectStatus;
  counts: {
    BACKLOG: number;
    TODO: number;
    IN_PROGRESS: number;
    IN_REVIEW: number;
    DONE: number;
    CANCELLED: number;
  };
  total: number;
}

export interface DashboardDto {
  assignedToMe: IssueDto[];
  recentlyUpdated: IssueDto[];
  projectBreakdowns: ProjectStatusBreakdown[];
}
