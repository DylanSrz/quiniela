"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { MEDALS } from "@/lib/constants";
import CountUp from "./CountUp";
import type { StandingRow } from "@/lib/types";

// Ranking con reordenamiento animado (layout) cuando cambian los puntos en vivo,
// conteo animado de puntos e indicadores ▲▼ de cambio de posición.
export default function AnimatedStandings({
  standings,
  hayPuntos,
}: {
  standings: StandingRow[];
  hayPuntos: boolean;
}) {
  const prevRanks = useRef<Map<number, number>>(new Map());
  const [deltas, setDeltas] = useState<Map<number, number>>(new Map());

  // Calcular el cambio de posición respecto al render anterior (en un efecto,
  // nunca leyendo el ref durante el render).
  useEffect(() => {
    const next = new Map<number, number>();
    const changes = new Map<number, number>();
    standings.forEach((row, i) => {
      next.set(row.participant.id, i);
      const prev = prevRanks.current.get(row.participant.id);
      if (prev !== undefined && prev !== i) {
        changes.set(row.participant.id, prev - i);
      }
    });
    setDeltas(changes);
    prevRanks.current = next;
  }, [standings]);

  return (
    <div className="overflow-hidden rounded-2xl glass">
      <div className="grid grid-cols-[2rem_1fr_2.2rem_2.2rem_2.2rem_3rem] items-center gap-1 border-b border-white/10 px-3 py-3 text-[10px] uppercase tracking-wide text-muted sm:text-xs">
        <span>#</span>
        <span>Jugador</span>
        <span className="text-center" title="Partidos jugados">PJ</span>
        <span className="text-center" title="Marcadores exactos">🎯</span>
        <span className="text-center" title="Resultados acertados">✓</span>
        <span className="text-right">Pts</span>
      </div>

      <motion.ul layout>
        {standings.map((row, i) => {
          const delta = deltas.get(row.participant.id) ?? 0;
          const leader = i === 0 && hayPuntos;
          return (
            <motion.li
              key={row.participant.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ layout: { type: "spring", stiffness: 380, damping: 30 }, delay: i * 0.03 }}
              className={`grid grid-cols-[2rem_1fr_2.2rem_2.2rem_2.2rem_3rem] items-center gap-1 border-b border-white/5 px-3 py-3 text-sm last:border-0 ${
                leader ? "bg-gold/10" : ""
              }`}
            >
              <span className="flex items-center gap-0.5 text-muted">
                {i < 3 && hayPuntos ? (
                  <span className="text-base">{MEDALS[i]}</span>
                ) : (
                  i + 1
                )}
                {delta !== 0 && (
                  <span className={delta > 0 ? "text-[10px] text-exacto" : "text-[10px] text-[color:var(--color-ca)]"}>
                    {delta > 0 ? "▲" : "▼"}
                  </span>
                )}
              </span>

              <Link
                href={`/participante/${row.participant.id}`}
                className="flex min-w-0 items-center gap-2 hover:text-gold"
              >
                <span className="text-lg">{row.participant.avatar_emoji}</span>
                <span className="truncate font-medium">{row.participant.display_name}</span>
              </Link>

              <span className="text-center text-muted">{row.jugados}</span>
              <span className="text-center text-exacto">{row.exactos}</span>
              <span className="text-center text-resultado">{row.resultados}</span>
              <span className="text-right font-display text-lg font-bold">
                <CountUp value={row.points} />
              </span>
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  );
}
