"use client";

type Props = { text: string };

// Comparte el ranking por WhatsApp (o copia el link si no hay app de WhatsApp).
export default function ShareButton({ text }: Props) {
  function share() {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    const msg = encodeURIComponent(`${text}\n${url}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }

  return (
    <button
      onClick={share}
      className="inline-flex items-center gap-2 rounded-lg border border-grass/40 bg-grass/10 px-3 py-1.5 text-sm font-medium text-grass transition hover:bg-grass/20"
    >
      <span>📲</span> Compartir ranking
    </button>
  );
}
