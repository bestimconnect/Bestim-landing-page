import { Skeleton, SkeletonTable } from "@/dashboard/ui";

export default function Loading() {
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <Skeleton className="mb-6 h-10 w-56" />
      <div className="mb-6 flex gap-2">
        <Skeleton className="h-11 w-28 rounded-full" />
        <Skeleton className="h-11 w-28 rounded-full" />
      </div>
      <div className="mb-5 flex items-center gap-3">
        <Skeleton className="h-12 max-w-xl flex-1 rounded-full" />
        <Skeleton className="ms-auto h-12 w-36 rounded-full" />
      </div>
      <SkeletonTable rows={10} />
    </div>
  );
}
