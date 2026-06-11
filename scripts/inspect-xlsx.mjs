import { readFileSync } from "node:fs";
import * as XLSX from "xlsx";

const file = process.argv[2] ?? "pronosticos/Dylan.xlsx";
const wb = XLSX.read(readFileSync(file), { type: "buffer" });
console.log("Hojas:", wb.SheetNames);
const sheet = wb.Sheets["Hoja1"] ?? wb.Sheets[wb.SheetNames[0]];
console.log("Ref:", sheet["!ref"]);

const grid = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
const COLS = "ABCDEFGHIJKLMNOPQR".split("");
grid.slice(0, 18).forEach((row, i) => {
  const cells = COLS.map((c, j) => `${c}:${String(row[j] ?? "").slice(0, 8)}`).join(" | ");
  console.log(`fila ${i + 1}  ${cells}`);
});
