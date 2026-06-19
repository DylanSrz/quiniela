"use client";

import { motion } from "motion/react";
import ProgressRing from "./ProgressRing";
import CountUp from "./CountUp";
import type { StandingRow } from "@/lib/types";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function Hero({
  jugados,
  total,
  leader,
  hayPuntos,
}: {
  jugados: number;
  total: number;
  leader?: StandingRow;
  hayPuntos: boolean;
}) {
  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="mb-6 overflow-hidden rounded-3xl glass p-5 sm:p-6"
    >
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-center sm:text-left">
          <motion.p variants={item} className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Mundial FIFA 2026 · Fase de grupos
          </motion.p>
          <motion.h1
            variants={item}
            className="font-display text-4xl font-bold uppercase leading-none text-gradient sm:text-5xl"
          >
            Quiniela Hunters
          </motion.h1>
          {leader && hayPuntos ? (
            <motion.p variants={item} className="mt-3 text-sm text-muted">
              Lidera{" "}
              <span className="font-semibold text-white">
                {leader.participant.avatar_emoji} {leader.participant.display_name}
              </span>{" "}
              con{" "}
              <span className="font-display font-bold text-gold">
                <CountUp value={leader.points} />
              </span>{" "}
              pts
            </motion.p>
          ) : (
            <motion.p variants={item} className="mt-3 text-sm text-muted">
              Que empiece la cacería de puntos ⚽
            </motion.p>
          )}
        </div>

        <motion.div variants={item}>
          <ProgressRing value={jugados} total={total}>
            <div>
              <div className="font-display text-3xl font-bold leading-none">
                <CountUp value={jugados} />
                <span className="text-muted">/{total}</span>
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-wide text-muted">
                partidos
              </div>
            </div>
          </ProgressRing>
        </motion.div>
      </div>
    </motion.section>
  );
}
