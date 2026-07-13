"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useOrganization } from "@/hooks/use-organizations";
import { useCreateProject } from "@/hooks/use-projects";
import {
  CreateProjectFormValues,
  createProjectSchema,
} from "@/lib/validations/project.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateProjectPayload } from "@projecthub/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { useForm, useWatch } from "react-hook-form";

interface NewProjectPageProps {
  params: Promise<{ slug: string }>;
}
export default function NewProjectPage({ params }: NewProjectPageProps) {
  const { slug } = use(params);
  const { data: org } = useOrganization(slug);
  const createProject = useCreateProject(org?.id ?? "", slug);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
  });

  const nameValue = useWatch({ control, name: 'name' });
  const identifierValue = useWatch({ control, name: 'identifier' }) || "WEB";

  function onSubmit(values: CreateProjectFormValues) {
    createProject.mutate(values as CreateProjectPayload);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Link
        href={`/orgs/${slug}`}
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {org?.name ?? "organization"}
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Create a project
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Projects organize issues, track progress, and group your team&apos;s
          work.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" required>
            Project name
          </Label>
          <Input
            id="name"
            placeholder="Website Redesign"
            autoFocus
            error={errors.name?.message}
            {...register("name")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="identifier" required>
            Project identifier
          </Label>
          <Input
            id="identifier"
            placeholder="WEB"
            className="font-mono uppercase"
            maxLength={6}
            error={errors.identifier?.message}
            {...register("identifier")}
          />
          <p className="text-xs text-muted-foreground">
            Used to prefix issues, e.g.{" "}
            {identifierValue.toUpperCase()}-1
            {nameValue ? "" : ""}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="What is this project about?"
            error={errors.description?.message}
            {...register("description")}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link href={`/orgs/${slug}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" isLoading={createProject.isPending}>
            Create project
          </Button>
        </div>
      </form>
    </div>
  );
}
