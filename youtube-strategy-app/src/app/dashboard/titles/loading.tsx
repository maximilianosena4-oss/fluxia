export default function TitlesLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-64 rounded-lg" style={{ backgroundColor: "var(--bg-card)" }} />
        <div className="h-4 w-96 rounded" style={{ backgroundColor: "var(--bg-secondary)" }} />
      </div>
      <div className="h-48 rounded-xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }} />
      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }} />
        ))}
      </div>
    </div>
  );
}
