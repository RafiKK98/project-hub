"use client";

import { RoleBadge } from "@/components/organizations/role-badge";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  useCancelInvitation,
  useInviteMember,
  useOrganization,
  useOrgInvitations,
  useOrgMembers,
  useRemoveMember,
} from "@/hooks/use-organizations";
import {
  inviteMemberSchema,
  type InviteMemberFormValues,
} from "@/lib/validations/org.schema";
import { useAuthStore } from "@/store/auth.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Settings, UserPlus, X } from "lucide-react";
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

  const { data: org, isLoading: orgLoading } = useOrganization(slug);
  const { data: members, isLoading: membersLoading } = useOrgMembers(
    org?.id ?? "",
  );
  const { data: invitations } = useOrgInvitations(org?.id ?? "");

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

      <div className="mb-8 flex items-start justify-between">
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

      {/* Members */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-medium text-foreground">Members</h2>
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

        {/* Invite form */}
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
            <Button type="submit" size="md" isLoading={inviteMember.isPending}>
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

        {/* Member list */}
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

      {/* Pending invitations */}
      {invitations && invitations.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-base font-medium text-foreground">
            Pending Invitations
          </h2>
          <div className="divide-y divide-border rounded-lg border border-border">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {inv.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Invited by {inv.invitedBy.name ?? inv.invitedBy.email} ·
                    Expires {new Date(inv.expiresAt).toLocaleDateString()}
                  </p>
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
    </div>
  );
}
