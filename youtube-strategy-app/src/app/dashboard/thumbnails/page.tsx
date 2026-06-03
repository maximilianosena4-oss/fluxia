import type { Metadata } from "next";
import { ThumbnailLibrary } from "@/components/thumbnails/ThumbnailLibrary";

export const metadata: Metadata = { title: "Thumbnails" };

interface Props {
  searchParams: Promise<{ title?: string; prompt?: string }>;
}

export default async function ThumbnailsPage({ searchParams }: Props) {
  const params = await searchParams;
  const initialTitle  = params.title  ? decodeURIComponent(params.title)  : "";
  const initialPrompt = params.prompt ? decodeURIComponent(params.prompt) : "";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Thumbnail Library
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          El thumbnail es el 80% del éxito del video (MrBeast). Generá y gestioná tus conceptos.
        </p>
      </div>
      <ThumbnailLibrary initialTitle={initialTitle} initialPrompt={initialPrompt} />
    </div>
  );
}
