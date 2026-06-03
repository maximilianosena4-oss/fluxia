export default function CalendarLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg" style={{ backgroundColor: "var(--bg-card)" }} />
        <div className="h-4 w-64 rounded" style={{ backgroundColor: "var(--bg-secondary)" }} />
      </div>
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-9 w-24 rounded-lg" style={{ backgroundColor: "var(--bg-card)" }} />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="h-20 rounded-lg border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }} />
        ))}
      </div>
    </div>
  );
}
