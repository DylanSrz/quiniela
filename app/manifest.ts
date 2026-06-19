import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Quiniela Hunters · Mundial 2026",
    short_name: "Quiniela Hunters",
    description:
      "Quiniela privada de la fase de grupos del Mundial 2026 entre los Hunters.",
    start_url: "/",
    display: "standalone",
    background_color: "#060912",
    theme_color: "#060912",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
