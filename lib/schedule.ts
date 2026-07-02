import { TIMEZONE } from "./constants";
import type { Match } from "./types";

// "YYYY-MM-DD" del instante dado en la zona horaria de referencia.
const DAY_FMT = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function dayKey(date: Date): string {
  return DAY_FMT.format(date);
}

export type UpcomingInfo =
  | { kind: "today"; matches: Match[] }
  | { kind: "next"; match: Match }
  | { kind: "none" };

// Partidos de "hoy" (en TIMEZONE) que no han terminado, ordenados por hora;
// si hoy no juega nadie, el próximo partido por jugarse; "none" si la fase
// ya terminó por completo.
export function upcomingMatches(matches: Match[], now: Date): UpcomingInfo {
  const today = dayKey(now);
  const pending = matches.filter((m) => !m.finished);

  const todays = pending
    .filter((m) => dayKey(new Date(m.kickoff_utc)) === today)
    .sort((a, b) => a.kickoff_utc.localeCompare(b.kickoff_utc));
  if (todays.length > 0) return { kind: "today", matches: todays };

  const next = pending
    .filter((m) => new Date(m.kickoff_utc).getTime() > now.getTime())
    .sort((a, b) => a.kickoff_utc.localeCompare(b.kickoff_utc))[0];
  return next ? { kind: "next", match: next } : { kind: "none" };
}
