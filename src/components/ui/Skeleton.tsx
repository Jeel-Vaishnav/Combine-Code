import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-zinc-800/60", className)}
      {...props}
    />
  );
}

export function KanbanColumnSkeleton() {
  return (
    <div className="w-80 shrink-0 bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-3 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-5 w-6 rounded-full" />
      </div>
      <div className="flex flex-col gap-2.5">
        <Skeleton className="h-28 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </div>
  );
}
