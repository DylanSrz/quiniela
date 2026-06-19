"use client";

import { useActionState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { ActionResult } from "@/lib/types";

type ServerAction = (
  prev: ActionResult | null,
  formData: FormData
) => Promise<ActionResult>;

// Envoltura de formulario que usa useActionState para mostrar feedback animado
// inline (éxito/error) en vez de la pantalla de error de Next.
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
      <AnimatePresence>
        {state && (
          <motion.p
            key={state.ok ? "ok" : "err"}
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`mt-2 w-full rounded-lg px-3 py-1.5 text-xs ${
              state.ok
                ? "bg-exacto/15 text-exacto"
                : "bg-ca/15 text-[color:var(--color-ca)]"
            }`}
          >
            {state.ok ? `✓ ${state.message ?? "Listo"}` : `⚠ ${state.error}`}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}
