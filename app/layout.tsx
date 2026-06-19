import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Oswald } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import NavLink from "@/components/NavLink";
import PageTransition from "@/components/PageTransition";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://quiniela-hunters.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Quiniela Hunters · Mundial 2026",
  description:
    "Quiniela privada de la fase de grupos del Mundial 2026 entre los Hunters.",
  applicationName: "Quiniela Hunters",
  openGraph: {
    type: "website",
    title: "Quiniela Hunters · Mundial 2026",
    description:
      "Tabla de posiciones en vivo de la quiniela del Mundial 2026 entre los Hunters.",
    siteName: "Quiniela Hunters",
    locale: "es_CO",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quiniela Hunters · Mundial 2026",
    description: "Tabla de posiciones en vivo de la quiniela del Mundial 2026.",
  },
};

export const viewport: Viewport = {
  themeColor: "#060912",
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
        <header className="sticky top-0 z-20 border-b border-white/10 bg-bg/70 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl">⚽</span>
              <span className="font-display text-lg font-bold uppercase tracking-wide">
                Quiniela <span className="text-gold">Hunters</span>
              </span>
            </Link>
            <div className="flex items-center gap-1 text-sm">
              <NavLink href="/" exact>
                Posiciones
              </NavLink>
              <NavLink href="/partidos">Partidos</NavLink>
              <NavLink href="/admin">
                <span aria-label="Panel de administrador" title="Panel de administrador">
                  ⚙️
                </span>
              </NavLink>
            </div>
          </nav>
        </header>

        <PageTransition>{children}</PageTransition>

        <footer className="mt-auto border-t border-white/10 px-4 py-6 text-center text-xs text-muted">
          <span className="brand-gradient bg-clip-text text-transparent">
            Quiniela Hunters
          </span>{" "}
          · Mundial FIFA 2026 · fase de grupos
        </footer>
      </body>
    </html>
  );
}
