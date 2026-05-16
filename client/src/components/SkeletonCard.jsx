export default function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[28px] glass">
      <div className="aspect-[4/3] animate-pulse bg-white/50 dark:bg-white/10" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded-full bg-white/60 dark:bg-white/10" />
        <div className="h-4 w-full animate-pulse rounded-full bg-white/60 dark:bg-white/10" />
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/60 dark:bg-white/10" />
      </div>
    </div>
  );
}
