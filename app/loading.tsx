export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <div className="skeleton mb-6 h-40 w-full rounded-3xl" />
      <div className="mb-4 flex items-center justify-between">
        <div className="skeleton h-6 w-48" />
        <div className="skeleton h-8 w-36" />
      </div>
      <div className="mb-6 grid grid-cols-3 items-end gap-2">
        <div className="skeleton h-32" />
        <div className="skeleton h-40" />
        <div className="skeleton h-28" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-12 w-full" />
        ))}
      </div>
    </main>
  );
}
