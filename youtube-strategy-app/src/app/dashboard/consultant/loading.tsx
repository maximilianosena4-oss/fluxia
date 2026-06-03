export default function ConsultantLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg" style={{ backgroundColor: "var(--bg-card)" }} />
        <div className="h-4 w-72 rounded" style={{ backgroundColor: "var(--bg-secondary)" }} />
      </div>
      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }}>
        <div className="h-[500px] p-6 space-y-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: "var(--bg-secondary)" }} />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-3/4 rounded" style={{ backgroundColor: "var(--bg-secondary)" }} />
              <div className="h-4 w-1/2 rounded" style={{ backgroundColor: "var(--bg-secondary)" }} />
            </div>
          </div>
        </div>
        <div className="border-t p-4" style={{ borderColor: "var(--border-default)" }}>
          <div className="h-10 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)" }} />
        </div>
      </div>
    </div>
  );
}
