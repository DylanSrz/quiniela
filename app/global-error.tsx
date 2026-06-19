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
          background: "#060912",
          color: "#eaf1ff",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div>
          <p style={{ fontSize: 48 }}>⚽</p>
          <h1 style={{ textTransform: "uppercase" }}>Error inesperado</h1>
          <p style={{ color: "#93a4c4" }}>La aplicación encontró un problema.</p>
          <button
            onClick={reset}
            style={{
              marginTop: 16,
              borderRadius: 8,
              border: "none",
              background: "#ffce3a",
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
