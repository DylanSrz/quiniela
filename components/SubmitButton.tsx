"use client";

import { useFormStatus } from "react-dom";

// Botón de envío que refleja el estado pendiente del formulario que lo contiene.
export default function SubmitButton({
  children,
  pendingText,
  className,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`transition disabled:cursor-not-allowed disabled:opacity-60 ${className ?? ""}`}
    >
      {pending ? pendingText ?? "Guardando…" : children}
    </button>
  );
}
