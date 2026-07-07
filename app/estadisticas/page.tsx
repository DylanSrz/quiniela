import { getMatches, getParticipants, getPredictions } from "@/lib/data";
import {
  reyDeExactos,
  mejorJornada,
  cucharaDePalo,
  rachaActual,
  gemelos,
  exactoSolitario,
  type Stat,
} from "@/lib/stats";
import LiveRefresh from "@/components/LiveRefresh";
import ShareButton from "@/components/ShareButton";

export const revalidate = 30;

export default async function EstadisticasPage() {
  const [participants, predictions, matches] = await Promise.all([
    getParticipants(),
    getPredictions(),
    getMatches(),
  ]);

  const cards: { emoji: string; title: string; desc: string; stat: Stat | null }[] = [
    {
      emoji: "🎯",
      title: "Rey de los exactos",
      desc: "Más marcadores clavados",
      stat: reyDeExactos(participants, predictions),
    },
    {
      emoji: "🔥",
      title: "Mejor jornada",
      desc: "Más puntos en una sola jornada",
      stat: mejorJornada(participants, predictions, matches),
    },
    {
      emoji: "📈",
      title: "En racha",
      desc: "Partidos seguidos sumando puntos",
      stat: rachaActual(participants, predictions, matches),
    },
    {
      emoji: "🦄",
      title: "Profeta solitario",
      desc: "Exactos que nadie más pronosticó",
      stat: exactoSolitario(participants, predictions),
    },
    {
      emoji: "🤝",
      title: "Gemelos",
      desc: "La pareja con más pronósticos idénticos",
      stat: gemelos(participants, predictions),
    },
    {
      emoji: "🥄",
      title: "Cuchara de palo",
      desc: "El fondo de la tabla (con cariño)",
      stat: cucharaDePalo(participants, predictions),
    },
  ];

  const visibles = cards.filter((c) => c.stat !== null);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <LiveRefresh />
      <h1 className="mb-1 font-display text-3xl font-bold uppercase tracking-wide">
        Estadísticas
      </h1>
      <p className="mb-5 text-sm text-muted">
        Los números que alimentan el pique del grupo.
      </p>

      {visibles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-surface p-8 text-center">
          <p className="text-4xl">📊</p>
          <p className="mt-3 font-medium">
            {participants.length === 0
              ? "Aún no hay participantes."
              : "Aún no hay suficientes resultados."}
          </p>
          <p className="mt-1 text-sm text-muted">
            {participants.length === 0
              ? "El admin debe crear los perfiles primero."
              : "Cuando rueden los primeros partidos, aquí saldrán los héroes y las víctimas."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {visibles.map((c) => (
            <section
              key={c.title}
              className="rounded-2xl border border-white/10 bg-surface p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-base font-bold uppercase tracking-wide">
                    {c.emoji} {c.title}
                  </h2>
                  <p className="mt-0.5 text-xs text-muted">{c.desc}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {c.stat!.entries.map((e) => (
                  <span
                    key={e.participant.id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-sm font-medium"
                  >
                    <span>{e.participant.avatar_emoji}</span>
                    {e.participant.display_name}
                    {e.label && (
                      <span className="text-xs text-muted">({e.label})</span>
                    )}
                  </span>
                ))}
              </div>
              <p className="mt-2 font-display text-lg font-bold text-gold">
                {c.stat!.value}
              </p>
              <div className="mt-3">
                <ShareButton text={shareTextFor(c)} label="Compartir" />
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

function shareTextFor(c: { emoji: string; title: string; stat: Stat | null }): string {
  const stat = c.stat!;
  const names = stat.entries
    .map(
      (e) =>
        `${e.participant.avatar_emoji} ${e.participant.display_name}${
          e.label ? ` (${e.label})` : ""
        }`
    )
    .join(", ");
  return `${c.emoji} ${c.title}: ${names} — ${stat.value}`;
}
