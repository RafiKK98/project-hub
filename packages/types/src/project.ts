export type ProjectStatus = "ACTIVE" | "ARCHIVED" | "PAUSED";

export type ProjectMemberRole = "MANAGER" | "DEVELOPER" | "REPORTER" | "GUEST";

export interface ProjectDto {
  id: string;
  name: string;
  identifier: string;
  description: string | null;
  status: ProjectStatus;
  organizationId: string;
  createdById: string;
  createdAt: string;
  memberCount: number;
  currentUserRole: ProjectMemberRole | null;
}
export interface ProjectMemberDto {
  id: string;
  role: ProjectMemberRole;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
}

// ── Request payloads ─────────────────────────────────────────────────────────

export interface CreateProjectPayload {
  name: string;
  identifier: string;
  description?: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}

export interface AddProjectMemberPayload {
  userId: string;
  role: ProjectMemberRole;
}

export interface UpdateProjectMemberRolePayload {
  role: ProjectMemberRole;
}
