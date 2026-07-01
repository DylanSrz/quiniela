export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <div className="animate-pulse space-y-5">
        <div className="h-8 w-56 rounded-lg bg-white/5" />
        <div className="grid grid-cols-3 gap-2">
          <div className="h-28 rounded-xl bg-white/5" />
          <div className="h-28 rounded-xl bg-white/5" />
          <div className="h-28 rounded-xl bg-white/5" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 w-full rounded-lg bg-white/5" />
          ))}
        </div>
      </div>
    </main>
  );
}
