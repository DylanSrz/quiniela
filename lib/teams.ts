// Normaliza nombres de equipo para emparejar (Excel <-> matches) y buscar banderas.
export function normalizeName(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // sin tildes
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// Bandera emoji por nombre (en español) normalizado.
const FLAGS: Record<string, string> = {
  mexico: "🇲🇽",
  sudafrica: "🇿🇦",
  "corea del sur": "🇰🇷",
  "republica checa": "🇨🇿",
  canada: "🇨🇦",
  "bosnia y herzegovina": "🇧🇦",
  "estados unidos": "🇺🇸",
  paraguay: "🇵🇾",
  catar: "🇶🇦",
  suiza: "🇨🇭",
  haiti: "🇭🇹",
  escocia: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  australia: "🇦🇺",
  turquia: "🇹🇷",
  alemania: "🇩🇪",
  curazao: "🇨🇼",
  brasil: "🇧🇷",
  marruecos: "🇲🇦",
  "paises bajos": "🇳🇱",
  japon: "🇯🇵",
  "costa de marfil": "🇨🇮",
  ecuador: "🇪🇨",
  suecia: "🇸🇪",
  tunez: "🇹🇳",
  espana: "🇪🇸",
  "cabo verde": "🇨🇻",
  belgica: "🇧🇪",
  egipto: "🇪🇬",
  "arabia saudita": "🇸🇦",
  uruguay: "🇺🇾",
  iran: "🇮🇷",
  "nueva zelanda": "🇳🇿",
  francia: "🇫🇷",
  senegal: "🇸🇳",
  irak: "🇮🇶",
  noruega: "🇳🇴",
  argentina: "🇦🇷",
  argelia: "🇩🇿",
  austria: "🇦🇹",
  jordania: "🇯🇴",
  portugal: "🇵🇹",
  "rd congo": "🇨🇩",
  inglaterra: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  croacia: "🇭🇷",
  ghana: "🇬🇭",
  panama: "🇵🇦",
  uzbekistan: "🇺🇿",
  colombia: "🇨🇴",
};

export function flagFor(team: string): string {
  return FLAGS[normalizeName(team)] ?? "🏳️";
}
