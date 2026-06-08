export default function MonetizationLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg" style={{ backgroundColor: "var(--bg-card)" }} />
        <div className="h-4 w-80 rounded" style={{ backgroundColor: "var(--bg-secondary)" }} />
      </div>
      <div className="h-64 rounded-xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-default)" }} />
        ))}
      </div>
    </div>
  );
}
