"use client";

import { RoleBadge } from "@/components/organizations/role-badge";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import {
  useCancelInvitation,
  useInviteMember,
  useOrganization,
  useOrgInvitations,
  useOrgMembers,
  useRemoveMember,
} from "@/hooks/use-organizations";
import { useProjects } from "@/hooks/use-projects";
import {
  inviteMemberSchema,
  type InviteMemberFormValues,
} from "@/lib/validations/org.schema";
import { useAuthStore } from "@/store/auth.store";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  FolderKanban,
  Plus,
  Settings,
  UserPlus,
  X,
} from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { useForm } from "react-hook-form";

const ADMIN_ROLES = ["OWNER", "ADMIN", "MANAGER"];

interface OrgPageProps {
  params: Promise<{ slug: string }>;
}

export default function OrgPage({ params }: OrgPageProps) {
  const { slug } = use(params);
  const currentUser = useAuthStore((s) => s.user);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "projects">(
    "projects",
  );

  const { data: org, isLoading: orgLoading } = useOrganization(slug);
  const { data: members, isLoading: membersLoading } = useOrgMembers(
    org?.id ?? "",
  );
  const { data: invitations } = useOrgInvitations(org?.id ?? "");
  const { data: projects, isLoading: projectsLoading } = useProjects(
    org?.id ?? "",
  );

  const removeMember = useRemoveMember(org?.id ?? "");
  const inviteMember = useInviteMember(org?.id ?? "");
  const cancelInvitation = useCancelInvitation(org?.id ?? "");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { role: "DEVELOPER" },
  });

  function onInvite(values: InviteMemberFormValues) {
    inviteMember.mutate(values, {
      onSuccess: () => {
        reset();
        setShowInviteForm(false);
      },
    });
  }

  const canManage = org && ADMIN_ROLES.includes(org.currentUserRole);

  if (orgLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!org) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Header */}
      <Link
        href="/orgs"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All organizations
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={org.name} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {org.name}
              </h1>
              <RoleBadge role={org.currentUserRole} />
            </div>
            {org.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {org.description}
              </p>
            )}
            <p className="mt-0.5 text-xs text-muted-foreground">
              {org.memberCount} {org.memberCount === 1 ? "member" : "members"} ·
              /{org.slug}
            </p>
          </div>
        </div>

        {canManage && (
          <Link href={`/orgs/${slug}/settings`}>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <Tabs
          tabs={[
            { key: "projects", label: "Projects" },
            { key: "overview", label: "Members" },
          ]}
          active={activeTab}
          onChange={(key) => setActiveTab(key as "overview" | "projects")}
        />
      </div>

      {/* Projects tab */}
      {activeTab === "projects" && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {projects?.length ?? 0}{" "}
              {projects?.length === 1 ? "project" : "projects"}
            </p>
            <Link href={`/orgs/${slug}/projects/new`}>
              <Button size="sm">
                <Plus className="h-4 w-4" />
                New project
              </Button>
            </Link>
          </div>

          {projectsLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-lg border border-border bg-muted"
                />
              ))}
            </div>
          ) : projects?.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <FolderKanban className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">No projects yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first project to start tracking work
                </p>
              </div>
              <Link href={`/orgs/${slug}/projects/new`}>
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                  Create project
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {projects?.map((project) => (
                <Link
                  key={project.id}
                  href={`/orgs/${slug}/projects/${project.identifier}`}
                  className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-xs font-semibold text-muted-foreground">
                    {project.identifier}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">
                        {project.name}
                      </p>
                      <ProjectStatusBadge status={project.status} />
                    </div>
                    {project.description && (
                      <p className="mt-0.5 text-sm text-muted-foreground truncate">
                        {project.description}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {project.memberCount}{" "}
                      {project.memberCount === 1 ? "member" : "members"}
                    </p>
                  </div>
                  <span className="text-muted-foreground">→</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Members tab */}
      {activeTab === "overview" && (
        <>
          <section>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {members?.length ?? 0}{" "}
                {members?.length === 1 ? "member" : "members"}
              </p>
              {canManage && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowInviteForm((v) => !v)}
                >
                  <UserPlus className="h-4 w-4" />
                  Invite
                </Button>
              )}
            </div>

            {showInviteForm && (
              <form
                onSubmit={handleSubmit(onInvite)}
                className="mb-4 flex gap-2 rounded-lg border border-border bg-muted/30 p-4"
              >
                <div className="flex-1">
                  <Input
                    placeholder="colleague@example.com"
                    error={errors.email?.message!}
                    {...register("email")}
                  />
                </div>
                <Select className="w-36" {...register("role")}>
                  <option value="DEVELOPER">Developer</option>
                  <option value="REPORTER">Reporter</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                  <option value="GUEST">Guest</option>
                </Select>
                <Button
                  type="submit"
                  size="md"
                  isLoading={inviteMember.isPending}
                >
                  Send
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    setShowInviteForm(false);
                    reset();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>
            )}

            {membersLoading ? (
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
                {members?.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <Avatar
                      name={member.user.name ?? member.user.email}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
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
                    <RoleBadge role={member.role} />
                    {canManage &&
                      member.user.id !== currentUser?.id &&
                      member.role !== "OWNER" && (
                        <button
                          onClick={() => removeMember.mutate(member.user.id)}
                          className="ml-2 text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Remove member"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {invitations && invitations.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-4 text-base font-medium text-foreground">
                Pending Invitations
              </h2>
              <div className="divide-y divide-border rounded-lg border border-border">
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {inv.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Invited by {inv.invitedBy.name ?? inv.invitedBy.email} ·
                        Expires {new Date(inv.expiresAt).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => {
                          const link = `${window.location.origin}/invitations/${inv.id}`;
                          navigator.clipboard
                            .writeText(link)
                            .then(() => {
                              const btn = document.getElementById(
                                `copy-${inv.id}`,
                              );
                              if (btn) {
                                btn.textContent = "Copied!";
                                setTimeout(() => {
                                  if (btn) btn.textContent = "Copy invite link";
                                }, 2000);
                              }
                            })
                            .catch(() => {});
                        }}
                        id={`copy-${inv.id}`}
                        className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                      >
                        Copy invite link
                      </button>
                    </div>
                    <Badge variant="warning">Pending</Badge>
                    <RoleBadge role={inv.role} />
                    {canManage && (
                      <button
                        onClick={() => cancelInvitation.mutate(inv.id)}
                        className="ml-2 text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Cancel invitation"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
