// Shown for a split second while the form reads the page URL.
export function AuthFormSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading form">
      <div className="mx-auto h-7 w-40 animate-pulse rounded bg-muted" />
      <div className="space-y-4">
        <div className="h-10 animate-pulse rounded-lg bg-muted" />
        <div className="h-10 animate-pulse rounded-lg bg-muted" />
        <div className="h-10 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}
