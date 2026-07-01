import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-5xl">🔍</p>
      <h1 className="mt-4 font-display text-3xl font-bold uppercase tracking-wide">
        Página no encontrada
      </h1>
      <p className="mt-2 text-sm text-muted">
        El enlace que buscas no existe o el participante fue eliminado.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-gold px-4 py-2 font-semibold text-black transition hover:brightness-110"
      >
        Volver a la tabla
      </Link>
    </main>
  );
}
