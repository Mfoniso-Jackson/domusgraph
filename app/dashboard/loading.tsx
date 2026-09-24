import { PageShell, Skeleton } from "@/components/ui";

export default function DashboardLoading() {
  return (
    <PageShell>
      <div className="mb-6 max-w-3xl">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-8 w-72 max-w-full" />
        <Skeleton className="mt-3 h-5 w-48" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>

      <div className="mt-8">
        <Skeleton className="h-40" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </PageShell>
  );
}
