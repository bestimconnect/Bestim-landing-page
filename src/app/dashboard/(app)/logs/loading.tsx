import { Skeleton, SkeletonTable } from "@/dashboard/ui";

export default function Loading() {
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <Skeleton className="mb-6 h-10 w-40" />
      <Skeleton className="mb-6 h-11 w-64 rounded-full" />
      <SkeletonTable rows={10} />
    </div>
  );
}
