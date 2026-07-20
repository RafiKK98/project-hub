"use client";

import {
  PRIORITY_OPTIONS,
  getPriorityLabel,
} from "@/components/issues/priority-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useCreateIssue } from "@/hooks/use-issues";
import { useOrganization } from "@/hooks/use-organizations";
import {
  useProjectByIdentifier,
  useProjectMembers,
} from "@/hooks/use-projects";
import {
  createIssueSchema,
  type CreateIssueFormValues,
} from "@/lib/validations/issue.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateIssuePayload } from "@projecthub/types";
import { DatePicker } from "@/components/ui/date-picker";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { Controller, useForm } from "react-hook-form";

interface NewIssuePageProps {
  params: Promise<{ slug: string; identifier: string }>;
}

export default function NewIssuePage({ params }: NewIssuePageProps) {
  const { slug, identifier } = use(params);
  const { data: org } = useOrganization(slug);
  const { data: project } = useProjectByIdentifier(org?.id ?? "", identifier);
  const { data: members } = useProjectMembers(org?.id ?? "", project?.id ?? "");
  const createIssue = useCreateIssue(
    org?.id ?? "",
    project?.id ?? "",
    slug,
    identifier,
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateIssueFormValues>({
    resolver: zodResolver(createIssueSchema),
    defaultValues: { priority: "NO_PRIORITY" },
  });

  function onSubmit(values: CreateIssueFormValues) {
    createIssue.mutate({
      ...values,
      assigneeId: values.assigneeId || undefined,
      dueDate: values.dueDate || undefined,
    } as CreateIssuePayload);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Link
        href={`/orgs/${slug}/projects/${identifier}`}
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {project?.name ?? "project"}
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          New issue
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          In {project?.name} ({project?.identifier})
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            placeholder="Fix login button alignment on mobile"
            autoFocus
            aria-invalid={!!errors.title}
            {...register("title")}
          />
          {errors.title?.message && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Add more details..."
            rows={4}
            aria-invalid={!!errors.description}
            {...register("description")}
          />
          {errors.description?.message && (
            <p className="text-xs text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="priority">Priority</Label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select value={field.value!} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {getPriorityLabel(p)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="assigneeId">Assignee</Label>
            <Controller
              name="assigneeId"
              control={control}
              render={({ field }) => (
                <Select value={field.value!} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {members?.map((m) => (
                      <SelectItem key={m.user.id} value={m.user.id}>
                        {m.user.name ?? m.user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dueDate">Due date</Label>
          <Controller
            name="dueDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                id="dueDate"
                value={field.value ? new Date(field.value) : null}
                onChange={(date) =>
                  field.onChange(date ? date.toLocaleDateString("en-CA") : "")
                }
              />
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link href={`/orgs/${slug}/projects/${identifier}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={createIssue.isPending}>
            Create issue
            {createIssue.isPending && <Spinner data-icon="inline-start" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
