import { PageShell, Skeleton } from "@/components/ui";

export default function AdminLoading() {
  return (
    <PageShell>
      <div className="mb-6 max-w-3xl">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-8 w-96 max-w-full" />
        <Skeleton className="mt-3 h-5 w-full max-w-xl" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    </PageShell>
  );
}
