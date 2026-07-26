import { useOrgMembers } from "@/hooks/use-organizations";
import {
  useAddProjectMember,
  useProjectMembers,
  useRemoveProjectMember,
  useUpdateProjectMemberRole,
} from "@/hooks/use-projects";
import { useAuthStore } from "@/store/auth.store";
import { ProjectMemberRole } from "@projecthub/types";
import { UserPlus, Users, X } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Spinner } from "../ui/spinner";

const PROJECT_ROLES: ProjectMemberRole[] = [
  "MANAGER",
  "DEVELOPER",
  "REPORTER",
  "GUEST",
];

function roleLabel(role: string): string {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

interface ProjectMembersPanelProps {
  orgId: string;
  projectId: string;
  canManage: boolean;
}

export function ProjectMembersPanel({
  orgId,
  projectId,
  canManage,
}: ProjectMembersPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] =
    useState<ProjectMemberRole>("DEVELOPER");

  const currentUser = useAuthStore((s) => s.user);

  // Org members are the pool of people eligible to be added to this project —
  // project membership is always a subset of org membership.
  const { data: orgMembers } = useOrgMembers(orgId);
  const { data: projectMembers, isLoading } = useProjectMembers(
    orgId,
    projectId,
  );
  const addMember = useAddProjectMember(orgId, projectId);
  const updateRole = useUpdateProjectMemberRole(orgId, projectId);
  const removeMember = useRemoveProjectMember(orgId, projectId);

  const projectMemberIds = new Set(
    (projectMembers ?? []).map((m) => m.user.id),
  );
  const availableOrgMembers = (orgMembers ?? []).filter(
    (m) => !projectMemberIds.has(m.user.id),
  );

  function handleAdd() {
    if (!selectedUserId) return;
    addMember.mutate(
      { userId: selectedUserId, role: selectedRole },
      {
        onSuccess: () => {
          setSelectedUserId("");
          setSelectedRole("DEVELOPER");
          setShowAddForm(false);
        },
      },
    );
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-medium text-foreground">
            Manage Project Members
          </h2>
        </div>
        {canManage && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddForm((v) => !v)}
          >
            <UserPlus className="h-4 w-4" />
            Add member
          </Button>
        )}
      </div>

      {showAddForm && (
        <div className="mb-4 flex flex-wrap gap-2 rounded-lg border border-border bg-muted/30 p-4">
          {availableOrgMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Every organization member is already part of this project. Invite
              more people to the organization first.
            </p>
          ) : (
            <>
              <Select
                // className="flex-1 min-w-[180px]"
                value={selectedUserId}
                onValueChange={(value) => setSelectedUserId(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableOrgMembers.map((m) => (
                    <SelectItem key={m.user.id} value={m.user.id}>
                      {m.user.name ?? m.user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                // className="w-36"
                value={selectedRole}
                onValueChange={(value) =>
                  setSelectedRole(value as ProjectMemberRole)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {roleLabel(r)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                disabled={addMember.isPending || !selectedUserId}
                onClick={handleAdd}
              >
                Add
                {addMember.isPending && <Spinner data-icon="inline-start" />}
              </Button>
            </>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAddForm(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-lg border border-border bg-muted"
            />
          ))}
        </div>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {projectMembers?.map((member) => (
            <div key={member.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar size="sm">
                <AvatarFallback name={member.user.name} />
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {member.user.name ?? member.user.email}
                  {member.user.id === currentUser?.id && (
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      (you)
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {member.user.email}
                </p>
              </div>

              {canManage ? (
                <Select
                  value={member.role}
                  onValueChange={(value) =>
                    updateRole.mutate({
                      userId: member.user.id,
                      payload: { role: value as ProjectMemberRole },
                    })
                  }
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {roleLabel(r)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="text-xs font-medium text-muted-foreground">
                  {roleLabel(member.role)}
                </span>
              )}

              {canManage && (
                <Button
                  onClick={() => removeMember.mutate(member.user.id)}
                  variant="ghost"
                  size="icon"
                  aria-label="Remove from project"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
