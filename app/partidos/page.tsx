import { getMatches, getParticipants, getPredictions } from "@/lib/data";
import MatchesView from "@/components/MatchesView";
import LiveRefresh from "@/components/LiveRefresh";

export const revalidate = 30;

export default async function PartidosPage() {
  const [matches, participants, predictions] = await Promise.all([
    getMatches(),
    getParticipants(),
    getPredictions(),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <LiveRefresh />
      <h1 className="mb-1 font-display text-3xl font-bold uppercase tracking-wide">
        Partidos
      </h1>
      <p className="mb-5 text-sm text-muted">
        Toca un partido para ver los pronósticos de los 9 y sus puntos.
      </p>
      <MatchesView
        matches={matches}
        participants={participants}
        predictions={predictions}
      />
    </main>
  );
}
