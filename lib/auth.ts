import { cookies } from "next/headers";

export const ADMIN_COOKIE = "qh_admin";

export function expectedToken(): string {
  return process.env.ADMIN_SESSION_TOKEN ?? "";
}

// Verifica la cookie de sesión del admin (para server components / actions).
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  return !!token && token === expectedToken();
}
