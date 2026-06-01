export default function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
      {/* Hero skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 rounded-lg" style={{ backgroundColor: "var(--bg-card)" }} />
        <div className="h-4 w-80 rounded" style={{ backgroundColor: "var(--bg-secondary)" }} />
      </div>

      {/* Progress skeleton */}
      <div className="rounded-xl p-5 border" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
        <div className="h-3 w-full rounded-full" style={{ backgroundColor: "var(--bg-card)" }} />
      </div>

      {/* Metrics skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl p-6 border h-28"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }}
          />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-lg"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            />
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-40 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)" }} />
          <div className="h-28 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)" }} />
        </div>
      </div>
    </div>
  );
}
