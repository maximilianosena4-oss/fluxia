"use client";
import { PageError } from "@/components/shared/PageError";
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError error={error} reset={reset} title="Error en el Consultor IA" />;
}
