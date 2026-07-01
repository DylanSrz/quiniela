"use client";

import { useMemo, useState } from "react";
import readXlsxFile from "read-excel-file";
import { normalizeName, flagFor } from "@/lib/teams";
import { upsertPredictions, type PredInput } from "@/app/admin/actions";
import type { Match, Participant } from "@/lib/types";

type Props = {
  participants: Participant[];
  matches: Match[];
};

type ParsedRow = {
  group: string;
  jornada: string; // J1/J2/J3
  home: string;
  away: string;
  predHome: number | null;
  predAway: number | null;
  matchId: number | null;
  status: "ok" | "nomatch" | "badnum";
};

// Bloques (fila header, 1-indexed) y los grupos izq/der de cada bloque.
const BLOCKS = [
  { start: 2, left: "A", right: "G" },
  { start: 9, left: "B", right: "H" },
  { start: 16, left: "C", right: "I" },
  { start: 23, left: "D", right: "J" },
  { start: 30, left: "E", right: "K" },
  { start: 37, left: "F", right: "L" },
];

function jornadaOf(raw: unknown): string {
  const s = String(raw ?? "");
  const digit = s.match(/[123]/)?.[0];
  return digit ? `J${digit}` : "";
}

function num(raw: unknown): number | null {
  if (raw === null || raw === undefined || String(raw).trim() === "") return null;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 ? n : null;
}

export default function PronosticosUploader({ participants, matches }: Props) {
  const [participantId, setParticipantId] = useState<number | "">("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // Índice de partidos por (grupo|jornada|home|away) normalizado.
  const matchIndex = useMemo(() => {
    const idx = new Map<string, number>();
    for (const mt of matches) {
      const key = `${mt.group_letter}|${mt.jornada}|${normalizeName(
        mt.home_team
      )}|${normalizeName(mt.away_team)}`;
      idx.set(key, mt.id);
    }
    return idx;
  }, [matches]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    setResult(null);
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    // Lee la hoja "Hoja1" si existe; si no, la primera hoja del libro.
    // read-excel-file devuelve las filas como arrays (celdas vacías = null).
    let grid: unknown[][];
    try {
      grid = (await readXlsxFile(file, { sheet: "Hoja1" })) as unknown[][];
    } catch {
      grid = (await readXlsxFile(file)) as unknown[][];
    }

    const parsed: ParsedRow[] = [];

    for (const block of BLOCKS) {
      for (let r = 1; r <= 6; r++) {
        const rowIdx = block.start - 2 + r; // 0-indexed fila del partido (datos arrancan en block.start)
        const row = grid[rowIdx] ?? [];

        // Bloque izquierdo: D(3)=jor, E(4)=casa, F(5)=gol, G(6)=gol, H(7)=fuera
        addRow(parsed, {
          group: block.left,
          jornada: jornadaOf(row[3]),
          home: String(row[4] ?? "").trim(),
          away: String(row[7] ?? "").trim(),
          predHome: num(row[5]),
          predAway: num(row[6]),
        }, matchIndex);

        // Bloque derecho: N(13)=jor, O(14)=casa, P(15)=gol, Q(16)=gol, R(17)=fuera
        addRow(parsed, {
          group: block.right,
          jornada: jornadaOf(row[13]),
          home: String(row[14] ?? "").trim(),
          away: String(row[17] ?? "").trim(),
          predHome: num(row[15]),
          predAway: num(row[16]),
        }, matchIndex);
      }
    }

    setRows(parsed);
  }

  const okCount = rows.filter((r) => r.status === "ok").length;
  const nomatch = rows.filter((r) => r.status === "nomatch").length;
  const badnum = rows.filter((r) => r.status === "badnum").length;
  const canSave =
    participantId !== "" && okCount > 0 && nomatch === 0 && badnum === 0;

  async function onConfirm() {
    if (participantId === "") return;
    setSaving(true);
    setResult(null);
    const payload: PredInput[] = rows
      .filter((r) => r.status === "ok" && r.matchId !== null)
      .map((r) => ({
        match_id: r.matchId as number,
        pred_home: r.predHome as number,
        pred_away: r.predAway as number,
      }));
    const res = await upsertPredictions(Number(participantId), payload);
    setSaving(false);
    if (res.ok) {
      setResult(`✓ Guardados ${res.count} pronósticos correctamente.`);
      setRows([]);
      setFileName("");
    } else {
      setResult(`Error: ${res.error}`);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-white/10 bg-surface p-4">
        <label className="block text-xs uppercase tracking-wide text-muted">
          1 · Participante
        </label>
        <select
          value={participantId}
          onChange={(e) =>
            setParticipantId(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-gold"
        >
          <option value="">Seleccionar…</option>
          {participants.map((p) => (
            <option key={p.id} value={p.id}>
              {p.avatar_emoji} {p.display_name}
            </option>
          ))}
        </select>

        <label className="mt-4 block text-xs uppercase tracking-wide text-muted">
          2 · Archivo Excel (.xlsx)
        </label>
        <input
          type="file"
          accept=".xlsx"
          onChange={onFile}
          disabled={participantId === ""}
          className="mt-1 w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-gold file:px-3 file:py-2 file:font-semibold file:text-black disabled:opacity-50"
        />
        {participantId === "" && (
          <p className="mt-1 text-xs text-muted">
            Primero elige un participante.
          </p>
        )}
      </section>

      {rows.length > 0 && (
        <section className="rounded-2xl border border-white/10 bg-surface p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-xs uppercase tracking-wide text-muted">
                3 · Vista previa · {fileName}
              </h2>
              <p className="mt-1 text-sm">
                <span className="text-exacto">{okCount} ok</span>
                {nomatch > 0 && (
                  <span className="text-red-400"> · {nomatch} sin emparejar</span>
                )}
                {badnum > 0 && (
                  <span className="text-resultado"> · {badnum} con goles inválidos</span>
                )}
              </p>
            </div>
            <button
              onClick={onConfirm}
              disabled={!canSave || saving}
              className="rounded-lg bg-gold px-4 py-2 font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "Guardando…" : `Confirmar ${okCount} pronósticos`}
            </button>
          </div>

          {(nomatch > 0 || badnum > 0) && (
            <p className="mb-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">
              Corrige los problemas antes de guardar: todos los 72 partidos deben
              emparejar y tener goles numéricos.
            </p>
          )}

          <div className="thin-scroll max-h-96 overflow-auto rounded-lg border border-white/10">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-surface-2">
                <tr className="text-left text-muted">
                  <th className="px-2 py-2">Gr</th>
                  <th className="px-2 py-2">Jor</th>
                  <th className="px-2 py-2">Partido</th>
                  <th className="px-2 py-2 text-center">Pron.</th>
                  <th className="px-2 py-2 text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-white/5">
                    <td className="px-2 py-1.5 text-muted">{r.group}</td>
                    <td className="px-2 py-1.5 text-muted">{r.jornada || "?"}</td>
                    <td className="px-2 py-1.5">
                      {flagFor(r.home)} {r.home} vs {r.away} {flagFor(r.away)}
                    </td>
                    <td className="px-2 py-1.5 text-center font-display tabular-nums">
                      {r.predHome ?? "·"}-{r.predAway ?? "·"}
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      {r.status === "ok" && <span className="text-exacto">✓</span>}
                      {r.status === "nomatch" && (
                        <span className="text-red-400">sin match</span>
                      )}
                      {r.status === "badnum" && (
                        <span className="text-resultado">goles?</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {result && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            result.startsWith("✓")
              ? "bg-exacto/15 text-exacto"
              : "bg-red-500/15 text-red-300"
          }`}
        >
          {result}
        </p>
      )}
    </div>
  );
}

function addRow(
  acc: ParsedRow[],
  data: Omit<ParsedRow, "matchId" | "status">,
  matchIndex: Map<string, number>
) {
  // Fila vacía (sin equipos) → ignorar.
  if (!data.home && !data.away) return;

  const key = `${data.group}|${data.jornada}|${normalizeName(
    data.home
  )}|${normalizeName(data.away)}`;
  const matchId = matchIndex.get(key) ?? null;

  let status: ParsedRow["status"] = "ok";
  if (matchId === null) status = "nomatch";
  else if (data.predHome === null || data.predAway === null) status = "badnum";

  acc.push({ ...data, matchId, status });
}
