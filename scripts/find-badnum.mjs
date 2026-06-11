import { readFileSync } from "node:fs";
import * as XLSX from "xlsx";

const file = process.argv[2] ?? "pronosticos/Jesus.xlsx";
const wb = XLSX.read(readFileSync(file), { type: "buffer" });
const sheet = wb.Sheets["Hoja1"] ?? wb.Sheets[wb.SheetNames[0]];
const grid = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

const BLOCKS = [
  { start: 2, left: "A", right: "G" },
  { start: 9, left: "B", right: "H" },
  { start: 16, left: "C", right: "I" },
  { start: 23, left: "D", right: "J" },
  { start: 30, left: "E", right: "K" },
  { start: 37, left: "F", right: "L" },
];
const bad = (raw) => {
  if (raw === null || raw === undefined || String(raw).trim() === "") return true;
  const n = Number(raw);
  return !(Number.isInteger(n) && n >= 0);
};

for (const b of BLOCKS) {
  for (let r = 1; r <= 6; r++) {
    const row = grid[b.start - 2 + r] ?? [];
    const filaExcel = b.start - 1 + r;
    // izquierda
    if (bad(row[5]) || bad(row[6]))
      console.log(`fila ${filaExcel} (Grupo ${b.left}): ${row[4]} [${JSON.stringify(row[5])}-${JSON.stringify(row[6])}] ${row[7]}`);
    // derecha
    if (bad(row[15]) || bad(row[16]))
      console.log(`fila ${filaExcel} (Grupo ${b.right}): ${row[14]} [${JSON.stringify(row[15])}-${JSON.stringify(row[16])}] ${row[17]}`);
  }
}
console.log("(fin)");
