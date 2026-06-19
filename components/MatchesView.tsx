"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { flagFor } from "@/lib/teams";
import { fmtDateTime } from "@/lib/format";
import { JORNADAS, type Jornada } from "@/lib/constants";
import type { Match, Participant, Prediction } from "@/lib/types";

type Props = {
  matches: Match[];
  participants: Participant[];
  predictions: Prediction[];
};

export default function MatchesView({ matches, participants, predictions }: Props) {
  const [jornada, setJornada] = useState<Jornada>("J1");

  // Index pronósticos por partido.
  const predsByMatch = useMemo(() => {
    const m = new Map<number, Prediction[]>();
    for (const p of predictions) {
      const arr = m.get(p.match_id) ?? [];
      arr.push(p);
      m.set(p.match_id, arr);
    }
    return m;
  }, [predictions]);

  const partById = useMemo(() => {
    const m = new Map<number, Participant>();
    for (const p of participants) m.set(p.id, p);
    return m;
  }, [participants]);

  const visibles = matches
    .filter((m) => m.jornada === jornada)
    .sort((a, b) => a.kickoff_utc.localeCompare(b.kickoff_utc));

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {JORNADAS.map((j) => (
          <button
            key={j}
            onClick={() => setJornada(j)}
            className={`relative flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              jornada === j ? "text-gold" : "text-muted hover:text-white"
            }`}
          >
            {jornada === j && (
              <motion.span
                layoutId="jornadaTab"
                className="absolute inset-0 -z-10 rounded-lg border border-gold/50 bg-gold/15"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            Jornada {j.slice(1)}
          </button>
        ))}
      </div>

      <motion.div layout className="space-y-3">
        <AnimatePresence mode="popLayout">
          {visibles.map((m) => (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <MatchCard
                match={m}
                preds={predsByMatch.get(m.id) ?? []}
                partById={partById}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function MatchCard({
  match,
  preds,
  partById,
}: {
  match: Match;
  preds: Prediction[];
  partById: Map<number, Participant>;
}) {
  const [open, setOpen] = useState(false);
  const finished = match.finished;

  return (
    <div className="overflow-hidden rounded-xl glass">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-3 py-3 text-left"
      >
        <span className="w-14 shrink-0 text-[11px] uppercase tracking-wide text-muted">
          Grupo {match.group_letter}
        </span>

        <div className="flex flex-1 items-center justify-center gap-2 text-sm">
          <span className="flex-1 text-right font-medium">
            {match.home_team} <span className="text-base">{flagFor(match.home_team)}</span>
          </span>
          <span
            className={`min-w-14 rounded-md px-2 py-1 text-center font-display text-base font-bold ${
              finished ? "bg-black/40 text-white" : "text-muted"
            }`}
          >
            {finished ? `${match.home_goals} - ${match.away_goals}` : "vs"}
          </span>
          <span className="flex-1 text-left font-medium">
            <span className="text-base">{flagFor(match.away_team)}</span> {match.away_team}
          </span>
        </div>

        <motion.span animate={{ rotate: open ? 180 : 0 }} className="ml-1 text-muted">
          ▾
        </motion.span>
      </button>

      <div className="flex items-center gap-2 px-3 pb-2 text-[11px] text-muted">
        {fmtDateTime(match.kickoff_utc)}
        {finished ? (
          <span className="text-exacto">· finalizado</span>
        ) : (
          <span className="flex items-center gap-1">
            · por jugar
          </span>
        )}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-white/10 bg-black/20"
          >
            <div className="p-3">
              {preds.length === 0 ? (
                <p className="text-sm text-muted">Sin pronósticos cargados.</p>
              ) : (
                <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {preds
                    .slice()
                    .sort((a, b) => (b.points ?? -1) - (a.points ?? -1))
                    .map((p) => {
                      const part = partById.get(p.participant_id);
                      if (!part) return null;
                      return (
                        <li
                          key={p.participant_id}
                          className="flex items-center justify-between rounded-lg bg-white/5 px-2.5 py-1.5 text-sm"
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <span>{part.avatar_emoji}</span>
                            <span className="truncate">{part.display_name}</span>
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="font-display tabular-nums">
                              {p.pred_home}-{p.pred_away}
                            </span>
                            {finished && <PointsBadge points={p.points} />}
                          </span>
                        </li>
                      );
                    })}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PointsBadge({ points }: { points: number | null }) {
  if (points === null || points === undefined) return null;
  const pts = Number(points);
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
