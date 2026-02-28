export default function InsightsLoading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8 animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 w-32 bg-zinc-200 rounded" />
        <div className="h-8 w-40 bg-zinc-200 rounded" />
      </div>
      <div className="space-y-8">
        <div>
          <div className="h-6 w-40 bg-zinc-200 rounded mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-zinc-200 bg-white p-4 space-y-2">
                <div className="h-4 w-24 bg-zinc-200 rounded" />
                <div className="h-6 w-20 bg-zinc-200 rounded" />
                <div className="h-4 w-32 bg-zinc-200 rounded" />
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="h-6 w-48 bg-zinc-200 rounded mb-4" />
          <div className="rounded-lg border border-zinc-200 bg-white p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 w-full bg-zinc-200 rounded" />
            ))}
          </div>
        </div>
        <div>
          <div className="h-6 w-52 bg-zinc-200 rounded mb-4" />
          <div className="rounded-lg border border-zinc-200 bg-white p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 w-full bg-zinc-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
