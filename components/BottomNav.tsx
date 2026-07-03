"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Tabla", emoji: "🏆", exact: true },
  { href: "/partidos", label: "Partidos", emoji: "⚽", exact: false },
  { href: "/grupos", label: "Grupos", emoji: "🌎", exact: false },
  { href: "/comparar", label: "Comparar", emoji: "⚔️", exact: false },
  { href: "/estadisticas", label: "Stats", emoji: "📊", exact: false },
];

// Barra de pestañas inferior para móvil (las secciones públicas). En sm+ se
// oculta y manda la nav superior. Incluye un espaciador en flujo para que la
// barra fija no tape el final del contenido ni el footer.
export default function BottomNav() {
  const pathname = usePathname();

  // El panel admin y el login tienen su propia navegación.
  if (pathname.startsWith("/admin") || pathname.startsWith("/login")) {
    return null;
  }

  return (
    <>
      <div aria-hidden className="h-14 sm:hidden" />
      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-bg/90 backdrop-blur sm:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="mx-auto flex max-w-3xl">
          {TABS.map((t) => {
            const active = t.exact
              ? pathname === t.href
              : pathname.startsWith(t.href);
            return (
              <li key={t.href} className="flex-1">
                <Link
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition ${
                    active ? "text-gold" : "text-muted"
                  }`}
                >
                  <span className="text-base leading-none">{t.emoji}</span>
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
