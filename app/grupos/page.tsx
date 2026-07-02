import { getMatches } from "@/lib/data";
import { computeGroupTables } from "@/lib/groups";
import { flagFor } from "@/lib/teams";
import LiveRefresh from "@/components/LiveRefresh";

export const revalidate = 30;

export default async function GruposPage() {
  const matches = await getMatches();
  const tables = computeGroupTables(matches);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <LiveRefresh />
      <h1 className="mb-1 font-display text-3xl font-bold uppercase tracking-wide">
        Grupos
      </h1>
      <p className="mb-5 text-sm text-muted">
        Clasificación real del torneo según los resultados cargados. Los dos
        primeros de cada grupo avanzan.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[...tables.entries()].map(([letter, rows]) => (
          <section
            key={letter}
            className="overflow-hidden rounded-2xl border border-white/10 bg-surface"
          >
            <h2 className="border-b border-white/10 px-3 py-2 font-display text-sm font-bold uppercase tracking-wide text-gold">
              Grupo {letter}
            </h2>
            <div className="thin-scroll overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-muted">
                    <th className="px-2 py-1.5 text-left font-medium">Equipo</th>
                    <th className="px-1 py-1.5 text-center font-medium" title="Jugados">PJ</th>
                    <th className="px-1 py-1.5 text-center font-medium" title="Ganados">G</th>
                    <th className="px-1 py-1.5 text-center font-medium" title="Empatados">E</th>
                    <th className="px-1 py-1.5 text-center font-medium" title="Perdidos">P</th>
                    <th className="px-1 py-1.5 text-center font-medium" title="Diferencia de gol">DIF</th>
                    <th className="px-2 py-1.5 text-center font-medium" title="Puntos">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr
                      key={r.team}
                      className={`border-t border-white/5 ${
                        i < 2 ? "bg-grass/5" : ""
                      }`}
                    >
                      <td className="whitespace-nowrap px-2 py-1.5">
                        <span className={i < 2 ? "text-exacto" : "text-muted"}>
                          {i + 1}
                        </span>{" "}
                        {flagFor(r.team)} {r.team}
                      </td>
                      <td className="px-1 py-1.5 text-center text-muted">{r.pj}</td>
                      <td className="px-1 py-1.5 text-center text-muted">{r.g}</td>
                      <td className="px-1 py-1.5 text-center text-muted">{r.e}</td>
                      <td className="px-1 py-1.5 text-center text-muted">{r.p}</td>
                      <td className="px-1 py-1.5 text-center tabular-nums">
                        {r.dif > 0 ? `+${r.dif}` : r.dif}
                      </td>
                      <td className="px-2 py-1.5 text-center font-display font-bold">
                        {r.pts}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
