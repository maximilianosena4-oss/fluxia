export default function AnalyzerLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-80 rounded-lg" style={{ backgroundColor: "var(--bg-card)" }} />
        <div className="h-4 w-96 rounded" style={{ backgroundColor: "var(--bg-secondary)" }} />
      </div>
      <div className="h-32 rounded-xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }} />
      <div className="h-52 rounded-xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }} />
    </div>
  );
}
