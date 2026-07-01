"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a1410",
          color: "#eaf2ee",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div>
          <p style={{ fontSize: 48 }}>⚽</p>
          <h1 style={{ textTransform: "uppercase" }}>Error inesperado</h1>
          <p style={{ color: "#8aa399" }}>La aplicación encontró un problema.</p>
          <button
            onClick={reset}
            style={{
              marginTop: 16,
              borderRadius: 8,
              border: "none",
              background: "#f5c542",
              color: "#000",
              padding: "10px 16px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
