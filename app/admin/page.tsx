import Link from "next/link";
import { supabasePublic } from "@/lib/supabase";
import { EXPECTED_PARTICIPANTS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const sb = supabasePublic();
  const [{ data: participants }, { data: matches }, { data: preds }] =
    await Promise.all([
      sb.from("participants").select("id, display_name, avatar_emoji").order("display_name"),
      sb.from("matches").select("id, finished"),
      sb.from("predictions").select("participant_id"),
    ]);

  const totalMatches = matches?.length ?? 0;
  const finished = (matches ?? []).filter((m) => m.finished).length;

  const predCount = new Map<number, number>();
  for (const p of preds ?? []) {
    predCount.set(p.participant_id, (predCount.get(p.participant_id) ?? 0) + 1);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat
          label="Participantes"
          value={`${participants?.length ?? 0}`}
          sub={`de ${EXPECTED_PARTICIPANTS}`}
        />
        <Stat label="Partidos jugados" value={`${finished}`} sub={`de ${totalMatches}`} />
        <Stat
          label="Pronósticos"
          value={`${preds?.length ?? 0}`}
          sub={`de ${(participants?.length ?? 0) * totalMatches}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ActionCard
          href="/admin/participantes"
          emoji="👥"
          title="Participantes"
          desc={`Crear y editar los ${EXPECTED_PARTICIPANTS} perfiles`}
        />
        <ActionCard
          href="/admin/pronosticos"
          emoji="📥"
          title="Cargar pronósticos"
          desc="Subir el Excel de cada participante"
        />
        <ActionCard
          href="/admin/resultados"
          emoji="⚽"
          title="Ingresar resultados"
          desc="Marcadores de los partidos jugados"
        />
        <ActionCard
          href="/"
          emoji="🏆"
          title="Ver web pública"
          desc="Tabla de posiciones y comparativas"
        />
      </div>

      <section className="rounded-2xl border border-white/10 bg-surface p-4">
        <h2 className="mb-3 text-xs uppercase tracking-wide text-muted">
          Pronósticos cargados por participante
        </h2>
        {participants && participants.length > 0 ? (
          <ul className="space-y-1.5 text-sm">
            {participants.map((p) => {
              const n = predCount.get(p.id) ?? 0;
              const complete = n === totalMatches;
              return (
                <li key={p.id} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span>{p.avatar_emoji}</span>
                    {p.display_name}
                  </span>
                  <span className={complete ? "text-exacto" : "text-muted"}>
                    {complete ? "✓ " : ""}
                    {n}/{totalMatches}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted">
            Aún no hay participantes.{" "}
            <Link href="/admin/participantes" className="text-gold">
              Crear el primero →
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold text-gold">{value}</p>
      <p className="text-xs text-muted">{sub}</p>
    </div>
  );
}

function ActionCard({
  href,
  emoji,
  title,
  desc,
}: {
  href: string;
  emoji: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-white/10 bg-surface p-4 transition hover:border-gold/40 hover:bg-surface-2"
    >
      <span className="text-2xl">{emoji}</span>
      <span>
        <span className="block font-medium">{title}</span>
        <span className="block text-xs text-muted">{desc}</span>
      </span>
    </Link>
  );
}
