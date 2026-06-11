import Link from "next/link";
import { getMatches, getStandings } from "@/lib/data";
import LiveRefresh from "@/components/LiveRefresh";
import ShareButton from "@/components/ShareButton";

export const revalidate = 30;

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function HomePage() {
  const [standings, matches] = await Promise.all([getStandings(), getMatches()]);
  const jugados = matches.filter((m) => m.finished).length;
  const leader = standings[0];
  const hayPuntos = standings.some((s) => s.jugados > 0);

  const shareText = leader
    ? `🎯 Quiniela Hunters — va liderando ${leader.participant.avatar_emoji} ${leader.participant.display_name} con ${leader.points} pts (${jugados}/72 partidos)`
    : "🎯 Quiniela Hunters — Mundial 2026";

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <LiveRefresh />

      <section className="mb-6">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">
          Tabla de posiciones
        </h1>
        <div className="mt-1 flex items-center justify-between gap-3">
          <p className="text-sm text-muted">
            {jugados} de 72 partidos jugados · fase de grupos
          </p>
          <ShareButton text={shareText} />
        </div>
      </section>

      {standings.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {hayPuntos && <Podium standings={standings.slice(0, 3)} />}

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-muted">
                  <th className="px-3 py-3 text-left font-medium">#</th>
                  <th className="px-2 py-3 text-left font-medium">Jugador</th>
                  <th className="px-2 py-3 text-center font-medium" title="Partidos jugados">PJ</th>
                  <th className="px-2 py-3 text-center font-medium" title="Marcadores exactos">🎯</th>
                  <th className="px-2 py-3 text-center font-medium" title="Resultados acertados">✓</th>
                  <th className="px-3 py-3 text-right font-medium">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row, i) => (
                  <tr
                    key={row.participant.id}
                    className={`border-b border-white/5 last:border-0 ${
                      i === 0 && hayPuntos ? "bg-gold/10" : ""
                    }`}
                  >
                    <td className="px-3 py-3 text-muted">
                      {i < 3 && hayPuntos ? MEDALS[i] : i + 1}
                    </td>
                    <td className="px-2 py-3">
                      <Link
                        href={`/participante/${row.participant.id}`}
                        className="flex items-center gap-2 hover:text-gold"
                      >
                        <span className="text-lg">{row.participant.avatar_emoji}</span>
                        <span className="font-medium">{row.participant.display_name}</span>
                      </Link>
                    </td>
                    <td className="px-2 py-3 text-center text-muted">{row.jugados}</td>
                    <td className="px-2 py-3 text-center text-exacto">{row.exactos}</td>
                    <td className="px-2 py-3 text-center text-resultado">{row.resultados}</td>
                    <td className="px-3 py-3 text-right font-display text-lg font-bold">
                      {row.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-muted">
            Marcador exacto = 3 pts · resultado acertado = 1 pt. Desempate: más 🎯,
            luego más ✓.
          </p>
        </>
      )}
    </main>
  );
}

function Podium({
  standings,
}: {
  standings: Awaited<ReturnType<typeof getStandings>>;
}) {
  return (
    <div className="mb-5 grid grid-cols-3 gap-2">
      {standings.map((row, i) => (
        <Link
          key={row.participant.id}
          href={`/participante/${row.participant.id}`}
          className={`flex flex-col items-center rounded-xl border p-3 text-center transition hover:brightness-110 ${
            i === 0 ? "border-gold/40 bg-gold/10" : "border-white/10 bg-surface"
          }`}
        >
          <span className="text-2xl">{MEDALS[i]}</span>
          <span className="mt-1 text-2xl">{row.participant.avatar_emoji}</span>
          <span className="mt-1 truncate text-xs font-medium">
            {row.participant.display_name}
          </span>
          <span className="font-display text-xl font-bold text-gold">
            {row.points}
          </span>
        </Link>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-surface p-8 text-center">
      <p className="text-4xl">⚽</p>
      <p className="mt-3 font-medium">Aún no hay participantes.</p>
      <p className="mt-1 text-sm text-muted">
        El administrador debe crear los perfiles y cargar los pronósticos.
      </p>
    </div>
  );
}
