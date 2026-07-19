"use client";

import { Button } from "@/components/ui/shadcn/button";
import { Spinner } from "@/components/ui/shadcn/spinner";
import { orgKeys } from "@/hooks/use-organizations";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth.store";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

interface InvitationDetails {
  id: string;
  email: string;
  role: string;
  organizationName: string;
  orgSlug: string;
  expiresAt: string;
  status: string;
}

interface AcceptInvitationPageProps {
  params: Promise<{ id: string }>;
}

export default function AcceptInvitationPage({
  params,
}: AcceptInvitationPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    apiClient
      .get<InvitationDetails>(`/organizations/invitations/${id}`, {
        skipAuth: true,
      })
      .then(setInvitation)
      .catch(() => setError("Invitation not found or has expired"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAccept() {
    setAccepting(true);
    try {
      await apiClient.post(`/organizations/invitations/${id}/accept`);
      queryClient.invalidateQueries({ queryKey: orgKeys.lists() });
      setAccepted(true);
      setTimeout(() => router.push(`/orgs/${invitation?.orgSlug}`), 1500);
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.body.message
          : "Failed to accept invitation";
      setError(message);
    } finally {
      setAccepting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="flex justify-center mb-4">
          <XCircle className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">
          Invitation unavailable
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Button className="mt-6" onClick={() => router.push("/orgs")}>
          Go to organizations
        </Button>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">
          You joined {invitation?.organizationName}!
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Redirecting you now…
        </p>
      </div>
    );
  }

  if (invitation?.status !== "PENDING") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-xl font-semibold text-foreground">
          Invitation already used
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This invitation has already been accepted or cancelled.
        </p>
        <Button className="mt-6" onClick={() => router.push("/orgs")}>
          Go to organizations
        </Button>
      </div>
    );
  }

  const emailMismatch =
    user && user.email.toLowerCase() !== invitation?.email.toLowerCase();

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="flex justify-center mb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <Building2 className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        You&apos;ve been invited
      </h1>
      <p className="mt-2 text-muted-foreground">
        Join{" "}
        <span className="font-medium text-foreground">
          {invitation?.organizationName}
        </span>{" "}
        as{" "}
        <span className="font-medium text-foreground">{invitation?.role}</span>
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Invitation sent to{" "}
        <span className="font-medium">{invitation?.email}</span>
      </p>

      {emailMismatch && (
        <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          You are logged in as <strong>{user?.email}</strong> but this
          invitation was sent to <strong>{invitation?.email}</strong>. Please
          log in with the correct account to accept.
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3">
        <Button
          onClick={handleAccept}
          disabled={accepting || !!emailMismatch}
          size="lg"
          className="w-full"
        >
          Accept invitation
          {accepting && <Spinner data-icon="inline-start" />}
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => router.push("/orgs")}
        >
          Decline
        </Button>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Expires {new Date(invitation?.expiresAt ?? "").toLocaleDateString()}
      </p>
    </div>
  );
}
