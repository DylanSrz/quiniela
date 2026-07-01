import { supabasePublic } from "@/lib/supabase";
import {
  createParticipant,
  updateParticipant,
  deleteParticipant,
} from "../actions";
import ActionForm from "@/components/ActionForm";
import SubmitButton from "@/components/SubmitButton";

export const dynamic = "force-dynamic";

export default async function ParticipantesPage() {
  const sb = supabasePublic();
  const { data } = await sb.from("participants").select("*").order("display_name");
  const participants = data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
        Participantes
      </h1>

      <section className="rounded-2xl border border-white/10 bg-surface p-4">
        <h2 className="mb-3 text-xs uppercase tracking-wide text-muted">
          Nuevo participante
        </h2>
        <ActionForm
          action={createParticipant}
          resetOnSuccess
          className="flex flex-wrap items-end gap-2"
        >
          <div className="w-16">
            <label className="block text-xs text-muted">Avatar</label>
            <input
              name="avatar_emoji"
              defaultValue="⚽"
              maxLength={4}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-center text-lg outline-none focus:border-gold"
            />
          </div>
          <div className="min-w-40 flex-1">
            <label className="block text-xs text-muted">Nombre</label>
            <input
              name="display_name"
              required
              placeholder="Nombre del amigo"
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-gold"
            />
          </div>
          <SubmitButton className="rounded-lg bg-gold px-4 py-2 font-semibold text-black hover:brightness-110">
            Agregar
          </SubmitButton>
        </ActionForm>
      </section>

      <section className="space-y-2">
        {participants.length === 0 ? (
          <p className="text-sm text-muted">Todavía no hay participantes.</p>
        ) : (
          participants.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-end gap-2 rounded-xl border border-white/10 bg-surface p-3"
            >
              <ActionForm
                action={updateParticipant}
                className="flex flex-1 flex-wrap items-end gap-2"
              >
                <input type="hidden" name="id" value={p.id} />
                <div className="w-16">
                  <input
                    name="avatar_emoji"
                    defaultValue={p.avatar_emoji}
                    maxLength={4}
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-center text-lg outline-none focus:border-gold"
                  />
                </div>
                <input
                  name="display_name"
                  defaultValue={p.display_name}
                  required
                  className="min-w-40 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-gold"
                />
                <SubmitButton className="rounded-lg border border-white/15 px-3 py-2 text-sm hover:bg-white/5">
                  Guardar
                </SubmitButton>
              </ActionForm>
              <ActionForm action={deleteParticipant}>
                <input type="hidden" name="id" value={p.id} />
                <SubmitButton
                  pendingText="…"
                  className="rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                >
                  Eliminar
                </SubmitButton>
              </ActionForm>
            </div>
          ))
        )}
      </section>
      <p className="text-xs text-muted">
        Al eliminar un participante se borran también sus pronósticos.
      </p>
    </div>
  );
}
