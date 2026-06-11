import Link from "next/link";
import { logout } from "@/app/login/actions";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="mr-auto font-display text-xl font-bold uppercase tracking-wide text-gold">
          Admin
        </span>
        <AdminLink href="/admin">Inicio</AdminLink>
        <AdminLink href="/admin/participantes">Participantes</AdminLink>
        <AdminLink href="/admin/pronosticos">Pronósticos</AdminLink>
        <AdminLink href="/admin/resultados">Resultados</AdminLink>
        <form action={logout}>
          <button className="rounded-md border border-red-500/30 px-3 py-1.5 text-sm text-red-400 transition hover:bg-red-500/10">
            Salir
          </button>
        </form>
      </div>
      {children}
    </main>
  );
}

function AdminLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md border border-white/10 bg-surface px-3 py-1.5 text-sm text-muted transition hover:text-white"
    >
      {children}
    </Link>
  );
}
