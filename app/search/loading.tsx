import { PageShell, Skeleton } from "@/components/ui";

export default function SearchLoading() {
  return (
    <PageShell>
      <div className="mb-6 max-w-3xl">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-3 h-9 w-80 max-w-full" />
        <Skeleton className="mt-3 h-5 w-full max-w-2xl" />
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-11 flex-1" />
        <Skeleton className="h-11 w-full sm:w-28" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-slate/15 bg-surface p-5 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </div>
              <Skeleton className="h-7 w-10 shrink-0" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Skeleton className="h-9" />
              <Skeleton className="h-9" />
              <Skeleton className="h-9" />
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
