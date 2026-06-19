"use client";

import { motion } from "motion/react";
import CountUp from "./CountUp";

// Barras de evolución por jornada que crecen al entrar en pantalla.
export default function EvolutionChart({
  data,
}: {
  data: { jornada: string; pts: number }[];
}) {
  const max = Math.max(1, ...data.map((x) => x.pts));

  return (
    <div className="flex items-end gap-3">
      {data.map((x, i) => (
        <div key={x.jornada} className="flex flex-1 flex-col items-center gap-1">
          <span className="font-display text-sm font-bold text-gold">
            <CountUp value={x.pts} />
          </span>
          <div className="flex h-24 w-full items-end">
            <motion.div
              className="w-full rounded-t-md brand-gradient"
              initial={{ height: 0, opacity: 0.5 }}
              whileInView={{ height: `${8 + (x.pts / max) * 88}px`, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <span className="text-xs text-muted">{x.jornada}</span>
        </div>
      ))}
    </div>
  );
}
