export default function HistoryLoading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8 animate-pulse">
      <div className="h-8 w-48 bg-zinc-200 rounded mb-6" />
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-24 bg-zinc-200 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border border-zinc-200 bg-white p-4 space-y-2">
            <div className="h-4 w-20 bg-zinc-200 rounded" />
            <div className="h-6 w-24 bg-zinc-200 rounded" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="h-[350px] bg-zinc-100 rounded" />
      </div>
    </div>
  );
}
