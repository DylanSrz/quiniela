export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-40 rounded-lg bg-white/5" />
      <div className="h-24 w-full rounded-xl bg-white/5" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 w-full rounded-lg bg-white/5" />
        ))}
      </div>
    </div>
  );
}
