import { describe, it, expect } from "vitest";
import { fmtDate, fmtTime, fmtDateTime } from "./format";

const iso = "2026-06-19T20:00:00.000Z";

describe("format", () => {
  it("formatea fecha y hora como strings no vacíos", () => {
    expect(typeof fmtDate(iso)).toBe("string");
    expect(fmtDate(iso).length).toBeGreaterThan(0);
    expect(typeof fmtTime(iso)).toBe("string");
    expect(fmtTime(iso).length).toBeGreaterThan(0);
  });

  it("fmtDateTime combina fecha y hora con separador", () => {
    expect(fmtDateTime(iso)).toContain("·");
  });
});
