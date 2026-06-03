export default function ToolsLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg" style={{ backgroundColor: "var(--bg-card)" }} />
        <div className="h-4 w-80 rounded" style={{ backgroundColor: "var(--bg-secondary)" }} />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-4">
          <div className="h-6 w-56 rounded" style={{ backgroundColor: "var(--bg-card)" }} />
          <div className="h-40 rounded-xl border" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }} />
        </div>
      ))}
    </div>
  );
}
