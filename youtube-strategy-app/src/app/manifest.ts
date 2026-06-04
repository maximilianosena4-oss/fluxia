import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FluxIA — YouTube Strategy Consultant",
    short_name: "FluxIA",
    description: "Tu consultor IA de YouTube. De cero a monetización, paso a paso.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0f0f0f",
    theme_color: "#6366f1",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["productivity", "business", "education"],
  };
}
