export default function DashboardLoading() {
  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="h-8 w-32 bg-zinc-200 rounded animate-pulse" />
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-9 w-28 bg-zinc-200 rounded-md animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 bg-white p-5 animate-pulse">
            <div className="h-4 w-1/2 bg-zinc-200 rounded mb-2" />
            <div className="h-7 w-2/3 bg-zinc-200 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 bg-white p-5 animate-pulse">
            <div className="h-4 w-1/2 bg-zinc-200 rounded mb-2" />
            <div className="h-7 w-1/3 bg-zinc-200 rounded mb-4" />
            <div className="h-2 w-full bg-zinc-100 rounded" />
          </div>
        ))}
      </div>
    </main>
  );
}
