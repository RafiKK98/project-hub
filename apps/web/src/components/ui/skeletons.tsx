export function ProjectHeaderSkeleton() {
  return (
    <div className="mb-8 flex items-start justify-between">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 animate-pulse rounded-lg bg-muted" />
        <div className="flex flex-col gap-2">
          <div className="h-6 w-48 animate-pulse rounded bg-muted" />
          <div className="h-3 w-64 animate-pulse rounded bg-muted" />
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
    </div>
  );
}

export function IssueListSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-2.5">
          <div className="h-4 w-4 animate-pulse rounded-full bg-muted" />
          <div className="h-3 w-14 animate-pulse rounded bg-muted" />
          <div className="h-4 w-4 animate-pulse rounded-full bg-muted" />
          <div className="h-3 flex-1 animate-pulse rounded bg-muted" />
          <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-10 space-y-2">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <div className="h-4 w-4 animate-pulse rounded-full bg-muted" />
              <div className="h-3 w-14 animate-pulse rounded bg-muted" />
              <div className="h-3 flex-1 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-lg border border-border bg-muted"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
