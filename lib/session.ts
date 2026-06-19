// Sesión de admin firmada con HMAC-SHA256 (Web Crypto), válida tanto en el
// runtime de proxy.ts como en server components/actions. El payload lleva una
// expiración, así que la cookie no se puede reutilizar indefinidamente ni forjar
// sin conocer el secreto (ADMIN_SESSION_TOKEN).

export const SESSION_TTL_MS = 60 * 60 * 24 * 30 * 1000; // 30 días

export type SessionPayload = { exp: number };

function secret(): string {
  return process.env.ADMIN_SESSION_TOKEN ?? "";
}

function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
  const norm = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = norm.length % 4 ? 4 - (norm.length % 4) : 0;
  const bin = atob(norm + "=".repeat(pad));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmac(data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return new Uint8Array(sig);
}

// Comparación en tiempo (casi) constante para strings de igual longitud.
export function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function createSession(ttlMs = SESSION_TTL_MS): Promise<string> {
  const payload: SessionPayload = { exp: Date.now() + ttlMs };
  const body = b64urlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = b64urlEncode(await hmac(body));
  return `${body}.${sig}`;
}

export async function verifySession(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token || !secret()) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = b64urlEncode(await hmac(body));
  if (!timingSafeEqualStr(sig, expected)) return null;

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(b64urlDecode(body))
    ) as SessionPayload;
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
