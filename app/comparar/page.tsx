import Link from "next/link";
import { getMatches, getParticipants, getPredictions } from "@/lib/data";
import { computeStandings } from "@/lib/standings";
import { flagFor } from "@/lib/teams";
import { JORNADAS } from "@/lib/constants";
import LiveRefresh from "@/components/LiveRefresh";
import type { Match, Participant, Prediction } from "@/lib/types";

export const revalidate = 30;

export default async function CompararPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string | string[] }>;
}) {
  const { p } = await searchParams;
  const raw = Array.isArray(p) ? p : p ? [p] : [];
  const selectedIds = new Set(raw.map(Number).filter(Number.isFinite));

  const [participants, matches, predictions] = await Promise.all([
    getParticipants(),
    getMatches(),
    getPredictions(),
  ]);

  const selected = participants.filter((part) => selectedIds.has(part.id));

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <LiveRefresh />
      <h1 className="mb-1 font-display text-3xl font-bold uppercase tracking-wide">
        Comparar
      </h1>
      <p className="mb-5 text-sm text-muted">
        Elige 2 o más participantes para comparar sus pronósticos partido a
        partido.
      </p>

      {participants.length < 2 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-surface p-8 text-center">
          <p className="text-4xl">⚔️</p>
          <p className="mt-3 font-medium">
            {participants.length === 0
              ? "Aún no hay participantes."
              : "Hace falta al menos un participante más."}
          </p>
          <p className="mt-1 text-sm text-muted">
            Comparar necesita 2 o más perfiles; el admin debe crearlos primero.
          </p>
        </div>
      ) : (
        <>
          <SelectorForm participants={participants} selectedIds={selectedIds} />

          {selected.length >= 2 ? (
            <Comparison
              selected={selected}
              matches={matches}
              predictions={predictions}
            />
          ) : (
            <p className="mt-6 rounded-2xl border border-dashed border-white/15 bg-surface p-6 text-center text-sm text-muted">
              Selecciona al menos 2 participantes para ver la comparación.
            </p>
          )}
        </>
      )}
    </main>
  );
}

function SelectorForm({
  participants,
  selectedIds,
}: {
  participants: Participant[];
  selectedIds: Set<number>;
}) {
  return (
    <form
      method="get"
      className="mb-6 rounded-2xl border border-white/10 bg-surface p-4"
    >
      <div className="flex flex-wrap gap-2">
        {participants.map((part) => (
          <label
            key={part.id}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm transition has-[:checked]:border-gold/50 has-[:checked]:bg-gold/10 has-[:checked]:text-gold"
          >
            <input
              type="checkbox"
              name="p"
              value={part.id}
              defaultChecked={selectedIds.has(part.id)}
              className="accent-gold"
            />
            <span>{part.avatar_emoji}</span>
            <span>{part.display_name}</span>
          </label>
        ))}
      </div>
      <button
        type="submit"
        className="mt-4 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110"
      >
        Comparar
      </button>
    </form>
  );
}

function Comparison({
  selected,
  matches,
  predictions,
}: {
  selected: Participant[];
  matches: Match[];
  predictions: Prediction[];
}) {
  const ids = new Set(selected.map((p) => p.id));
  const relevantPreds = predictions.filter((p) => ids.has(p.participant_id));
  const standings = computeStandings(selected, relevantPreds);

  const predByKey = new Map<string, Prediction>(
    relevantPreds.map((p) => [`${p.participant_id}:${p.match_id}`, p])
  );

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-muted">
              <th className="px-3 py-3 text-left font-medium">Jugador</th>
              <th className="px-2 py-3 text-center font-medium">PJ</th>
              <th className="px-2 py-3 text-center font-medium">🎯</th>
              <th className="px-2 py-3 text-center font-medium">✓</th>
              <th className="px-3 py-3 text-right font-medium">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => (
              <tr
                key={row.participant.id}
                className="border-b border-white/5 last:border-0"
              >
                <td className="px-3 py-3">
                  <Link
                    href={`/participante/${row.participant.id}`}
                    className="flex items-center gap-2 hover:text-gold"
                  >
                    <span>{row.participant.avatar_emoji}</span>
                    <span className="font-medium">
                      {row.participant.display_name}
                    </span>
                  </Link>
                </td>
                <td className="px-2 py-3 text-center text-muted">{row.jugados}</td>
                <td className="px-2 py-3 text-center text-exacto">{row.exactos}</td>
                <td className="px-2 py-3 text-center text-resultado">
                  {row.resultados}
                </td>
                <td className="px-3 py-3 text-right font-display text-lg font-bold">
                  {row.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {JORNADAS.map((j) => {
        const ms = matches
          .filter((m) => m.jornada === j)
          .sort((a, b) => a.kickoff_utc.localeCompare(b.kickoff_utc));
        return (
          <section key={j}>
            <h2 className="mb-2 font-display text-lg font-bold uppercase tracking-wide">
              Jornada {j.slice(1)}
            </h2>
            <div className="thin-scroll overflow-x-auto rounded-xl border border-white/10 bg-surface">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-muted">
                    <th className="px-2 py-2">Partido</th>
                    <th className="px-2 py-2 text-center">Real</th>
                    {selected.map((part) => (
                      <th
                        key={part.id}
                        className="whitespace-nowrap px-2 py-2 text-center"
                      >
                        {part.avatar_emoji} {part.display_name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ms.map((m) => (
                    <tr key={m.id} className="border-t border-white/5">
                      <td className="whitespace-nowrap px-2 py-1.5">
                        {flagFor(m.home_team)} {m.home_team} vs {m.away_team}{" "}
                        {flagFor(m.away_team)}
                      </td>
                      <td className="px-2 py-1.5 text-center font-display tabular-nums text-muted">
                        {m.finished ? `${m.home_goals}-${m.away_goals}` : "—"}
                      </td>
                      {selected.map((part) => {
                        const pred = predByKey.get(`${part.id}:${m.id}`);
                        return (
                          <td key={part.id} className="px-2 py-1.5 text-center">
                            {pred ? (
                              <span className={cellClass(pred.points, m.finished)}>
                                {pred.pred_home}-{pred.pred_away}
                              </span>
                            ) : (
                              <span className="text-muted">·</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function cellClass(points: number | null, finished: boolean): string {
  const base = "rounded px-1.5 py-0.5 font-display tabular-nums font-bold";
  if (!finished || points === null) return "font-display tabular-nums text-muted";
  const pts = Number(points);
  if (pts === 3) return `${base} bg-exacto/20 text-exacto`;
  if (pts > 0) return `${base} bg-resultado/20 text-resultado`;
  return `${base} bg-white/10 text-muted`;
}
