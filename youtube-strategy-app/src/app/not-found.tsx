import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="text-center space-y-6 max-w-sm">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white mx-auto"
          style={{
            background:
              "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
          }}
        >
          N
        </div>
        <div className="space-y-2">
          <h1
            className="text-5xl font-black"
            style={{ color: "var(--accent-primary)" }}
          >
            404
          </h1>
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Esta página no existe
          </p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Pero tu canal de YouTube sí va a existir. Volvé al dashboard.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard">Ir al Dashboard →</Link>
        </Button>
      </div>
    </div>
  );
}
