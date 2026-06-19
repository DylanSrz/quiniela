export default function AdminLoading() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-8 w-40" />
      <div className="skeleton h-24 w-full" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
