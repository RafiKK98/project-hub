export default function IssueLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 h-4 w-24 animate-pulse rounded bg-muted" />
      <div className="mb-6 h-4 w-16 animate-pulse rounded bg-muted" />
      <div className="mb-6 h-8 w-3/4 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-[1fr_220px] gap-8">
        <div className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
        </div>
        <div className="space-y-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
