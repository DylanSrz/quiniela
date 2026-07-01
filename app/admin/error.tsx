"use client";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
      <p className="text-3xl">⚠️</p>
      <h1 className="mt-2 font-display text-xl font-bold uppercase tracking-wide">
        Error en el panel
      </h1>
      <p className="mt-1 text-sm text-muted">
        No se pudo completar la operación. Revisa la conexión e inténtalo de nuevo.
      </p>
      <button
        onClick={reset}
        className="mt-4 rounded-lg bg-gold px-4 py-2 font-semibold text-black transition hover:brightness-110"
      >
        Reintentar
      </button>
    </div>
  );
}
