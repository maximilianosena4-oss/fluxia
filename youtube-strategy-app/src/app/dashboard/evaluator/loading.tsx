export default function EvaluatorLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-56 rounded-lg" style={{ backgroundColor: "var(--bg-card)" }} />
        <div className="h-4 w-80 rounded" style={{ backgroundColor: "var(--bg-secondary)" }} />
      </div>
      {/* Stepper */}
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 h-2 rounded-full" style={{ backgroundColor: i === 0 ? "var(--accent-primary)" : "var(--bg-card)" }} />
        ))}
      </div>
      <div className="rounded-2xl border p-8 space-y-6" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }}>
        <div className="h-6 w-48 rounded" style={{ backgroundColor: "var(--bg-secondary)" }} />
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)" }} />
          ))}
        </div>
        <div className="h-10 w-32 rounded-lg" style={{ backgroundColor: "var(--bg-secondary)" }} />
      </div>
    </div>
  );
}
