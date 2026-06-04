import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Exo_2, Orbitron, Share_Tech_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/QueryProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const exo2 = Exo_2({
  variable: "--font-exo2",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const shareTechMono = Share_Tech_Mono({
  variable: "--font-share-tech-mono",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: {
    default: "FluxIA — YouTube Strategy Consultant",
    template: "%s | FluxIA",
  },
  description:
    "Tu consultor IA de YouTube. De cero a monetización en 90 días. Evaluación de nichos, plan de acción y generación de contenido con IA.",
  keywords: ["youtube", "monetización", "nicho", "consultoría", "IA", "FluxIA", "canal sin rostro"],
  authors: [{ name: "FluxIA" }],
  creator: "Maximiliano Sena",
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FluxIA",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${exo2.variable} ${orbitron.variable} ${shareTechMono.variable} h-full`}
    >
      <body className="min-h-full antialiased" suppressHydrationWarning>
        <QueryProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
              },
            }}
          />
        </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
