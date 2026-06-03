export default function IdeasLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-56 rounded-lg" style={{ backgroundColor: "var(--bg-card)" }} />
        <div className="h-4 w-80 rounded" style={{ backgroundColor: "var(--bg-secondary)" }} />
      </div>
      <div className="h-28 rounded-xl border" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }} />
        ))}
      </div>
    </div>
  );
}
