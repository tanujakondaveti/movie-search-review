function MovieCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-slate-900/60 border border-slate-800/60 animate-pulse">
      <div className="aspect-[2/3] bg-slate-800/80" />
      <div className="p-3.5 space-y-2.5">
        <div className="h-4 bg-slate-800/80 rounded-lg w-4/5" />
        <div className="h-3 bg-slate-800/80 rounded-lg w-2/5" />
      </div>
    </div>
  );
}

function MovieGridSkeleton({ count = 10 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
      {Array.from({ length: count }, (_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-5 bg-slate-800 rounded w-16 mb-8" />
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="w-full sm:w-72 lg:w-80 shrink-0 mx-auto lg:mx-0">
          <div className="aspect-[2/3] bg-slate-800 rounded-2xl" />
        </div>
        <div className="flex-1 space-y-5">
          <div className="h-10 bg-slate-800 rounded-lg w-3/4" />
          <div className="flex gap-3">
            <div className="h-6 bg-slate-800 rounded w-16" />
            <div className="h-6 bg-slate-800 rounded w-12" />
            <div className="h-6 bg-slate-800 rounded w-20" />
          </div>
          <div className="space-y-3 pt-4">
            <div className="h-4 bg-slate-800 rounded w-full" />
            <div className="h-4 bg-slate-800 rounded w-full" />
            <div className="h-4 bg-slate-800 rounded w-3/4" />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="h-16 bg-slate-800 rounded-lg" />
            <div className="h-16 bg-slate-800 rounded-lg" />
            <div className="h-16 bg-slate-800 rounded-lg" />
            <div className="h-16 bg-slate-800 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export { MovieCardSkeleton, MovieGridSkeleton, DetailsSkeleton };
