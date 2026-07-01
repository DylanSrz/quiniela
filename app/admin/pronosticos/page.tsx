import { supabasePublic } from "@/lib/supabase";
import PronosticosUploader from "@/components/PronosticosUploader";

export const dynamic = "force-dynamic";

export default async function PronosticosPage() {
  const sb = supabasePublic();
  const [{ data: parts }, { data: ms }] = await Promise.all([
    sb.from("participants").select("*").order("display_name"),
    sb.from("matches").select("*").order("id"),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
          Cargar pronósticos
        </h1>
        <p className="mt-1 text-sm text-muted">
          Sube el Excel de cada participante. Se emparejan los 72 partidos por
          grupo, jornada y equipos; revisa la vista previa antes de confirmar.
        </p>
      </div>
      <PronosticosUploader
        participants={parts ?? []}
        matches={ms ?? []}
      />
    </div>
  );
}
