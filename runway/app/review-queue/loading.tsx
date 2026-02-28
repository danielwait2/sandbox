export default function ReviewQueueLoading() {
  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <div className="h-8 w-40 bg-zinc-200 rounded animate-pulse" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 bg-white p-5 animate-pulse h-32" />
        ))}
      </div>
    </main>
  );
}
