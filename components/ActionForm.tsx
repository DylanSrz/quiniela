"use client";

import { useActionState, useEffect, useRef } from "react";
import type { ActionResult } from "@/lib/types";

type ServerAction = (
  prev: ActionResult | null,
  formData: FormData
) => Promise<ActionResult>;

// Envoltura de formulario que usa useActionState para mostrar feedback inline
// (éxito/error) en vez de la pantalla de error de Next.
export default function ActionForm({
  action,
  children,
  className,
  resetOnSuccess = false,
}: {
  action: ServerAction;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    action,
    null
  );
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form ref={ref} action={formAction} className={className}>
      {children}
      {state && (
        <p
          role="status"
          className={`mt-2 w-full rounded-lg px-3 py-1.5 text-xs ${
            state.ok
              ? "bg-exacto/15 text-exacto"
              : "bg-red-500/15 text-red-300"
          }`}
        >
          {state.ok ? `✓ ${state.message ?? "Listo"}` : `⚠ ${state.error}`}
        </p>
      )}
    </form>
  );
}
