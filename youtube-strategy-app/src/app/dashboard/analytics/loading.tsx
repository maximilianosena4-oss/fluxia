export default function AnalyticsLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg" style={{ backgroundColor: "var(--bg-card)" }} />
        <div className="h-4 w-72 rounded" style={{ backgroundColor: "var(--bg-secondary)" }} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }} />
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        {[0, 1].map((i) => (
          <div key={i} className="h-56 rounded-xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }} />
        ))}
      </div>
      <div className="h-48 rounded-xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }} />
    </div>
  );
}
