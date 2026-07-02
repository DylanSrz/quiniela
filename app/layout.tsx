import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Oswald } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const title = "Quiniela Hunters · Mundial 2026";
const description =
  "Quiniela privada de la fase de grupos del Mundial 2026 entre los Hunters.";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    title,
    description,
    siteName: "Quiniela Hunters",
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a1410",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-bg/80 backdrop-blur">
          <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <span className="font-display text-lg font-bold uppercase tracking-wide">
                Quiniela <span className="text-gold">Hunters</span>
              </span>
            </Link>
            <div className="flex items-center gap-1 text-sm">
              <Link
                href="/"
                className="rounded-md px-3 py-1.5 text-muted transition hover:bg-white/5 hover:text-white"
              >
                Posiciones
              </Link>
              <Link
                href="/partidos"
                className="rounded-md px-3 py-1.5 text-muted transition hover:bg-white/5 hover:text-white"
              >
                Partidos
              </Link>
              <Link
                href="/comparar"
                className="rounded-md px-3 py-1.5 text-muted transition hover:bg-white/5 hover:text-white"
              >
                Comparar
              </Link>
              <Link
                href="/admin"
                title="Panel de administrador"
                aria-label="Panel de administrador"
                className="ml-1 rounded-md px-2 py-1.5 text-muted transition hover:bg-white/5 hover:text-white"
              >
                ⚙️
              </Link>
            </div>
          </nav>
        </header>

        {children}

        <footer className="mt-auto border-t border-white/10 px-4 py-6 text-center text-xs text-muted">
          Quiniela Hunters · Mundial FIFA 2026 · fase de grupos
        </footer>
      </body>
    </html>
  );
}
