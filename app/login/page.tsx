import { login } from "./actions";
import SubmitButton from "@/components/SubmitButton";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const { from, error } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <form
        action={login}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-surface p-6 shadow-xl"
      >
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-gold">
          Panel admin
        </h1>
        <p className="mt-1 text-sm text-muted">
          Quiniela Hunters · acceso restringido
        </p>

        <input type="hidden" name="from" value={from ?? "/admin"} />

        <label className="mt-6 block text-sm text-muted" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoFocus
          required
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-base outline-none focus:border-gold"
        />

        {error && (
          <p className="mt-3 text-sm text-red-400">Contraseña incorrecta.</p>
        )}

        <SubmitButton
          pendingText="Verificando…"
          className="mt-6 w-full rounded-lg bg-gold px-4 py-2.5 font-semibold text-black hover:brightness-110"
        >
          Entrar
        </SubmitButton>
      </form>
    </main>
  );
}
