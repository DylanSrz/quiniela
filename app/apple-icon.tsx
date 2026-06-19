import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Icono para pantalla de inicio (iOS): balón estilizado sobre degradado de marca.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #3b82f6 0%, #18c964 55%, #ffce3a 100%)",
        }}
      >
        <div
          style={{
            width: 116,
            height: 116,
            borderRadius: "50%",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 64,
          }}
        >
          {/* Pentágono central del balón */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "26px solid transparent",
              borderRight: "26px solid transparent",
              borderBottom: "38px solid #0e1424",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
