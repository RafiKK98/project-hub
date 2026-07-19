"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/shadcn/button";
import { Spinner } from "@/components/ui/shadcn/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useCreateOrganization } from "@/hooks/use-organizations";
import {
  createOrgSchema,
  type CreateOrgFormValues,
} from "@/lib/validations/org.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateOrganizationPayload } from "@projecthub/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";

export default function NewOrgPage() {
  const createOrg = useCreateOrganization();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOrgFormValues>({
    resolver: zodResolver(createOrgSchema),
  });

  function onSubmit(values: CreateOrgFormValues) {
    createOrg.mutate(values as CreateOrganizationPayload);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Link
        href="/orgs"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to organizations
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Create an organization
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Organizations are shared workspaces for your team&apos;s projects.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" required>
            Organization name
          </Label>
          <Input
            id="name"
            placeholder="Acme Corp"
            autoFocus
            error={errors.name?.message}
            {...register("name")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="What does your organization do?"
            error={errors.description?.message}
            {...register("description")}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link href="/orgs">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={createOrg.isPending}>
            Create organization
            {createOrg.isPending && <Spinner data-icon="inline-start" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
