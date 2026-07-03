export default function OrgsLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-40 animate-pulse rounded bg-muted" />
          <div className="h-4 w-56 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-8 w-36 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-lg border border-border bg-muted"
          />
        ))}
      </div>
    </div>
  );
}
