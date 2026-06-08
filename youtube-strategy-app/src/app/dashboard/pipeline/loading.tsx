export default function PipelineLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-56 rounded-lg" style={{ backgroundColor: "var(--bg-card)" }} />
        <div className="h-4 w-80 rounded" style={{ backgroundColor: "var(--bg-secondary)" }} />
      </div>
      <div className="h-12 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)" }} />
      <div className="h-72 rounded-xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }} />
    </div>
  );
}
