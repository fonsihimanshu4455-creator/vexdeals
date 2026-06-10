export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-ink-900/5 shadow-soft overflow-hidden">
      <div className="skeleton aspect-square m-2 rounded-3xl" />
      <div className="px-4 pb-4 pt-1 space-y-2">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
        <div className="skeleton h-5 w-1/2 rounded" />
      </div>
    </div>
  );
}

export default function ProductGridSkeleton({ count = 8, className = 'grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6' }) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}
