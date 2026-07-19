"use client";

import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { Button } from "@/components/ui/shadcn/button";
import { Spinner } from "@/components/ui/shadcn/spinner";
import { Textarea } from "@/components/ui/shadcn/textarea";
import {
  useDeleteOrganization,
  useOrganization,
  useUpdateOrganization,
} from "@/hooks/use-organizations";
import {
  updateOrgSchema,
  type UpdateOrgFormValues,
} from "@/lib/validations/org.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateOrganizationPayload } from "@projecthub/types";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface OrgSettingsPageProps {
  params: Promise<{ slug: string }>;
}

export default function OrgSettingsPage({ params }: OrgSettingsPageProps) {
  const { slug } = use(params);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: org } = useOrganization(slug);
  const updateOrg = useUpdateOrganization(org?.id ?? "", slug);
  const deleteOrg = useDeleteOrganization();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateOrgFormValues>({
    resolver: zodResolver(updateOrgSchema),
  });

  useEffect(() => {
    if (org) {
      reset({ name: org.name, description: org.description ?? "" });
    }
  }, [org, reset]);

  function onSubmit(values: UpdateOrgFormValues) {
    updateOrg.mutate(values as UpdateOrganizationPayload);
  }

  if (!org) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link
        href={`/orgs/${slug}`}
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {org.name}
      </Link>

      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-foreground">
        Organization Settings
      </h1>

      {/* General settings */}
      <section className="mb-10">
        <h2 className="mb-4 text-base font-medium text-foreground">General</h2>
        <div className="rounded-lg border border-border bg-card p-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">
                Organization name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              {errors.name?.message && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                aria-invalid={!!errors.description}
                {...register("description")}
              />
              {errors.description?.message && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={updateOrg.isPending || !isDirty}>
                Save changes
                {updateOrg.isPending && <Spinner data-icon="inline-start" />}
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Danger zone */}
      {org.currentUserRole === "OWNER" && (
        <section>
          <h2 className="mb-4 text-base font-medium text-destructive">
            Danger Zone
          </h2>
          <div className="rounded-lg border border-destructive/40 bg-card p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Delete this organization
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Permanently delete {org.name} and all of its projects, issues,
                  and data. This action cannot be undone.
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
                    disabled={deleteOrg.isPending}
                    onClick={() => deleteOrg.mutate(org.id)}
                  >
                    Yes, delete
                    {deleteOrg.isPending && (
                      <Spinner data-icon="inline-start" />
                    )}
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
                  Delete organization
                </Button>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
