// Loading global — se muestra mientras carga cualquier ruta
export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black text-white animate-pulse"
          style={{
            background:
              "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
          }}
        >
          N
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-bounce"
              style={{
                backgroundColor: "var(--accent-primary)",
                animationDelay: `${i * 150}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
