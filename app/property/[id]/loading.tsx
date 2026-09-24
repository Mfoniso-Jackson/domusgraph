import { PageShell, Skeleton } from "@/components/ui";

export default function PropertyLoading() {
  return (
    <PageShell>
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div className="flex-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-2 h-9 w-72 max-w-full" />
          <Skeleton className="mt-2 h-5 w-48" />
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>

      <div className="mt-8">
        <Skeleton className="h-32" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    </PageShell>
  );
}
