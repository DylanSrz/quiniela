const DATE_FMT = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  weekday: "short",
  day: "2-digit",
  month: "short",
});

const TIME_FMT = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

export function fmtDate(iso: string): string {
  return DATE_FMT.format(new Date(iso));
}

export function fmtTime(iso: string): string {
  return TIME_FMT.format(new Date(iso));
}

export function fmtDateTime(iso: string): string {
  return `${fmtDate(iso)} · ${fmtTime(iso)}`;
}
