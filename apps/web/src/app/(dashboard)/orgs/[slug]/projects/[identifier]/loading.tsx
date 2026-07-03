import {
  IssueListSkeleton,
  ProjectHeaderSkeleton,
} from "@/components/ui/skeletons";

export default function ProjectLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 h-4 w-32 animate-pulse rounded bg-muted" />
      <ProjectHeaderSkeleton />
      <IssueListSkeleton />
    </div>
  );
}
