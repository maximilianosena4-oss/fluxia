import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: {
    default: "NEXUS — YouTube Strategy Consultant",
    template: "%s | NEXUS",
  },
  description:
    "Tu consultor IA de YouTube. De cero a monetización en 90 días. Evaluación de nichos, plan de acción y generación de contenido con IA.",
  keywords: ["youtube", "monetización", "nicho", "consultoría", "IA", "NEXUS", "canal sin rostro"],
  authors: [{ name: "NEXUS" }],
  creator: "Maximiliano Sena",
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NEXUS",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
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
