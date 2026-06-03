export default function SettingsLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg" style={{ backgroundColor: "var(--bg-card)" }} />
        <div className="h-4 w-64 rounded" style={{ backgroundColor: "var(--bg-secondary)" }} />
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border p-6 space-y-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }}>
          <div className="h-5 w-32 rounded" style={{ backgroundColor: "var(--bg-secondary)" }} />
          <div className="h-16 rounded-lg" style={{ backgroundColor: "var(--bg-secondary)" }} />
        </div>
      ))}
    </div>
  );
}
