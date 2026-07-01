import { describe, it, expect } from "vitest";
import { normalizeName, flagFor } from "./teams";

describe("normalizeName", () => {
  it("quita tildes, baja a minúsculas y colapsa espacios", () => {
    expect(normalizeName("  Curazao ")).toBe("curazao");
    expect(normalizeName("MÉXICO")).toBe("mexico");
    expect(normalizeName("Bosnia y  Herzegovina")).toBe("bosnia y herzegovina");
  });
});

describe("flagFor", () => {
  it("devuelve la bandera del equipo conocido (normalizando)", () => {
    expect(flagFor("México")).toBe("🇲🇽");
    expect(flagFor("  brasil ")).toBe("🇧🇷");
  });

  it("usa bandera neutral para equipos desconocidos", () => {
    expect(flagFor("Atlántida")).toBe("🏳️");
  });
});
