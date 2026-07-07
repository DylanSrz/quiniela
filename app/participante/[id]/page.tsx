import Link from "next/link";
import { notFound } from "next/navigation";
import { supabasePublic } from "@/lib/supabase";
import { getMatches } from "@/lib/data";
import { flagFor } from "@/lib/teams";
import { JORNADAS } from "@/lib/constants";
import LiveRefresh from "@/components/LiveRefresh";
import type { Prediction } from "@/lib/types";

export const revalidate = 30;

export default async function ParticipantePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const participantId = Number(id);
  if (!Number.isFinite(participantId)) notFound();

  const sb = supabasePublic();
  const [{ data: part }, matches, { data: preds }] = await Promise.all([
    sb.from("participants").select("*").eq("id", participantId).single(),
    getMatches(),
    sb.from("predictions").select("*").eq("participant_id", participantId),
  ]);

  if (!part) notFound();
  const participant = part;
  const predByMatch = new Map<number, Prediction>(
    (preds ?? []).map((p) => [p.match_id, p])
  );

  const total = (preds ?? []).reduce((s, p) => s + Number(p.points ?? 0), 0);

  // Acumulado por jornada para la gráfica de evolución.
  const porJornada = JORNADAS.map((j) => {
    const pts = matches
      .filter((m) => m.jornada === j && m.finished)
      .reduce((s, m) => s + Number(predByMatch.get(m.id)?.points ?? 0), 0);
    return { jornada: j, pts };
  });
  const maxJ = Math.max(1, ...porJornada.map((x) => x.pts));

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <LiveRefresh />

      <Link href="/" className="text-sm text-muted hover:text-gold">
        ← Volver a posiciones
      </Link>

      <header className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{participant.avatar_emoji}</span>
          <div>
            <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
              {participant.display_name}
            </h1>
            <p className="text-sm text-muted">
              <span className="font-display text-lg font-bold text-gold">{total}</span> puntos totales
            </p>
          </div>
        </div>
        <Link
          href={`/comparar?p=${participant.id}`}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-grass/40 bg-grass/10 px-3 py-1.5 text-sm font-medium text-grass transition hover:bg-grass/20"
        >
          ⚔️ Comparar
        </Link>
      </header>

      <section className="mt-5 rounded-2xl border border-white/10 bg-surface p-4">
        <h2 className="mb-3 text-xs uppercase tracking-wide text-muted">
          Evolución por jornada
        </h2>
        <div className="flex items-end gap-3">
          {porJornada.map((x) => (
            <div key={x.jornada} className="flex flex-1 flex-col items-center gap-1">
              <span className="font-display text-sm font-bold text-gold">{x.pts}</span>
              <div
                className="w-full rounded-t bg-grass/70"
                style={{ height: `${8 + (x.pts / maxJ) * 80}px` }}
              />
              <span className="text-xs text-muted">{x.jornada}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 space-y-6">
        {JORNADAS.map((j) => {
          const ms = matches
            .filter((m) => m.jornada === j)
            .sort((a, b) => a.kickoff_utc.localeCompare(b.kickoff_utc));
          const subtotal = ms.reduce(
            (s, m) => s + Number(predByMatch.get(m.id)?.points ?? 0),
            0
          );
          return (
            <section key={j}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold uppercase tracking-wide">
                  Jornada {j.slice(1)}
                </h2>
                <span className="text-sm text-muted">
                  Subtotal:{" "}
                  <span className="font-display font-bold text-gold">{subtotal}</span>
                </span>
              </div>
              <div className="overflow-hidden rounded-xl border border-white/10 bg-surface">
                {ms.map((m) => {
                  const pred = predByMatch.get(m.id);
                  return (
                    <div
                      key={m.id}
                      className="flex items-center gap-2 border-b border-white/5 px-3 py-2 text-sm last:border-0"
                    >
                      <span className="w-9 shrink-0 text-[10px] uppercase text-muted">
                        {m.group_letter}
                      </span>
                      <span className="flex-1 truncate text-right">
                        {m.home_team} {flagFor(m.home_team)}
                      </span>
                      <span className="min-w-12 text-center font-display text-xs text-muted">
                        {m.finished ? `${m.home_goals}-${m.away_goals}` : "—"}
                      </span>
                      <span className="flex-1 truncate text-left">
                        {flagFor(m.away_team)} {m.away_team}
                      </span>
                      <span className="min-w-12 text-center font-display tabular-nums">
                        {pred ? `${pred.pred_home}-${pred.pred_away}` : "·"}
                      </span>
                      <Points points={pred?.points ?? null} finished={m.finished} />
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

function Points({
  points,
  finished,
}: {
  points: number | null;
  finished: boolean;
}) {
  if (!finished) return <span className="w-8 text-center text-muted">·</span>;
  const pts = Number(points ?? 0);
  const cls =
    pts === 3
      ? "bg-exacto/20 text-exacto"
      : pts > 0
        ? "bg-resultado/20 text-resultado"
        : "bg-white/10 text-muted";
  return (
    <span className={`w-8 rounded px-1 text-center text-xs font-bold ${cls}`}>
      {pts}
    </span>
  );
}
