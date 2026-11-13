import { Skeleton, SkeletonTable } from "@/dashboard/ui";

// Shown inside the shell while any dashboard page loads: title, a row of tiles, a table. Pages with another shape add their own.
export default function Loading() {
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <Skeleton className="mb-6 h-10 w-64" />
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28 rounded-3xl" />)}
      </div>
      <SkeletonTable />
    </div>
  );
}
