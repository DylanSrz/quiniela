import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Icono para pantalla de inicio (iOS): balón estilizado sobre el fondo de marca,
// coherente con app/icon.svg.
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
          background: "#0a1410",
        }}
      >
        <div
          style={{
            width: 132,
            height: 132,
            borderRadius: "50%",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Pentágono central del balón (aprox. con un triángulo) */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "30px solid transparent",
              borderRight: "30px solid transparent",
              borderBottom: "44px solid #0b1410",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
