"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-5xl">😵‍💫</p>
      <h1 className="mt-4 font-display text-2xl font-bold uppercase tracking-wide">
        Algo salió mal
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        No pudimos cargar los datos de la quiniela. Puede ser una falla temporal de
        conexión.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-gold px-4 py-2 font-semibold text-black transition hover:brightness-110"
      >
        Reintentar
      </button>
    </main>
  );
}
