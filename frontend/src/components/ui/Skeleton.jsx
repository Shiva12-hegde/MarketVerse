export function Skeleton({ className = 'h-4 w-full' }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}

export default Skeleton;

export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <Skeleton className="mb-4 aspect-square w-full rounded-lg" />
      <Skeleton className="mb-2 h-4 w-3/4" />
      <Skeleton className="mb-2 h-4 w-1/2" />
      <Skeleton className="h-6 w-1/3" />
    </div>
  );
}
