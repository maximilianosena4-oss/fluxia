export default function ThumbnailsLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg" style={{ backgroundColor: "var(--bg-card)" }} />
        <div className="h-4 w-64 rounded" style={{ backgroundColor: "var(--bg-secondary)" }} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }} />
        ))}
      </div>
      <div className="h-52 rounded-xl border" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }} />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-20 rounded-xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }} />
      ))}
    </div>
  );
}
