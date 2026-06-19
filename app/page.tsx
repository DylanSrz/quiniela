import { getMatches, getStandings } from "@/lib/data";
import LiveRefresh from "@/components/LiveRefresh";
import ShareButton from "@/components/ShareButton";
import Hero from "@/components/Hero";
import Podium from "@/components/Podium";
import AnimatedStandings from "@/components/AnimatedStandings";
import { SCORING } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [standings, matches] = await Promise.all([getStandings(), getMatches()]);
  const jugados = matches.filter((m) => m.finished).length;
  const total = matches.length;
  const leader = standings[0];
  const hayPuntos = standings.some((s) => s.jugados > 0);

  const shareText = leader
    ? `🎯 Quiniela Hunters — va liderando ${leader.participant.avatar_emoji} ${leader.participant.display_name} con ${leader.points} pts (${jugados}/${total} partidos)`
    : "🎯 Quiniela Hunters — Mundial 2026";

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <LiveRefresh />

      {standings.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <Hero
            jugados={jugados}
            total={total}
            leader={leader}
            hayPuntos={hayPuntos}
          />

          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold uppercase tracking-wide">
              Tabla de posiciones
            </h2>
            <ShareButton text={shareText} />
          </div>

          {hayPuntos && <Podium standings={standings.slice(0, 3)} />}

          <AnimatedStandings standings={standings} hayPuntos={hayPuntos} />

          <p className="mt-3 text-xs text-muted">
            Marcador exacto = {SCORING.exacto} pts · ganador acertado ={" "}
            {SCORING.ganador} · empate acertado = {SCORING.empate} pt. Desempate:
            más 🎯, luego más ✓.
          </p>
        </>
      )}
    </main>
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
