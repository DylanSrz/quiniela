"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

// Enlace de navegación con indicador animado de ruta activa.
export default function NavLink({
  href,
  children,
  exact = false,
}: {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`relative rounded-md px-3 py-1.5 transition ${
        active ? "text-white" : "text-muted hover:text-white"
      }`}
    >
      {children}
      {active && (
        <motion.span
          layoutId="navActive"
          className="absolute inset-0 -z-10 rounded-md bg-white/10"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
    </Link>
  );
}
