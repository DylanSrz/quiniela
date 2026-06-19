"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { MEDALS } from "@/lib/constants";
import CountUp from "./CountUp";
import type { StandingRow } from "@/lib/types";

// Orden visual del podio: 2º (izq) · 1º (centro, más alto) · 3º (der).
const ORDER = [1, 0, 2];
const HEIGHTS = ["h-20", "h-28", "h-16"]; // por posición real 1/2/3
const RING = [
  "border-gold/50 bg-gold/10 glow-gold",
  "border-white/10 bg-surface",
  "border-white/10 bg-surface",
];

export default function Podium({ standings }: { standings: StandingRow[] }) {
  const top = ORDER.map((i) => ({ row: standings[i], pos: i })).filter(
    (x) => x.row
  );

  return (
    <div className="mb-6 grid grid-cols-3 items-end gap-2">
      {top.map(({ row, pos }, idx) => (
        <motion.div
          key={row.participant.id}
          initial={{ opacity: 0, y: 24, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: idx * 0.12, type: "spring", stiffness: 200, damping: 18 }}
        >
          <Link
            href={`/participante/${row.participant.id}`}
            className={`flex flex-col items-center rounded-2xl border p-3 text-center transition hover:brightness-110 ${RING[pos]}`}
          >
            <motion.span
              className="text-2xl"
              initial={{ rotate: -20, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2 + idx * 0.12, type: "spring", stiffness: 260 }}
            >
              {MEDALS[pos]}
            </motion.span>
            <span className="mt-1 text-3xl">{row.participant.avatar_emoji}</span>
            <span className="mt-1 line-clamp-1 text-xs font-medium">
              {row.participant.display_name}
            </span>
            <span className="font-display text-2xl font-bold text-gold">
              <CountUp value={row.points} />
            </span>
            <motion.div
              className={`mt-2 w-full rounded-t-lg brand-gradient ${HEIGHTS[pos]}`}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              style={{ transformOrigin: "bottom", opacity: pos === 0 ? 0.95 : 0.55 }}
              transition={{ delay: 0.25 + idx * 0.12, duration: 0.5, ease: "easeOut" }}
            />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
