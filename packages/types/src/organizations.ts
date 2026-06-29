export type MemberRole =
  "OWNER" | "ADMIN" | "MANAGER" | "DEVELOPER" | "REPORTER" | "GUEST";

export type InvitationStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";

export interface OrganizationDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatarUrl: string | null;
  createdAt: string;
  memberCount: number;
  currentUserRole: MemberRole;
}

export interface MembershipDto {
  id: string;
  role: MemberRole;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
}

export interface InvitationDto {
  id: string;
  email: string;
  role: MemberRole;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  invitedBy: {
    id: string;
    name: string | null;
    email: string;
  };
}

// ── Request payloads ─────────────────────────────────────────────────────────

export interface CreateOrganizationPayload {
  name: string;
  description?: string;
}

export interface UpdateOrganizationPayload {
  name?: string;
  description?: string;
}

export interface InviteMemberPayload {
  email: string;
  role: MemberRole;
}

export interface UpdateMemberRolePayload {
  role: MemberRole;
}
