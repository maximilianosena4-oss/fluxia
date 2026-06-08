export default function ScorerLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg" style={{ backgroundColor: "var(--bg-card)" }} />
        <div className="h-4 w-80 rounded" style={{ backgroundColor: "var(--bg-secondary)" }} />
      </div>
      <div className="h-56 rounded-xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }} />
    </div>
  );
}
