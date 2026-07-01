import Link from "next/link";
import { supabasePublic } from "@/lib/supabase";
import { flagFor } from "@/lib/teams";
import { fmtDateTime } from "@/lib/format";
import { saveResult, clearResult } from "../actions";
import ActionForm from "@/components/ActionForm";
import SubmitButton from "@/components/SubmitButton";
import { JORNADAS, MAX_GOALS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function ResultadosPage({
  searchParams,
}: {
  searchParams: Promise<{ j?: string }>;
}) {
  const { j } = await searchParams;
  const jornada = (JORNADAS as readonly string[]).includes(j ?? "")
    ? (j as string)
    : "J1";

  const sb = supabasePublic();
  const { data } = await sb
    .from("matches")
    .select("*")
    .eq("jornada", jornada)
    .order("kickoff_utc");
  const matches = data ?? [];

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
        Resultados
      </h1>

      <div className="flex gap-2">
        {JORNADAS.map((jj) => (
          <Link
            key={jj}
            href={`/admin/resultados?j=${jj}`}
            className={`flex-1 rounded-lg border px-3 py-2 text-center text-sm font-medium transition ${
              jornada === jj
                ? "border-gold/50 bg-gold/15 text-gold"
                : "border-white/10 bg-surface text-muted hover:text-white"
            }`}
          >
            Jornada {jj.slice(1)}
          </Link>
        ))}
      </div>

      <div className="space-y-2">
        {matches.map((m) => (
          <div
            key={m.id}
            className={`rounded-xl border bg-surface p-3 ${
              m.finished ? "border-exacto/30" : "border-white/10"
            }`}
          >
            <div className="mb-2 flex items-center justify-between text-[11px] text-muted">
              <span>Grupo {m.group_letter}</span>
              <span>{fmtDateTime(m.kickoff_utc)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex-1 text-right text-sm font-medium">
                {m.home_team} {flagFor(m.home_team)}
              </span>

              <ActionForm action={saveResult} className="flex items-center gap-1">
                <input type="hidden" name="match_id" value={m.id} />
                <input
                  name="home_goals"
                  type="number"
                  min={0}
                  max={MAX_GOALS}
                  defaultValue={m.home_goals ?? ""}
                  className="w-12 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-center outline-none focus:border-gold"
                />
                <span className="text-muted">-</span>
                <input
                  name="away_goals"
                  type="number"
                  min={0}
                  max={MAX_GOALS}
                  defaultValue={m.away_goals ?? ""}
                  className="w-12 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-center outline-none focus:border-gold"
                />
                <SubmitButton className="ml-1 rounded-lg bg-gold px-3 py-1.5 text-sm font-semibold text-black hover:brightness-110">
                  {m.finished ? "Actualizar" : "Guardar"}
                </SubmitButton>
              </ActionForm>

              <span className="flex-1 text-left text-sm font-medium">
                {flagFor(m.away_team)} {m.away_team}
              </span>
            </div>
            {m.finished && (
              <div className="mt-2 flex items-center justify-end gap-2">
                <span className="text-xs text-exacto">✓ finalizado</span>
                <ActionForm action={clearResult}>
                  <input type="hidden" name="match_id" value={m.id} />
                  <SubmitButton
                    pendingText="…"
                    className="rounded-md border border-white/15 px-2 py-1 text-xs text-muted hover:bg-white/5"
                  >
                    Revertir
                  </SubmitButton>
                </ActionForm>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
