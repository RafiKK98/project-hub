"use client";

import { IssueBoard } from "@/components/issues/issue-board";
import { IssueListGrouped } from "@/components/issues/issue-list-grouped";
import { ViewToggle, type IssueView } from "@/components/issues/view-toggle";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useIssues, useReorderIssue } from "@/hooks/use-issues";
import { useOrganization } from "@/hooks/use-organizations";
import {
  useProjectByIdentifier,
  useProjectMembers,
} from "@/hooks/use-projects";
import type { IssueStatus } from "@projecthub/types";
import { ArrowLeft, ListTodo, Plus, Settings, Users } from "lucide-react";
import Link from "next/link";
import { use, useCallback, useState } from "react";

interface ProjectPageProps {
  params: Promise<{ slug: string; identifier: string }>;
}

const MANAGER_ROLES = ["MANAGER"];

export default function ProjectPage({ params }: ProjectPageProps) {
  const { slug, identifier } = use(params);
  const [view, setView] = useState<IssueView>("board");

  const { data: org } = useOrganization(slug);
  const { data: project, isLoading } = useProjectByIdentifier(
    org?.id ?? "",
    identifier,
  );
  const { data: members } = useProjectMembers(org?.id ?? "", project?.id ?? "");
  const { data: issues, isLoading: issuesLoading } = useIssues(
    org?.id ?? "",
    project?.id ?? "",
  );
  const reorderIssue = useReorderIssue(org?.id ?? "", project?.id ?? "");

  const canManage =
    project && MANAGER_ROLES.includes(project.currentUserRole ?? "");

  const handleReorder = useCallback(
    (issueNumber: number, newBoardOrder: number, newStatus: IssueStatus) => {
      reorderIssue.mutate({
        number: issueNumber,
        payload: { boardOrder: newBoardOrder, status: newStatus },
      });
    },
    [reorderIssue],
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-muted-foreground">Project not found.</p>
        <Link
          href={`/orgs/${slug}`}
          className="mt-4 inline-block text-sm text-foreground underline"
        >
          Back to organization
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link
        href={`/orgs/${slug}`}
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {org?.name ?? "Organization"}
      </Link>

      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted font-mono text-sm font-semibold text-muted-foreground">
            {project.identifier}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {project.name}
              </h1>
              <ProjectStatusBadge status={project.status} />
            </div>
            {project.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {project.description}
              </p>
            )}
            <p className="mt-0.5 text-xs text-muted-foreground">
              {project.memberCount}{" "}
              {project.memberCount === 1 ? "member" : "members"}
            </p>
          </div>
        </div>

        {canManage && (
          <Link href={`/orgs/${slug}/projects/${identifier}/settings`}>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
        )}
      </div>

      {/* Issues */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {issues?.length ?? 0} {issues?.length === 1 ? "issue" : "issues"}
            </p>
            <ViewToggle view={view} onChange={setView} />
          </div>
          <Link href={`/orgs/${slug}/projects/${identifier}/issues/new`}>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New issue
            </Button>
          </Link>
        </div>

        {issuesLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded-lg border border-border bg-muted"
              />
            ))}
          </div>
        ) : issues?.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <ListTodo className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">No issues yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first issue to start tracking work
              </p>
            </div>
            <Link href={`/orgs/${slug}/projects/${identifier}/issues/new`}>
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Create issue
              </Button>
            </Link>
          </div>
        ) : view === "board" ? (
          <IssueBoard
            issues={issues ?? []}
            orgSlug={slug}
            projectIdentifier={identifier}
            onReorder={handleReorder}
          />
        ) : (
          <IssueListGrouped
            issues={issues ?? []}
            orgSlug={slug}
            projectIdentifier={identifier}
          />
        )}
      </section>

      {/* Members */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-medium text-foreground">
            Project Members
          </h2>
        </div>
        <div className="divide-y divide-border rounded-lg border border-border">
          {members?.map((member) => (
            <div key={member.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar name={member.user.name ?? member.user.email} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {member.user.name ?? member.user.email}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {member.user.email}
                </p>
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
