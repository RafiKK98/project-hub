"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useOrganization } from "@/hooks/use-organizations";
import {
  useDeleteProject,
  useProjectByIdentifier,
  useUpdateProject,
} from "@/hooks/use-projects";
import {
  updateProjectSchema,
  type UpdateProjectFormValues,
} from "@/lib/validations/project.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateProjectPayload } from "@projecthub/types";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface ProjectSettingsPageProps {
  params: Promise<{ slug: string; identifier: string }>;
}

export default function ProjectSettingsPage({
  params,
}: ProjectSettingsPageProps) {
  const { slug, identifier } = use(params);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: org } = useOrganization(slug);
  const { data: project } = useProjectByIdentifier(org?.id ?? "", identifier);
  const updateProject = useUpdateProject(org?.id ?? "", project?.id ?? "");
  const deleteProject = useDeleteProject(org?.id ?? "", slug);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProjectFormValues>({
    resolver: zodResolver(updateProjectSchema),
  });

  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        description: project.description ?? "",
        status: project.status,
      });
    }
  }, [project, reset]);

  function onSubmit(values: UpdateProjectFormValues) {
    updateProject.mutate(values as UpdateProjectPayload);
  }

  if (!project) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link
        href={`/orgs/${slug}/projects/${identifier}`}
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {project.name}
      </Link>

      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-foreground">
        Project Settings
      </h1>

      <section className="mb-10">
        <h2 className="mb-4 text-base font-medium text-foreground">General</h2>
        <div className="rounded-lg border border-border bg-card p-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name" required>
                Project name
              </Label>
              <Input
                id="name"
                error={errors.name?.message!}
                {...register("name")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                error={errors.description?.message!}
                {...register("description")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status">Status</Label>
              <Select id="status" {...register("status")}>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="ARCHIVED">Archived</option>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                isLoading={updateProject.isPending}
                disabled={!isDirty}
              >
                Save changes
              </Button>
            </div>
          </form>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-base font-medium text-destructive">
          Danger Zone
        </h2>
        <div className="rounded-lg border border-destructive/40 bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">
                Delete this project
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Permanently delete {project.name} and all of its issues. This
                action cannot be undone.
              </p>
            </div>
            {confirmDelete ? (
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Are you sure?
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  isLoading={deleteProject.isPending}
                  onClick={() => deleteProject.mutate(project.id)}
                >
                  Yes, delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="destructive"
                size="sm"
                className="shrink-0"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete project
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
