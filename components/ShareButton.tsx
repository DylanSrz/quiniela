"use client";

import { useState } from "react";

type Props = { text: string };

// Comparte el ranking usando la hoja de compartir nativa (Web Share API,
// típico en móvil / PWA); si no está disponible, abre WhatsApp Web; y como
// último recurso copia el mensaje al portapapeles.
export default function ShareButton({ text }: Props) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    const nav =
      typeof navigator !== "undefined"
        ? (navigator as Navigator & {
            share?: (data: ShareData) => Promise<void>;
          })
        : null;

    if (nav?.share) {
      try {
        await nav.share({ text, url });
        return;
      } catch (err) {
        // AbortError = el usuario cerró la hoja; no es un fallo real.
        if (err instanceof DOMException && err.name === "AbortError") return;
        // Cualquier otro error → seguimos a los fallbacks.
      }
    }

    const message = `${text}\n${url}`;
    const isMobile =
      typeof navigator !== "undefined" &&
      /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    if (isMobile) {
      // Web share falló o no existe: abrir WhatsApp directamente.
      window.open(
        `https://wa.me/?text=${encodeURIComponent(message)}`,
        "_blank"
      );
      return;
    }

    // Escritorio: copiar al portapapeles con feedback breve.
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Última red: WhatsApp Web.
      window.open(
        `https://wa.me/?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    }
  }

  return (
    <button
      onClick={share}
      className="inline-flex items-center gap-2 rounded-lg border border-grass/40 bg-grass/10 px-3 py-1.5 text-sm font-medium text-grass transition hover:bg-grass/20"
    >
      <span>{copied ? "✓" : "📲"}</span>
      {copied ? "¡Copiado!" : "Compartir ranking"}
    </button>
  );
}
