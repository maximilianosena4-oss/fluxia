export default function RoadmapLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg" style={{ backgroundColor: "var(--bg-card)" }} />
        <div className="h-4 w-72 rounded" style={{ backgroundColor: "var(--bg-secondary)" }} />
      </div>
      <div className="h-10 rounded-xl border" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }} />
      <div className="space-y-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-6 w-40 rounded" style={{ backgroundColor: "var(--bg-card)" }} />
            {[0, 1, 2].map((j) => (
              <div key={j} className="h-14 rounded-xl border ml-6" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
